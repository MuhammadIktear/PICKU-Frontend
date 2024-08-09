const loadUserAccount = () => {
    const userId = localStorage.getItem("user_id");
    console.log(`User ID: ${userId}`);
    let fetchId = new URLSearchParams(window.location.search).get("id");
    if (!fetchId || fetchId === userId) {
        console.error("No user ID found.");
        document.querySelector('.user-balance').style.display = 'block';
        document.querySelector('.update-profile').style.display = 'block';
        document.querySelector('.add-pet').style.display = 'block';
        fetchId = userId;
    }

    fetch(`https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${fetchId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            const balance = data.balance !== undefined ? data.balance : 'N/A';
            const balanceElement = document.getElementById('user-balance');
            
            if (fetchId != userId) {
                balanceElement.style.display = 'none';
            } else {
                balanceElement.textContent = `$${balance}`;
            }
            
            document.getElementById("user-name").textContent = data.username ? data.username : 'Username not available';
            document.getElementById("profile-image").src = data.image ? data.image : 'D:\User\Documents\OIP (3).jpeg';
            document.getElementById("user-email").textContent = data.email ? data.email : 'Email not available';
            
        })
        .catch(error => {
            console.error("Error fetching user account data:", error);
            document.getElementById("user-balance").textContent = 'N/A';
            document.getElementById("user-name").textContent = 'Error loading username';
            document.getElementById("profile-image").src = 'D:\User\Documents\OIP (3).jpeg';
            document.getElementById("user-location").textContent = 'N/A';
        });
};

async function fetchAndDisplayPets() {
    try {
        let fetchId = new URLSearchParams(window.location.search).get("id");
        const userId = localStorage.getItem("user_id");
        if (!fetchId || fetchId === userId) {
            const adoptedPetsAPI = `https://pet-adopt-website-picku.onrender.com/pets/petlist/?adopted_by=${userId}`;
            const adoptedResponse = await fetch(adoptedPetsAPI);
            const adoptedData = await adoptedResponse.json();
            
            const sellingRescuedPetsAPI = `https://pet-adopt-website-picku.onrender.com/pets/petlist/?created_by=${userId}`;
            const sellingResponse = await fetch(sellingRescuedPetsAPI);
            const sellingData = await sellingResponse.json();
            
            const lookupData = {
                status: await fetchData('status'),
            };
            
            displayPets(adoptedData.results, "adoptedPetsContainer", false, lookupData);
            displayPets(sellingData.results, "sellingRescuedPetsContainer", true, lookupData);
        }
        else {
            const adoptedPetsAPI = `https://pet-adopt-website-picku.onrender.com/pets/petlist/?adopted_by=${fetchId}`;
            const adoptedResponse = await fetch(adoptedPetsAPI);
            const adoptedData = await adoptedResponse.json();
            
            const sellingRescuedPetsAPI = `https://pet-adopt-website-picku.onrender.com/pets/petlist/?created_by=${fetchId}`;
            const sellingResponse = await fetch(sellingRescuedPetsAPI);
            const sellingData = await sellingResponse.json();
            
            const lookupData = {
                status: await fetchData('status'),
            };
            
            displayPets(adoptedData.results, "adoptedPetsContainer", false, lookupData);
            displayPets(sellingData.results, "sellingRescuedPetsContainer", true, lookupData);            
        }

    } catch (error) {
        console.error("Error fetching pets:", error);
        document.getElementById("adoptedPetsContainer").innerHTML = 'Error loading adopted pets.';
        document.getElementById("sellingRescuedPetsContainer").innerHTML = 'Error loading selling/rescued pets.';
    }
}

async function fetchData(key) {
    const url = `https://pet-adopt-website-picku.onrender.com/pets/${key}/`;
    const response = await fetch(url);
    return await response.json();
}

function displayPets(pets, containerId, canEditDelete, lookupData) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const fetchId = new URLSearchParams(window.location.search).get("id");
    const userId = localStorage.getItem("user_id");

    if (pets.length === 0) {
        container.innerHTML = '<h5 style="text-align: center;">No data found!</h5>';
        return;
    }
    pets.forEach((pet) => {
        const petStatus = lookupData.status.find(status => status.id === pet.status);
        let detailsButton = "";
        let editDeleteButtons = "";

        if (!fetchId || fetchId === userId) {
            if (canEditDelete) {
                editDeleteButtons = `
                <a href="edit.html?id=${pet.id}" class="btn btn-dark btn-outline-white btn-sm">Edit</a>
                <a href="delete_pet.html?id=${pet.id}" class="btn btn-dark btn-outline-white btn-sm">Delete</a>
            `;
            }
            if (!canEditDelete) {
                detailsButton = `
                      <a href="details.html?id=${pet.id}" class="btn btn-dark btn-outline-white btn-sm">Details</a>
                  `;
            }             

        } else {
            detailsButton = `
                  <a href="details.html?id=${pet.id}" class="btn btn-dark btn-outline-white btn-sm">Details</a>
              `;
        }

        const petCard = `
            <div class="col-md-4">
                <div class="card mb-4">
                    <img src="${pet.image}" class="card-img-top" alt="${pet.name}" />
                    <div class="card-body text-center">
                        <h5 class="card-title">${pet.name}</h5>
                        <p class="card-text">Status: ${petStatus ? petStatus.name : 'Unknown'}</p>
                        <div class="card__footer">
                            ${editDeleteButtons}
                            ${detailsButton}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += petCard;
    });
}

loadUserAccount();
fetchAndDisplayPets();
