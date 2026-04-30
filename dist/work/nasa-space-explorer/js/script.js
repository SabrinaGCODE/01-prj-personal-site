const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const button = document.getElementById("getImagesBtn");
const gallery = document.getElementById("gallery");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");

setupDateInputs(startInput, endInput);

const apiKey = "GqmbV8Vta16oGFdNoZifHmTQbksQRzxuGZZgGGG9";

button.addEventListener("click", async function () {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Please select both dates first.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = `
    <div class="placeholder">
      <p>Loading space photos...</p>
    </div>
  `;

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("NASA response:", data);

    if (!response.ok || data.error || data.code) {
      gallery.innerHTML = `
        <div class="placeholder">
          <p>${data.msg || data.error?.message || "NASA API request failed."}</p>
        </div>
      `;
      return;
    }

    gallery.innerHTML = "";

    const items = Array.isArray(data) ? data.reverse() : [data];
    let imageCount = 0;

    items.forEach(function (item) {
      if (item.media_type === "image") {
        imageCount++;

        const card = document.createElement("div");
        card.classList.add("gallery-item");

        card.innerHTML = `
          <img src="${item.url}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        `;

        card.addEventListener("click", function () {
          modal.classList.remove("hidden");
          modalImage.src = item.url;
          modalImage.alt = item.title;
          modalTitle.textContent = item.title;
          modalDate.textContent = item.date;
          modalExplanation.textContent = item.explanation;
        });

        gallery.appendChild(card);
      }
    });

    if (imageCount === 0) {
      gallery.innerHTML = `
        <div class="placeholder">
          <p>No image entries were found for this date range.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Something went wrong. Check the browser console.</p>
      </div>
    `;
  }
});

closeModal.addEventListener("click", function () {
  modal.classList.add("hidden");
});

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});