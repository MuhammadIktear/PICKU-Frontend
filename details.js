document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get("id");

  if (petId) {
    const pet = await fetchData(
      `https://picku.onrender.com/api/pets/${petId}/`
    );
    displayPetDetails(pet);
  } else {
    console.error("Pet ID not found in the URL");
  }
});

const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched from ${url}`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}`, error);
    const errorMessageElement = document.getElementById("error-message");
    if (errorMessageElement) {
      errorMessageElement.textContent =
        "Error fetching data. Please try again.";
    }
    return null;
  }
};

const displayPetDetails = (pet) => {
  if (pet) {
    document.getElementById("pet-name").textContent = pet.name;
    document.getElementById("pet-status").textContent = pet.status;
    document.getElementById("pet-description").textContent = pet.details;

    const petInfo = `
        <tr><th>Breed</th><td>${pet.breed}</td></tr>
        <tr><th>Colour</th><td>${pet.color}</td></tr>
        <tr><th>Age</th><td>${pet.age} years old</td></tr>
        <tr><th>Sex</th><td>${pet.sex}</td></tr>
        <tr><th>Arrived Date</th><td>${new Date(
          pet.created_at
        ).toLocaleDateString()}</td></tr>
        <tr><th>Size</th><td>${pet.size}</td></tr>
        <tr><th>Location</th><td>${pet.location}</td></tr>
        <tr><th>Rehoming Fee</th><td>£${pet.rehoming_fee}</td></tr>
      `;
    document.getElementById("pet-info").innerHTML = petInfo;

    const carouselImages = document.getElementById("carousel-images");
    pet.images.forEach((imgSrc, index) => {
      const isActive = index === 0 ? "active" : "";
      const item = `
          <div class="carousel-item ${isActive}">
            <img src="${imgSrc}" class="d-block w-100 rounded shadow" alt="Pet Image" />
          </div>
        `;
      carouselImages.innerHTML += item;
    });
  } else {
    console.error("Pet data is missing");
  }
};
