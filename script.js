const loadPets = () => {
  fetch("https://pet-adopt-website-picku.onrender.com/pets/petlist/")
    .then((res) => res.json())
    .then((data) => displayPets(data?.results));
};

const displayPets = (pets) => {
  const parent = document.getElementById("pet-grid");
  parent.innerHTML = '';

  pets?.forEach((pet) => {
    const div = document.createElement("div");
    div.classList.add("col-3", "pet-card");
    div.innerHTML = `
      <img src="${pet.image}" alt="${pet.name}" />
      <h2>${pet.name}</h2>
      <p>Species: ${pet.species}</p>
      <p>Status: ${pet.status}</p>
      <p>Rehoming Fee: ${pet.rehoming_fee}</p>
      <a href="details.html?id=${pet.id}" class="btn btn-grey">Details</a>
    `;
    parent.appendChild(div);
  });
};

const loadFilterOptions = (endpoint, parentId, filterFunction) => {
  fetch(`https://pet-adopt-website-picku.onrender.com/pets/${endpoint}/`)
    .then(res => res.json())
    .then(data => {
      const parent = document.getElementById(parentId);
      parent.innerHTML = '';

      data.forEach(item => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = item.name;
        a.addEventListener('click', () => filterFunction(item.slug));
        parent.appendChild(a);
      });
    });
};

const filterPets = (query) => {
  fetch(`https://pet-adopt-website-picku.onrender.com/pets/petlist/?${query}`)
    .then(res => res.json())
    .then(data => displayPets(data?.results));
};

const filterPetsBySpecies = (species) => filterPets(`species=${species}`);
const filterPetsBySex = (sex) => filterPets(`sex=${sex}`);
const filterPetsByColor = (color) => filterPets(`color=${color}`);
const filterPetsByBreed = (breed) => filterPets(`breed=${breed}`);
const filterPetsBySize = (size) => filterPets(`size=${size}`);
const filterPetsByStatus = (status) => filterPets(`status=${status}`);

document.addEventListener('DOMContentLoaded', () => {
  loadPets();
  loadFilterOptions('species', 'species-dropdown', filterPetsBySpecies);
  loadFilterOptions('sex', 'sex-dropdown', filterPetsBySex);
  loadFilterOptions('color', 'color-dropdown', filterPetsByColor);
  loadFilterOptions('breed', 'breed-dropdown', filterPetsByBreed);
  loadFilterOptions('size', 'size-dropdown', filterPetsBySize);
  loadFilterOptions('status', 'status-dropdown', filterPetsByStatus);
});
