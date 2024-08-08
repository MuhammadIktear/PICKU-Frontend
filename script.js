document.addEventListener('DOMContentLoaded', function () {
  const userId = localStorage.getItem("user_id");
  console.log(`User ID: ${userId}`);

  const userApiUrl = `https://pet-adopt-website-picku.onrender.com/user/list/${userId}/`;
  const profileApiUrl = `https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`;
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
    status: []
  };

  function loadLookupData() {
    const speciesPromise = fetch("https://pet-adopt-website-picku.onrender.com/pets/species/").then(res => res.json());
    const statusPromise = fetch("https://pet-adopt-website-picku.onrender.com/pets/status/").then(res => res.json());

    return Promise.all([speciesPromise, statusPromise])
      .then(([speciesData, statusData]) => {
        lookupData.species = speciesData;
        lookupData.status = statusData;
      })
      .catch((error) => {
        console.error("Error loading lookup data:", error);
      });
  }

  let currentPage = 1;
  const pageSize = 6;

  function loadPets(page = 1, search = '') {
    document.getElementById("spinner").style.display = "block";
    fetch(`https://pet-adopt-website-picku.onrender.com/pets/petlist/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`)
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

  function displayPets(pets) {    
    const parent = document.getElementById("pet-grid");

    pets.forEach((pet) => {
      const div = document.createElement("div");
      div.classList.add("col-3", "pet-card");

      if (!lookupData.species || !lookupData.status) {
        console.error("Lookup data is not yet loaded.");
        return;
      }

      const speciesIds = Array.isArray(pet.species) ? pet.species : [];
      const speciesNames = speciesIds.map(id => lookupData.species.find(species => species.id === id)?.name || 'Unknown').join(', ');
      const statusId = pet.status;
      const statusName = lookupData.status.find(status => status.id === statusId)?.name || 'Unknown';

      div.innerHTML = `
        <img src="${pet.image}" alt="${pet.name}" />
        <h2>${pet.name}</h2>
        <p>Species: ${speciesNames}</p>
        <p>Status: ${statusName}</p>
        <p>Rehoming Fee: $${pet.rehoming_fee}</p>
        <a href="details.html?id=${pet.id}" class="btn btn-grey">Details</a>
        <div class="creator-info mx-3">
          <img src="" alt="Creator Image" style="border-radius: 50%; width: 40px; height: 40px; margin-right: 10px;" id="creator-image-${pet.created_by}" />
          <div class="creator-details">
            <div class="d-flex">
              <div>
                <p class="p-2" >Created by</p>
              </div>
              <div style="margin-top: 12px">
                <a class="p-1" id="creator-name-${pet.created_by}" class="creator-name" style="cursor: pointer;" onmouseover="this.style.color='black';" onmouseout="this.style.color='blue';" >Creator Name</a>
              </div>
            </div>
          </div>
        </div>
      `;
      parent.appendChild(div);

      // Fetch user information for the creator of the pet
      fetch(`https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${pet.created_by}/`)
        .then((res) => res.json())
        .then((user) => {
          const userDiv = div.querySelector('.creator-info');
          userDiv.querySelector(`#creator-image-${pet.created_by}`).src = user.image || 'default-image-url'; 
          const creatorName = userDiv.querySelector(`#creator-name-${pet.created_by}`);
          creatorName.textContent = user.username || 'No Username';
          creatorName.onclick = () => window.location.href = `profile.html?id=${pet.created_by}`; 
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
        prevItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}" onclick="window.location.href='#'">Previous</a>`;
        pagination.appendChild(prevItem);
      }

      for (let i = 1; i <= pageCount; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        if (i === currentPage) {
          pageItem.classList.add('active');
        }
        pagination.appendChild(pageItem);
      }

      if (currentPage < pageCount) {
        const nextItem = document.createElement('li');
        nextItem.classList.add('page-item');
        nextItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>`;
        pagination.appendChild(nextItem);
      }
    }
  }

  // Handle page clicks
  document.getElementById('pagination').addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      event.preventDefault();
      const page = parseInt(event.target.getAttribute('data-page'), 10);
      if (!isNaN(page)) {
        currentPage = page;
        loadPets(page);
      }
    }
  });

  // Load dropdown filters
  function loadDropdown(url, filterId) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const parent = document.getElementById(filterId);
        data.forEach((item) => {
          const li = document.createElement("li");
          li.classList.add("dropdown-item");
          li.textContent = item.name;
          li.onclick = () => loadPets(item.name);
          parent.appendChild(li);
        });
      })
      .catch((error) => {
        console.error(`Error fetching data from ${url}:`, error);
      });
  }

  function handleSearch() {
    const value = document.getElementById("search").value;
    loadPets(currentPage, value);
  }

  // Initialize the page
  function initialize() {
    loadLookupData().then(() => {
      handleSearch();
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/species/", "filter1");
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/sex/", "filter2");
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/color/", "filter3");
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/breed/", "filter4");
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/size/", "filter5");
      loadDropdown("https://pet-adopt-website-picku.onrender.com/pets/status/", "filter6");
    });
  }

 
  const loadReview = () => {
    fetch("https://pet-adopt-website-picku.onrender.com/pets/petlist/")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        if (data.results && Array.isArray(data.results)) {
          displayReview(data.results);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching reviews:', error));
  };
  
  const displayReview = (pets) => {
    const parent = document.getElementById("review-container");
    parent.innerHTML = ''; 
  
    pets.forEach((pet) => {
      if (pet.reviews && Array.isArray(pet.reviews)) {
        pet.reviews.forEach((review) => {
          const div = document.createElement("div");
          div.classList.add("review-card");
  
          const img = document.createElement("img");
          img.src = pet.image;
          img.alt = pet.name;
          img.style.cursor = "pointer"; 

          // Wrap the image with a clickable link
          const link = document.createElement("a");
          link.href = `details.html?id=${pet.id}`;
          link.appendChild(img);
          
          div.appendChild(link); 
  
          div.innerHTML += `
            <p style="color:dark">${review.body}</p>
            <small>Reviewed by ${review.author_username}</small> on <small>${new Date(review.created_at).toLocaleDateString()}</small>
          `;
  
          parent.appendChild(div);
        });
      }
    });
  
    if (parent.children.length === 0) {
      parent.innerHTML = '<p>No reviews yet.</p>';
    }
  };
  
  loadReview();
  initialize();
});
