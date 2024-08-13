document.addEventListener('DOMContentLoaded', () => {
  const petId = new URLSearchParams(window.location.search).get("id");
  const userId = localStorage.getItem("user_id");
  const userToken = localStorage.getItem("token");

  const petDetailsApiUrl = `https://pet-adopt-website-picku.onrender.com/pets/${petId}/`;
  const reviewSubmitApiUrl = `https://pet-adopt-website-picku.onrender.com/pets/${petId}/reviews/`;

  let userName = '';
  let userEmail = '';

  const endpoints = {
    species: 'https://pet-adopt-website-picku.onrender.com/pets/species/',
    status: 'https://pet-adopt-website-picku.onrender.com/pets/status/',
    breed: 'https://pet-adopt-website-picku.onrender.com/pets/breed/',
    color: 'https://pet-adopt-website-picku.onrender.com/pets/color/',
    size: 'https://pet-adopt-website-picku.onrender.com/pets/size/',
    sex: 'https://pet-adopt-website-picku.onrender.com/pets/sex/',
  };

  let lookupData = {};

  const alertContainer = document.getElementById('alert-container');

  function showAlert(message, type) {
    alertContainer.innerHTML = '';
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
      <strong>${type === 'alert-success' ? 'Success:' : 'Error:'}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertElement);
  }

  function fetchLookupData() {
    const fetches = Object.keys(endpoints).map(key =>
      fetch(endpoints[key])
        .then(response => response.json())
        .then(data => lookupData[key] = data)
        .catch(error => console.error(`Error fetching ${key} data:`, error))
    );

    return Promise.all(fetches);
  }

  function fetchUserDetails() {
    return fetch('https://pet-adopt-website-picku.onrender.com/user/list/')
      .then(response => response.json())
      .then(users => {
        const user = users.find(user => user.id === parseInt(userId));
        if (user) {
          userName = user.username;
          userEmail = user.email;
        } else {
          console.error('User not found.');
        }
      })
      .catch(error => console.error('Error fetching user details:', error));
  }

  function fetchPetDetails() {
    fetch(petDetailsApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': userToken ? `Token ${userToken}` : undefined
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('pet-name').textContent = data.name;
      document.getElementById('pet-description').textContent = data.details;
      document.getElementById('pet-image').src = data.image || 'default-image-url';
      
      document.getElementById('apply-to-adopt').addEventListener('click', (event) => {
        event.preventDefault();
        
        if (!userToken) {
          showAlert('Please log in or register to apply for adoption.', 'alert-danger');
        } else if (data.adopted_by) {
          showAlert('Pet already adopted.', 'alert-danger');
        } else if (data.created_by === parseInt(userId)) {
          showAlert('You created this pet.', 'alert-warning');
        }else {
          window.location.href = `adopt.html?id=${petId}`;
        }
      });

      const petInfoTable = document.getElementById('pet-info');
      petInfoTable.innerHTML = `
        <tr><td><strong>Location:</strong></td><td>${data.location}</td></tr>
        <tr><td><strong>Species:</strong></td><td>${data.species.map(id => lookupData.species.find(species => species.id === id).name).join(', ')}</td></tr>
        <tr><td><strong>Breed:</strong></td><td>${data.breed.map(id => lookupData.breed.find(breed => breed.id === id).name).join(', ')}</td></tr>
        <tr><td><strong>Color:</strong></td><td>${data.color.map(id => lookupData.color.find(color => color.id === id).name).join(', ')}</td></tr>
        <tr><td><strong>Size:</strong></td><td>${data.size.map(id => lookupData.size.find(size => size.id === id).name).join(', ')}</td></tr>
        <tr><td><strong>Sex:</strong></td><td>${data.sex.map(id => lookupData.sex.find(sex => sex.id === id).name).join(', ')}</td></tr>
        <tr><td><strong>Rehoming Fee:</strong></td><td>$${data.rehoming_fee}</td></tr>
      `;

      const petStatus = lookupData.status.find(status => status.id === data.status);
      document.getElementById('pet-status').textContent = petStatus ? petStatus.name : 'Unknown';

      console.log('Pet Data:', data);
      console.log('Logged in User ID:', userId);

      const reviewSection = document.getElementById('review-section');
      const reviewForm = document.getElementById('review-form');
      const abc = document.getElementById('abc');

      if (userToken) {
        if (data.adopted_by && data.adopted_by === parseInt(userId)) {
          reviewSection.style.display = 'block';
          reviewForm.style.display = 'block';
          abc.style.display = 'block';
        } else {
          reviewSection.style.display = 'block';
          reviewForm.style.display = 'none';
          abc.style.display = 'none';
        }
      } else {
        reviewSection.style.display = 'block';
        reviewForm.style.display = 'none';
        abc.style.display = 'none';
      }

      const reviewsContainer = document.getElementById('reviews');
      reviewsContainer.innerHTML = '';
      if (data.reviews.length > 0) {
        data.reviews.forEach(review => {
          const reviewElement = document.createElement('div');
          reviewElement.classList.add('review');
          reviewElement.innerHTML = `
            <p><strong>${review.author_username}</strong> (${review.author_email})</p>
            <p>${review.body}</p>
            <p>${new Date(review.created_at).toLocaleDateString()}</p>
          `;
          reviewsContainer.appendChild(reviewElement);
        });
      } else {
        reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching pet details:', error);
      showAlert('Failed to fetch pet details. Please try again later.', 'alert-danger');
    });
  }

  function submitReview(event) {
    event.preventDefault();

    const reviewText = document.getElementById('review-body').value.trim();

    if (!reviewText) {
      showAlert('Review cannot be empty.', 'alert-danger');
      return;
    }

    fetch(reviewSubmitApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${userToken}`
      },
      body: JSON.stringify({
        body: reviewText,
        pet: petId,
        author: userId,
        author_username: userName,
        author_email: userEmail
      })
    })
    .then(response => {
      if (response.ok) {
        showAlert('Review submitted successfully!', 'alert-success');
        document.getElementById('review-body').value = '';
        fetchPetDetails();
      } else {
        return response.text().then(text => {
          throw new Error(`Server Error: ${text}`);
        });
      }
    })
    .catch(error => {
      console.error('Error submitting review:', error);
      showAlert('Failed to submit review. Please try again later.', 'alert-danger');
    });
  }

  document.getElementById('review-form').addEventListener('submit', submitReview);
  fetchLookupData().then(() => {
    fetchUserDetails()
      .then(() => fetchPetDetails())
      .catch(error => {
        console.error('Error during initialization:', error);
        showAlert('Failed to initialize the page. Please try again later.', 'alert-danger');
      });
  });
});
