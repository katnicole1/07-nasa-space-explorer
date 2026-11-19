
/* NASA SPACE EXPLORER APP */

// Set up the date inputs
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

setupDateInputs(startInput, endInput);

// Find the gallery and button
const gallery = document.getElementById("gallery");
const getImagesButton = document.querySelector(".filters button");

// Random space facts - EXTRA CREDIT!
const facts = [
  "One day on Venus is longer than its year!",
  "Neutron stars can spin hundreds of times per second.",
  "The Sun contains about 99.8% of the solar system's mass.",
  "Footprints on the Moon can last millions of years.",
  "Jupiter has the shortest day of any planet!",
  "Sunlight takes about 8 minutes to reach Earth.",
  "Saturn is less dense than water!",
  "A year on Neptune lasts about 165 Earth years."
];

const factBox = document.createElement("div");
factBox.className = "space-fact";
factBox.textContent =
  "🌟 Did You Know? " +
  facts[Math.floor(Math.random() * facts.length)];

gallery.before(factBox);

// Fetch NASA images
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate || startDate > endDate) {
    alert("Please select a valid date range!");
    return;
  }

  gallery.innerHTML = "<p>🚀 Loading space photos...</p>";
  getImagesButton.disabled = true;

  try {
    const url =
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API request failed: " + response.status);
    }

    const data = await response.json();

    gallery.innerHTML = "";

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "space-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");

      // Handle both images and videos
      if (item.media_type === "image") {
        const image = document.createElement("img");
        image.src = item.url;
        image.alt = item.title;
        image.loading = "lazy";
        card.appendChild(image);
      } else {
        const videoBox = document.createElement("div");
        videoBox.className = "video-placeholder";
        videoBox.textContent = "🎬 Space Video";
        card.appendChild(videoBox);
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
      "Unable to load space photos. Please try again or choose a shorter date range.";
  } finally {
    getImagesButton.disabled = false;
  }
}

// Create popup modal
const modal = document.createElement("div");
modal.className = "space-modal";
modal.hidden = true;
modal.setAttribute("role", "dialog");
modal.setAttribute("aria-modal", "true");
modal.setAttribute("aria-label", "Space photo details");

document.body.appendChild(modal);

let lastFocusedElement = null;

function closeModal() {
  modal.hidden = true;
  modal.innerHTML = "";
  document.body.style.overflow = "";

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function openModal(item) {
  lastFocusedElement = document.activeElement;
  modal.innerHTML = "";

  const content = document.createElement("div");
  content.className = "modal-content";

  const closeButton = document.createElement("button");
  closeButton.className = "close-modal";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close popup");
  closeButton.addEventListener("click", closeModal);

  content.appendChild(closeButton);

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
    videoLink.textContent = "🎬 Watch this space video";
    content.appendChild(videoLink);
  }

  const title = document.createElement("h2");
  title.textContent = item.title;

  const date = document.createElement("p");
  date.textContent = item.date;

  const explanation = document.createElement("p");
  explanation.textContent = item.explanation;

  content.append(title, date, explanation);

  modal.appendChild(content);
  modal.hidden = false;

  document.body.style.overflow = "hidden";
  closeButton.focus();
}

// Close popup by clicking outside
modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close popup with Escape key
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

// Run when the button is clicked
getImagesButton.addEventListener("click", getSpaceImages);

