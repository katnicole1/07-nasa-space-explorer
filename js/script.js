
/* NASA SPACE EXPLORER APP */

// Date inputs
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

setupDateInputs(startInput, endInput);

const gallery = document.getElementById("gallery");
const getImagesButton = document.querySelector(".filters button");

// EXTRA CREDIT: Random space facts
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

// NASA's new API uses YYMMDD dates
function formatDate(date) {
  return date.slice(2).replaceAll("-", "");
}

// Remove HTML formatting from NASA explanations
function cleanText(value) {
  const element = document.createElement("div");
  element.innerHTML = value || "";
  return element.textContent.trim();
}

// Retrieve space photos
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate || startDate > endDate) {
    alert("Please select a valid date range!");
    return;
  }

  const days = Math.round(
    (Date.parse(endDate) - Date.parse(startDate)) /
    86400000
  ) + 1;

  if (days > 25) {
    alert("Please select 25 days or fewer.");
    return;
  }

  gallery.textContent = "🚀 Loading space photos...";
  getImagesButton.disabled = true;

  try {
    const url =
      "https://science.nasa.gov/wp-json/wp/v2/apod-basic" +
      "?date_from=" + formatDate(startDate) +
      "&date_to=" + formatDate(endDate) +
      "&per_page=25";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API error: " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected NASA API response.");
    }

    gallery.innerHTML = "";

    if (data.length === 0) {
      gallery.textContent = "No photos found for these dates.";
      return;
    }

    data.sort((a, b) => a.date.localeCompare(b.date));

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "space-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");

      // EXTRA CREDIT: Handle images and videos
      if (item.media_type === "image" && item.hdurl) {
        const image = document.createElement("img");
        image.src = item.hdurl;
        image.alt = item.alt || item.title;
        image.loading = "lazy";

        image.onerror = () => {
          image.remove();
          const fallback = document.createElement("div");
          fallback.className = "video-placeholder";
          fallback.textContent = "🌌 View on NASA";
          card.prepend(fallback);
        };

        card.appendChild(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "video-placeholder";
        placeholder.textContent =
          item.media_type === "image"
            ? "🌌 View on NASA"
            : "🎬 Space Video";
        card.appendChild(placeholder);
      }

      const title = document.createElement("h3");
      title.textContent = item.title || "NASA Space Photo";

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

  } catch (error) {
    console.error("NASA Error:", error);
    gallery.textContent =
      "Unable to load space photos. " + error.message;
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

  // Display large image or NASA page link
  if (item.media_type === "image" && item.hdurl) {
    const image = document.createElement("img");
    image.src = item.hdurl;
    image.alt = item.alt || item.title;
    image.onerror = () => {
      image.remove();
    };
    content.appendChild(image);
  }

  const title = document.createElement("h2");
  title.textContent = item.title || "NASA Space Photo";

  const date = document.createElement("p");
  date.textContent = item.date;

  const explanation = document.createElement("p");
  explanation.textContent = cleanText(item.explanation);

  content.append(title, date, explanation);

  // Direct link to NASA article
  if (item.permalink || item.url) {
    const nasaLink = document.createElement("a");
    nasaLink.href = item.permalink || item.url;
    nasaLink.target = "_blank";
    nasaLink.rel = "noopener noreferrer";
    nasaLink.textContent =
      item.media_type === "image"
        ? "🌌 View original on NASA"
        : "🎬 Watch on NASA";

    content.appendChild(nasaLink);
  }

  modal.appendChild(content);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

// Close by clicking outside
modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close with Escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

// Button click
getImagesButton.addEventListener("click", getSpaceImages);
