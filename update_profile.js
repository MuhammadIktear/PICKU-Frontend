document.addEventListener('DOMContentLoaded', function () {
  const userId = localStorage.getItem("user_id");
  console.log(`User ID: ${userId}`);
  
  const userApiUrl = `https://pet-adopt-website-picku.onrender.com/user/list/${userId}/`;
  const profileApiUrl = `https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`;

  function fetchUserData() {
      // Fetch user details
      fetch(userApiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok.');
              }
              return response.json();
          })
          .then(data => {
              document.getElementById('user-name').textContent = data.username || 'No Username';
              document.getElementById('user-email').textContent = data.email || 'No Email';
              document.getElementById('user-name-input').value = data.username;
              document.getElementById('first-name-input').value = data.first_name;
              document.getElementById('last-name-input').value = data.last_name;
              document.getElementById('email-input').value = data.email;
          })
          .catch(error => console.error('Error fetching user details:', error));

      // Fetch user profile data
      fetch(profileApiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok.');
              }
              return response.json();
          })
          .then(data => {
              document.getElementById('user-balance').textContent = `$${data.balance || 'N/A'}`;
              document.getElementById("profile-image-preview").src = data.image ? data.image : 'https://via.placeholder.com/150';
              document.getElementById("profile-image").src = data.image ? data.image : 'https://via.placeholder.com/150';
              document.getElementById('mobile-input').value = data.mobile_no || '';
              document.getElementById('location-input').value = data.location || '';
              document.getElementById('twitter-input').value = data.twitter || '';
              document.getElementById('linkedin-input').value = data.linkedin || '';
          })
          .catch(error => console.error('Error fetching user profile data:', error));
  }

  function updateUserDetails() {
      const profileForm = document.getElementById('profile-form');
      const formData = new FormData(profileForm);
      const userDetails = {
          username: formData.get('username') || document.getElementById('user-name-input').value,
          mobile_no: formData.get('mobile_no') || document.getElementById('mobile-input').value,
          first_name: formData.get('first_name') || document.getElementById('first-name-input').value,
          last_name: formData.get('last_name') || document.getElementById('last-name-input').value,
          email: formData.get('email') || document.getElementById('email-input').value
      };

      fetch(userApiUrl, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userDetails)
      })
          .then(response => {
              if (response.ok) {
                  alert('User details updated successfully!');
              } else {
                  alert('Failed to update user details.');
              }
          })
          .catch(error => console.error('Error updating user details:', error));
  }

  function updateUserProfile() {
      const profileForm = document.getElementById('profile-form');
      const formData = new FormData(profileForm);
      const profileDetails = {
          mobile_no: formData.get('mobile_no') || document.getElementById('mobile-input').value,
          location: formData.get('location') || document.getElementById('location-input').value,
          twitter: formData.get('twitter') || document.getElementById('twitter-input').value,
          linkedin: formData.get('linkedin') || document.getElementById('linkedin-input').value
      };

      fetch(profileApiUrl, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileDetails)
      })
          .then(response => {
              if (response.ok) {
                  alert('User profile updated successfully!');
              } else {
                  alert('Failed to update user profile.');
              }
          })
          .catch(error => console.error('Error updating user profile:', error));
  }

  function updateImage() {
      const imageInput = document.getElementById('profile-image-upload');
      const file = imageInput.files[0];
      if (!file) {
          alert('Please select an image file to upload.');
          return;
      }

      const cloudName = 'ds97wytcs';
      const uploadPreset = 'xzygjgsf'; 
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: formData,
      })
          .then(response => response.json())
          .then(cloudinaryResponse => {
              const displayUrl = cloudinaryResponse.secure_url;
              return fetch(profileApiUrl, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ image: displayUrl })
              });
          })
          .then(response => {
              if (response.ok) {
                  alert('Image updated successfully!');
                  fetchUserData();
              } else {
                  alert('Failed to update image.');
              }
          })
          .catch(error => console.error('Error updating image:', error));
  }

  document.getElementById('update-image-btn').addEventListener('click', updateImage);
  document.getElementById('update-profile-btn').addEventListener('click', () => {
      updateUserDetails();
      updateUserProfile();
  });

  fetchUserData();
});
