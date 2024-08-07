document.addEventListener('DOMContentLoaded', function () {
  const userId = localStorage.getItem("user_id");
  console.log(`User ID: ${userId}`);
  const userApiUrl = `https://pet-adopt-website-picku.onrender.com/user/list/${userId}/`;
  const profileApiUrl = `https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`;

  function fetchUserData() {
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
          })
          .catch(error => {
              console.error('Error fetching user details:', error);
          });

        fetch(profileApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                const balance = data.balance !== undefined ? data.balance : 'N/A';
                document.getElementById('user-balance').textContent = `$${balance}`;
            })
            .catch(error => {
                console.error('Error fetching user balance:', error);
            });         

      fetch(profileApiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok.');
              }
              return response.json();
          })
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
});


document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const imageInput = document.getElementById('profile-image-upload');
  const updateImageBtn = document.getElementById('update-image-btn');
  const updateProfileBtn = document.getElementById('update-profile-btn');
  const userId = localStorage.getItem("user_id");
  console.log(`User ID: ${userId}`);

  function fetchUserData() {
      // Fetch user details
      fetch(`https://pet-adopt-website-picku.onrender.com/user/list/${userId}/`)
          .then(response => response.json())
          .then(userData => {           
              document.getElementById('user-name-input').value = userData.username;
              document.getElementById('first-name-input').value = userData.first_name;
              document.getElementById('last-name-input').value = userData.last_name;
              document.getElementById('email-input').value = userData.email;
          })
          .catch(error => console.error('Error fetching user details:', error));

      // Fetch user profile data
      fetch(`https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`)
          .then(response => response.json())
          .then(profileData => {
              document.getElementById('profile-image-preview').src = profileData.image;
              document.getElementById('location-input').value = profileData.location;
              document.getElementById('twitter-input').value = profileData.twitter;
              document.getElementById('linkedin-input').value = profileData.linkedin;
          })
          .catch(error => console.error('Error fetching user profile data:', error));
  }

  // Function to update user details
  function updateUserDetails() {
      const formData = new FormData(profileForm);
      const userDetails = {
          username: formData.get('username') || document.getElementById('user-name-input').value,
          first_name: formData.get('first_name') || document.getElementById('first-name-input').value,
          last_name: formData.get('last_name') || document.getElementById('last-name-input').value,
          email: formData.get('email') || document.getElementById('email-input').value
      };

      fetch(`https://pet-adopt-website-picku.onrender.com/user/list/${userId}/`, {
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

  // Function to update user profile
  function updateUserProfile() {
      const formData = new FormData(profileForm);
      const profileDetails = {
          location: formData.get('location') || document.getElementById('location-input').value,
          twitter: formData.get('twitter') || document.getElementById('twitter-input').value,
          linkedin: formData.get('linkedin') || document.getElementById('linkedin-input').value
      };

      fetch(`https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`, {
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

  // Function to handle image update
  function updateImage() {
      const file = imageInput.files[0];
      if (!file) {
          alert('Please select an image file to upload.');
          return;
      }

      const formData = new FormData();
      formData.append('image', file);

      fetch(`https://pet-adopt-website-picku.onrender.com/user/UserProfileDetail/${userId}/`, {
          method: 'PATCH',
          body: formData,
      })
          .then(response => {
              if (response.ok) {
                  alert('Image updated successfully!');
                  fetchUserData(); // Fetch and update data after image upload
              } else {
                  alert('Failed to update image.');
              }
          })
          .catch(error => console.error('Error updating image:', error));
  }

  updateImageBtn.addEventListener('click', updateImage);

  updateProfileBtn.addEventListener('click', () => {
      updateUserDetails();
      updateUserProfile();
  });

  
  fetchUserData();
});
