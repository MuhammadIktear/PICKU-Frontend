// Function to fetch data from API
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

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}`, error);
    throw error; // Re-throw error for handling in calling function
  }
};

// Function to populate select dropdowns
const populateSelect = (selectId, data) => {
  const select = document.getElementById(selectId);
  if (select) {
    select.innerHTML = '<option value="">Select</option>';
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      select.appendChild(option);
    });
  } else {
    console.error(`Element with ID ${selectId} not found`);
  }
};

// Function to display pets in pet grid
const displayPets = (pets) => {
  const petGrid = document.getElementById("pet-grid");
  petGrid.innerHTML = "";

  pets.forEach((pet) => {
    const speciesName =
      dataLookup.species.find((item) => item.id === pet.species)?.name ||
      "Unknown";
    const statusName =
      dataLookup.statuses.find((item) => item.id === pet.status)?.name ||
      "Unknown";

    const card = `
      <div class="pet-card">
        <img src="${pet.image}" alt="${pet.name}" />
        <h3>${pet.name}</h3>
        <p>${speciesName}</p>
        <p>${statusName}</p>
        <p>ID: ${pet.id}</p>
        <a href="details.html?id=${pet.id}" class="btn btn-grey">Details</a>
        <div class="card__footer"></div>
      </div>
    `;
    petGrid.innerHTML += card;
  });
};

// Function to filter pets based on selected criteria
const filterPets = async () => {
  const species = document.getElementById("species").value;
  const breed = document.getElementById("breeds").value;
  const color = document.getElementById("colors").value;
  const size = document.getElementById("sizes").value;
  const sex = document.getElementById("sexes").value;
  const status = document.getElementById("statuses").value;

  const filters = { species, breed, color, size, sex, status };
  const query = Object.keys(filters)
    .filter((key) => filters[key])
    .map((key) => `${key}=${filters[key]}`)
    .join("&");

  try {
    const pets = await fetchData(
      `https://picku.onrender.com/api/pets/?${query}`
    );
    displayPets(pets);
  } catch (error) {
    console.error("Error filtering pets:", error);
    // Handle error or display error message
  }
};

// Event listener for filter button
document.querySelector(".filter-button").addEventListener("click", filterPets);

// Event listener for reset button
document.querySelector(".reset-button").addEventListener("click", async () => {
  document
    .querySelectorAll(".filter-section select")
    .forEach((select) => (select.value = ""));

  try {
    const pets = await fetchData("https://picku.onrender.com/api/pets/");
    displayPets(pets);
  } catch (error) {
    console.error("Error resetting filters:", error);
    // Handle error or display error message
  }
});

// Initialize dataLookup object and populate select dropdowns on DOMContentLoaded
const dataLookup = {
  species: [],
  breeds: [],
  colors: [],
  sizes: [],
  sexes: [],
  statuses: [],
};

document.addEventListener("DOMContentLoaded", async () => {
  const endpoints = {
    species: "https://picku.onrender.com/api/species/",
    breeds: "https://picku.onrender.com/api/breeds/",
    colors: "https://picku.onrender.com/api/colors/",
    sizes: "https://picku.onrender.com/api/sizes/",
    sexes: "https://picku.onrender.com/api/sexes/",
    statuses: "https://picku.onrender.com/api/statuses/",
  };

  try {
    for (const [key, url] of Object.entries(endpoints)) {
      const data = await fetchData(url);
      dataLookup[key] = data;
      populateSelect(key, data);
    }

    const pets = await fetchData("https://picku.onrender.com/api/pets/");
    displayPets(pets);
  } catch (error) {
    console.error("Error loading initial data:", error);
    // Handle error or display error message
  }
});
