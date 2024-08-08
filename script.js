const imagesContainer = document.querySelector(".images-container");
const inputField = document.querySelector(".input-text");
const spinner = document.querySelector(".spinner-border");
const errorPopup = document.querySelector(".alert-danger");

const showErrorPopup = (errorMessage) => {
  errorPopup.classList.remove("hidden");
  errorPopup.innerHTML = errorMessage;
};
const hideErrorPopup = () => errorPopup.classList.add("hidden");
const showSpinner = () => spinner.classList.remove("hidden");
const hideSpinner = () => spinner.classList.add("hidden");

const validateSearch = (status) => {
  if (status >= 400 && status <= 499) {
    throw new Error("Bad request. Please try again");
  } else if (status >= 500 && status <= 599) {
    throw new Error("Server error");
  } else {
    throw new Error("Unknown error");
  }
};

const debounce = (callBack, delay = 1000) => {
  let timeout;
  return (query) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callBack(query);
    }, delay);
  };
};

const fetchImages = () => {
  let page = 1;
  return async (query, resultsPerQuery = 15) => {
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=45317413-196ee31a94ed30f1c714ff998&q=${query}&per_page=${resultsPerQuery}&page=${page}`
      );
      page++;
      if (response.ok) {
        return await response.json();
      } else {
        validateSearch(response.status);
      }
    } catch (error) {
      showErrorPopup(error.message);
    }
  };
};

const getImagesContent = fetchImages();

const renderImages = debounce(async (query) => {
  const images = await getImagesContent(query, 20);
  if (query === "") {
    hideSpinner();
    hideErrorPopup();
    return;
  }

  if (!images) {
    hideSpinner();
    return;
  }

  if (!images.hits?.length) {
    imagesContainer.innerHTML = "No images found";
    hideSpinner();
    hideErrorPopup();
    return;
  }

  images?.hits?.forEach((item) => {
    const img = document.createElement("img");
    img.classList.add("image");
    img.src = item.webformatURL;
    imagesContainer.appendChild(img);
  });

  hideSpinner();
  hideErrorPopup();
});

inputField.addEventListener("input", (event) => {
  showSpinner();
  imagesContainer.innerHTML = null;
  renderImages(event.target.value);
});

window.addEventListener("scroll", () => {
  const viewportHeight = document.documentElement.clientHeight;
  const scrolledY = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;
  if (Math.ceil(scrolledY + viewportHeight) >= pageHeight) {
    showSpinner();
    renderImages(inputField.value);
  }
});
