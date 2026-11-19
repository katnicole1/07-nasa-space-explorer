
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

setupDateInputs(startInput, endInput);

// Find the gallery and button
const gallery = document.getElementById("gallery");
const getImagesButton =
  document.getElementById("getImagesBtn") ||
  document.querySelector("button");

// Random space facts (extra credit!)
const facts = [
  "One day on Venus is longer than its year!",
  "Neutron stars can spin hundreds of times per second.",
  "The Sun contains about 99.8% of the solar system's mass.",
  "Footprints on the Moon can last millions of years.",
  "Jupiter has the shortest day of any planet!",
  "Light from the Sun takes about 8 minutes to reach Earth."
];

const factBox = document.createElement("div");
factBox.className = "space-fact";
factBox.textContent =
  "🌟 Did You Know? " +
  facts[Math.floor(Math.random() * facts.length)];

if (gallery) {
  gallery.before(factBox);
}

// Fetch images from NASA
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate || startDate > endDate) {
    alert("Please choose a valid date range.");
    return;
  }

  if (!gallery) {
    console.error("Gallery element not found.");
    return;
  }

  gallery.innerHTML = "<p>🚀 Loading space photos...</p>";

  try {
    const url =
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API request failed.");
    }

    const data = await response.json();
    gallery.innerHTML = "";

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "space-card";
      card.tabIndex = 0;

      if (item.media_type === "image") {
        const image = document.createElement("img");
        image.src = item.url;
        image.alt = item.title;
        image.loading = "lazy";
        card.appendChild(image);
      } else {
        const videoLabel = document.createElement("div");
        videoLabel.className = "video-placeholder";
        videoLabel.textContent = "🎬 Space Video";
        card.appendChild(videoLabel);
      }

      const title = document.createElement("h3");
      title.textContent = item.title;

      const date = document.createElement("p");
      date.textContent = item.date;

      card.append(title, date);
      card.addEventListener("click", () => openModal(item));
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(item);
        }
      });

      gallery.appendChild(card);
    });

    if (data.length === 0) {
      gallery.textContent = "No space photos found.";
    }
  } catch (error) {
    console.error(error);
    gallery.textContent =
      "Unable to load photos. Please try a shorter date range.";
  }
}

// Create the image popup
const modal = document.createElement("div");
modal.className = "space-modal";
modal.setAttribute("role", "dialog");
modal.setAttribute("aria-modal", "true");
modal.setAttribute("aria-label", "Space image details");
modal.hidden = true;
document.body.appendChild(modal);

function closeModal() {
  modal.hidden = true;
  modal.innerHTML = "";
  document.body.style.overflow = "";
}

function openModal(item) {
  modal.innerHTML = "";

  const content = document.createElement("div");
  content.className = "modal-content";

  const close = document.createElement("button");
  close.className = "close-modal";
  close.textContent = "×";
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", closeModal);
  content.appendChild(close);

  if (item.media_type === "image") {
    const image = document.createElement("img");
    image.src = item.hdurl || item.url;
    image.alt = item.title;
    content.appendChild(image);
  } else {
    const videoLink = document.createElement("a");
    videoLink.href = item.url;
    videoLink.target = "_blank";
    videoLink.rel = "noopener noreferrer";
    videoLink.textContent = "🎬 Watch NASA's space video";
    content.appendChild(videoLink);
  }

  const heading = document.createElement("h2");
  heading.textContent = item.title;

  const date = document.createElement("p");
  date.textContent = item.date;

  const explanation = document.createElement("p");
  explanation.textContent = item.explanation;

  content.append(heading, date, explanation);
  modal.appendChild(content);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  close.focus();
}

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

if (getImagesButton) {
  getImagesButton.addEventListener("click", getSpaceImages);
}
