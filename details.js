document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get("id");

  if (petId) {
    const pet = await fetchData(`https://picku.onrender.com/pets/${petId}/`);
    if (pet) {
      displayPetDetails(pet);
    }
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
      errorMessageElement.textContent = "Error fetching data. Please try again.";
    }
    return null;
  }
};

const displayPetDetails = (pet) => {
  if (pet) {
    document.getElementById("pet-name").textContent = pet.name;
    document.getElementById("pet-status").textContent = pet.status.name; // Access the name property
    document.getElementById("pet-description").textContent = pet.details;

    const petInfo = `
        <tr><th>Breed</th><td>${pet.breed.name}</td></tr>
        <tr><th>Color</th><td>${pet.color.name}</td></tr>
        <tr><th>Age</th><td>${pet.age} years old</td></tr>
        <tr><th>Sex</th><td>${pet.sex.name}</td></tr>
        <tr><th>Arrived Date</th><td>${new Date(pet.created_at).toLocaleDateString()}</td></tr>
        <tr><th>Size</th><td>${pet.size.name}</td></tr>
        <tr><th>Location</th><td>${pet.location}</td></tr>
        <tr><th>Rehoming Fee</th><td>£${pet.rehoming_fee}</td></tr>
      `;
    document.getElementById("pet-info").innerHTML = petInfo;

    const imageUrl = `https://picku.onrender.com${pet.image}`;
    const petImage = document.getElementById("pet-image");
    petImage.src = imageUrl;
    petImage.alt = pet.name;
  } else {
    console.error("Pet data is missing");
  }
};
