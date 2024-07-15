document.addEventListener("DOMContentLoaded", () => {
  const speciesSelect = document.getElementById("species");
  const breedSelect = document.getElementById("breeds");
  const colorSelect = document.getElementById("colors");
  const sizeSelect = document.getElementById("sizes");
  const sexSelect = document.getElementById("sexes");
  const statusSelect = document.getElementById("statuses");
  const resultsContainer = document.getElementById("pet-grid");
  const filterButton = document.querySelector(".filter-button");
  const resetButton = document.querySelector(".reset-button");

  const API_ENDPOINTS = {
    pets: "http://127.0.0.1:8000/pet/pets/",
    species: "http://127.0.0.1:8000/api/species/",
    breeds: "http://127.0.0.1:8000/api/breeds/",
    colors: "http://127.0.0.1:8000/api/colors/",
    sizes: "http://127.0.0.1:8000/api/sizes/",
    sexes: "http://127.0.0.1:8000/api/sexes/",
    statuses: "http://127.0.0.1:8000/api/statuses/",
  };

  const fetchOptions = async (url, selectElement) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      data.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.name;
        opt.text = option.name;
        selectElement.appendChild(opt);
      });
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const loadFilters = () => {
    fetchOptions(API_ENDPOINTS.species, speciesSelect);
    fetchOptions(API_ENDPOINTS.breeds, breedSelect);
    fetchOptions(API_ENDPOINTS.colors, colorSelect);
    fetchOptions(API_ENDPOINTS.sizes, sizeSelect);
    fetchOptions(API_ENDPOINTS.sexes, sexSelect);
    fetchOptions(API_ENDPOINTS.statuses, statusSelect);
  };

  const displayResults = (pets) => {
    resultsContainer.innerHTML = "";
    pets.forEach((pet) => {
      const petCard = document.createElement("div");
      petCard.className = "pet-card";
      const imageUrl = `http://127.0.0.1:8000${pet.image}`; // Adjust the path to image
      petCard.innerHTML = `
        <img src="${imageUrl}" alt="${pet.name}">
        <h2>${pet.name}</h2>
        <p>Species: ${pet.species.name}</p>
        <p>Status: ${pet.status.name}</p>
        <p>Rehoming Fee: ${pet.rehoming_fee}$</p>
        <a href="details.html?id=${pet.id}" class="btn btn-grey">Details</a>
      `;
      resultsContainer.appendChild(petCard);
    });
  };

  const searchPets = async () => {
    const params = new URLSearchParams();
    const species = speciesSelect.value;
    const breed = breedSelect.value;
    const color = colorSelect.value;
    const size = sizeSelect.value;
    const sex = sexSelect.value;
    const status = statusSelect.value;

    if (species) params.append("species", species);
    if (breed) params.append("breed", breed);
    if (color) params.append("color", color);
    if (size) params.append("size", size);
    if (sex) params.append("sex", sex);
    if (status) params.append("status", status);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.pets}?${params.toString()}`
      );
      const data = await response.json();
      displayResults(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const resetFilters = async () => {
    document
      .querySelectorAll(".filter-section select")
      .forEach((select) => (select.value = ""));

    try {
      const response = await fetch(`${API_ENDPOINTS.pets}`);
      const data = await response.json();
      displayResults(data);
    } catch (error) {
      console.error("Error resetting filters:", error);
    }
  };

  filterButton.addEventListener("click", searchPets);
  resetButton.addEventListener("click", resetFilters);

  const loadInitialData = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.pets}`);
      const data = await response.json();
      displayResults(data);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  loadFilters();
  loadInitialData();
});
