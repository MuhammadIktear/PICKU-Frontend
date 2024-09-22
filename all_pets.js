document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem("user_id");
    console.log(`User ID: ${userId}`);
  
    const userApiUrl = `https://picku-a-pet-adoption-website.onrender.com/user/list/${userId}/`;
    const profileApiUrl = `https://picku-a-pet-adoption-website.onrender.com/user/UserProfileDetail/${userId}/`;
  
    const filters = {
      species: null,
      sex: null,
      color: null,
      breed: null,
      size: null,
      status: null
    };
  
    function fetchUserData() {
      fetch(userApiUrl)
        .then(response => response.json())
        .then(data => {
          document.getElementById('user-name').textContent = data.username || 'No Username';
          document.getElementById('user-email').textContent = data.email || 'No Email';
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
        });
  
      fetch(profileApiUrl)
        .then(response => response.json())
        .then(profile => {
          const profileImage = document.getElementById('profile-image');
          profileImage.src = profile.image || 'default-image-url'; 
          profileImage.alt = profile.username || 'Profile Image';
        })
        .catch(error => {
          console.error('Error fetching user profile data:', error);
        });
    }
  
    fetchUserData();
  
    const lookupData = {
      species: [],
      sex: [],
      color: [],
      breed: [],
      size: [],
      status: []
    };
  
    // Load lookup data
    function loadLookupData() {
      const speciesPromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/species/").then(res => res.json());
      const sexPromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/sex/").then(res => res.json());
      const colorPromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/color/").then(res => res.json());
      const breedPromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/breed/").then(res => res.json());
      const sizePromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/size/").then(res => res.json());
      const statusPromise = fetch("https://picku-a-pet-adoption-website.onrender.com/pets/status/").then(res => res.json());
  
      return Promise.all([speciesPromise, sexPromise, colorPromise, breedPromise, sizePromise, statusPromise])
        .then(([speciesData, sexData, colorData, breedData, sizeData, statusData]) => {
          lookupData.species = speciesData;
          lookupData.sex = sexData;
          lookupData.color = colorData;
          lookupData.breed = breedData;
          lookupData.size = sizeData;
          lookupData.status = statusData;
        })
        .catch((error) => {
          console.error("Error loading lookup data:", error);
        });
    }
  
    let currentPage = 1;
    const pageSize = 6;
    let searchQuery = '';
  
    // Load pet data and display it
    function loadPets(page = 1) {
      document.getElementById("spinner").style.display = "block";
  
      // Construct the filter query parameters
      const filterParams = Object.keys(filters)
        .filter(key => filters[key] !== null)
        .map(key => `${key}=${encodeURIComponent(filters[key])}`)
        .join('&');
  
      fetch(`https://picku-a-pet-adoption-website.onrender.com/pets/petlist/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(searchQuery)}&${filterParams}`)
        .then((res) => res.json())
        .then((data) => {
          const parent = document.getElementById("pet-grid");
          parent.innerHTML = '';
  
          if (data.results.length > 0) {
            document.getElementById("spinner").style.display = "none";
            document.getElementById("nodata").style.display = "none";
            displayPets(data.results);
            updatePagination(data.count, page);
          } else {
            document.getElementById("spinner").style.display = "none";
            document.getElementById("nodata").style.display = "block";
            document.getElementById("pagination").innerHTML = '';
          }
        })
        .catch((error) => {
          console.error("Error loading pets:", error);
          document.getElementById("nodata").style.display = "block";
        });
    }
  
    // Display pet cards
    function displayPets(pets) {
      const parent = document.getElementById("pet-grid");
  
      pets.forEach((pet) => {
        const div = document.createElement("div");
        div.classList.add("p-0", "col-3", "pet-card");
  
        if (!lookupData.species || !lookupData.status) {
          console.error("Lookup data is not yet loaded.");
          return;
        }
  
        const speciesIds = Array.isArray(pet.species) ? pet.species : [];
        const speciesNames = speciesIds.map(id => lookupData.species.find(species => species.id === id)?.name || 'Unknown').join(', ');
        const statusId = pet.status;
        const statusName = lookupData.status.find(status => status.id === statusId)?.name || 'Unknown';
  
        div.innerHTML = `
          <img src="${pet.image || 'default-image-url'}" alt="${pet.name}" />
          <h2>${pet.name}</h2>
          <p>Location: ${pet.location}</p>
          <p>Species: ${speciesNames}</p>
          <p>Status: ${statusName}</p>
          <p>Rehoming Fee: $${pet.rehoming_fee}</p>
          <a href="details.html?id=${pet.id}" class="btn btn-grey">Details</a>
          <div class="creator-info mx-3">
            <img src="" alt="Creator Image" style="border-radius: 50%; width: 40px; height: 40px; margin-right: 10px;" id="creator-image-${pet.created_by}" />
            <div class="creator-details">
              <div class="d-flex">
                <div>
                  <p class="p-1"><small>Created by</small></p>
                </div>
              <div style="margin-top: 9px">
                <small><a class="p-1" id="creator-name-${pet.created_by}" class="creator-name " style="cursor: pointer; color:#ce8460; " onmouseover="this.style.color='black';" onmouseout="this.style.color='#ce8460';">Creator Name</a></small>on <small style="color:#ce8460;">${new Date(pet.created_at).toLocaleDateString()}</small>
              </div>
              </div>
            </div>
          </div>
        `;
        parent.appendChild(div);
  
        // Fetch user information for the creator of the pet
        fetch(`https://picku-a-pet-adoption-website.onrender.com/user/UserProfileDetail/${pet.created_by}/`)
          .then((res) => res.json())
          .then((user) => {
            const userDiv = div.querySelector('.creator-info');
            userDiv.querySelector(`#creator-image-${pet.created_by}`).src = user.image || 'default-image-url'; // Set default image if none
            const creatorName = userDiv.querySelector(`#creator-name-${pet.created_by}`);
            creatorName.textContent = user.username || 'No Username';
            creatorName.href = `profile.html?id=${pet.created_by}`; // Set the link to the profile page
          })
          .catch((error) => {
            console.error("Error loading user information:", error);
          });
      });
    }
  
    // Update pagination controls
    function updatePagination(totalCount, currentPage) {
      const pageCount = Math.ceil(totalCount / pageSize);
      const pagination = document.getElementById('pagination');
      pagination.innerHTML = '';
  
      if (pageCount > 1) {
        if (currentPage > 1) {
          const prevItem = document.createElement('li');
          prevItem.classList.add('page-item');
          prevItem.innerHTML = `<a class="text-white bg-dark px-5 page-link" href="#" data-page="${currentPage - 1}">Previous</a>`;
          pagination.appendChild(prevItem);
        }
  
        for (let i = 1; i <= pageCount; i++) {
          const pageItem = document.createElement('li');
          pageItem.classList.add('page-item');
          pageItem.innerHTML = `<a class="text-dark bg-white px-5 page-link" href="#" data-page="${i}">${i}</a>`;
          if (i === currentPage) {
            pageItem.classList.add('active');
          }
          pagination.appendChild(pageItem);
        }
  
        if (currentPage < pageCount) {
          const nextItem = document.createElement('li');
          nextItem.classList.add('page-item');
          nextItem.innerHTML = `<a class="text-white bg-dark px-5 page-link" href="#" data-page="${currentPage + 1}">Next</a>`;
          pagination.appendChild(nextItem);
        }
  
        document.querySelectorAll('#pagination .page-link').forEach(link => {
          link.addEventListener('click', function (event) {
            event.preventDefault();
            const page = parseInt(link.getAttribute('data-page'));
            if (!isNaN(page) && page !== currentPage) {
              currentPage = page;
              loadPets(currentPage);
            }
          });
        });
      }
    }
  
    // Update filter values
    function updateFilter(type, value) {
      filters[type] = value;
      loadPets(currentPage);
    }
  
    // Load dropdowns
    function loadDropdown(url, filterId, filterType) {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const parent = document.getElementById(filterId);
          data.forEach((item) => {
            const li = document.createElement("li");
            li.classList.add("dropdown-item");
            li.textContent = item.name;
            li.onclick = () => {
              // Update the filter for the type and load pets
              const filterValue = item.slug; // Assuming the API returns a slug field
              updateFilter(filterType, filterValue);
            };
            parent.appendChild(li);
          });
        })
        .catch((error) => {
          console.error(`Error fetching data from ${url}:`, error);
        });
    }
  
    // Search handler
    function handleSearch() {
      const searchInput = document.getElementById('search').value;
      searchQuery = searchInput.trim();
      loadPets(currentPage);
    }
  
    // Initialize the page
    function initialize() {
      loadLookupData().then(() => {
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/species/", "filter1", "species");
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/sex/", "filter2", "sex");
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/color/", "filter3", "color");
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/breed/", "filter4", "breed");
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/size/", "filter5", "size");
        loadDropdown("https://picku-a-pet-adoption-website.onrender.com/pets/status/", "filter6", "status");
        loadPets(currentPage);
      });
  
      // Attach the search handler to the search button
      document.getElementById('search-button').addEventListener('click', handleSearch);
      document.getElementById('refresh-button').addEventListener('click', function() {
        // Reset filters and search query
        Object.keys(filters).forEach(key => filters[key] = null);
        searchQuery = '';
        loadPets(currentPage);
      });  
    }
  
    initialize();
  });
  