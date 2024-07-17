document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get("petId");

  if (petId) {
    loadPetDetails(petId);
  }
});

const apiUrl = "https://pet-adopt-website-picku.onrender.com/pets/petlist/";

function loadPetDetails(petId) {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const pet = data.results.find(p => p.id == petId);
      displayPetDetails(pet);
    })
    .catch(error => console.error('Error fetching pet details:', error));
}

function displayPetDetails(pet) {
  if (pet) {
    document.getElementById("pet-image").src = pet.image;
    document.getElementById("pet-name").textContent = pet.name;
    document.getElementById("pet-status").textContent = pet.status;
    document.getElementById("pet-description").textContent = pet.details;

    const petInfo = document.getElementById("pet-info");
    petInfo.innerHTML = `
      <tr><td>Species</td><td>${pet.species.join(', ')}</td></tr>
      <tr><td>Breed</td><td>${pet.breed.join(', ')}</td></tr>
      <tr><td>Color</td><td>${pet.color.join(', ')}</td></tr>
      <tr><td>Size</td><td>${pet.size.join(', ')}</td></tr>
      <tr><td>Sex</td><td>${pet.sex.join(', ')}</td></tr>
      <tr><td>Rehoming Fee</td><td>$${pet.rehoming_fee}</td></tr>
    `;
  } else {
    console.error('Pet not found');
  }
}
