document.addEventListener('DOMContentLoaded', function () {
    const alertContainer = document.getElementById('alert-container');
  
    if (!alertContainer) {
      console.error("Alert container element not found.");
      return;
    }
  
    const showAlert = (message, type) => {
      alertContainer.innerHTML = '';
      const alertElement = document.createElement('div');
      alertElement.className = `alert ${type} alert-dismissible fade show`;
      alertElement.role = 'alert';
      alertElement.innerHTML = `
        <strong>${type === 'alert-success' ? 'Success:' : 'Error:'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      alertContainer.appendChild(alertElement);
    };
  
    const userId = localStorage.getItem("user_id");
    const userApiUrl = `https://picku-a-pet-adoption-website.onrender.com/user/list/${userId}/`;
    const profileApiUrl = `https://picku-a-pet-adoption-website.onrender.com/user/UserProfileDetail/${userId}/`;
  
    function fetchUserData() {
      // Fetch user details
      fetch(userApiUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok.');
          return response.json();
        })
        .then(data => {
          const userNameInput = document.getElementById('user-name-input');
          const firstNameInput = document.getElementById('first-name-input');
          const lastNameInput = document.getElementById('last-name-input');
          const emailInput = document.getElementById('email-input');
          const userNameDisplay = document.getElementById('user-name');
          const userEmailDisplay = document.getElementById('user-email');
  
          if (userNameDisplay) userNameDisplay.textContent = data.username || 'No Username';
          if (userEmailDisplay) userEmailDisplay.textContent = data.email || 'No Email';
          if (userNameInput) userNameInput.value = data.username;
          if (firstNameInput) firstNameInput.value = data.first_name;
          if (lastNameInput) lastNameInput.value = data.last_name;
          if (emailInput) emailInput.value = data.email;
        })
        .catch(error => showAlert('Error fetching user details: ' + error.message, 'alert-danger'));
  
      // Fetch user profile data
      fetch(profileApiUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok.');
          return response.json();
        })
        .then(data => {
          const userBalanceDisplay = document.getElementById('user-balance');
          const profileImagePreview = document.getElementById('profile-image-preview');
          const profileImage = document.getElementById('profile-image');
          const mobileInput = document.getElementById('mobile-input');
          const locationInput = document.getElementById('location-input');
          const twitterInput = document.getElementById('twitter-input');
          const linkedinInput = document.getElementById('linkedin-input');
  
          if (userBalanceDisplay) userBalanceDisplay.textContent = `$${data.balance || 'N/A'}`;
          if (profileImagePreview) profileImagePreview.src = data.image ? data.image : 'https://via.placeholder.com/150';
          if (profileImage) profileImage.src = data.image ? data.image : 'https://via.placeholder.com/150';
          if (mobileInput) mobileInput.value = data.mobile_no || '';
          if (locationInput) locationInput.value = data.location || '';
          if (twitterInput) twitterInput.value = data.twitter || '';
          if (linkedinInput) linkedinInput.value = data.linkedin || '';
        })
        .catch(error => showAlert('Error fetching user profile data: ' + error.message, 'alert-danger'));
    }
  
    function updateUserDetails() {
      const userNameInput = document.getElementById('user-name-input');
      const firstNameInput = document.getElementById('first-name-input');
      const lastNameInput = document.getElementById('last-name-input');
      const emailInput = document.getElementById('email-input');
      const profileForm = document.getElementById('profile-form');
  
      if (!profileForm) {
        showAlert('Profile form not found.', 'alert-danger');
        return;
      }
  
      const userDetails = {
        username: userNameInput ? userNameInput.value : '',
        mobile_no: document.getElementById('mobile-input') ? document.getElementById('mobile-input').value : '',
        first_name: firstNameInput ? firstNameInput.value : '',
        last_name: lastNameInput ? lastNameInput.value : '',
        email: emailInput ? emailInput.value : ''
      };
  
      fetch(userApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails)
      })
      .then(response => {
        if (response.ok) {
          showAlert('User details updated successfully!', 'alert-success');
        } else {
          showAlert('Failed to update user details.', 'alert-danger');
        }
      })
      .catch(error => showAlert('Error updating user details: ' + error.message, 'alert-danger'));
    }
  
    function updateUserProfile() {
      const profileForm = document.getElementById('profile-form');
      const mobileInput = document.getElementById('mobile-input');
      const locationInput = document.getElementById('location-input');
      const twitterInput = document.getElementById('twitter-input');
      const linkedinInput = document.getElementById('linkedin-input');
  
      if (!profileForm) {
        showAlert('Profile form not found.', 'alert-danger');
        return;
      }
  
      const profileDetails = {
        mobile_no: mobileInput ? mobileInput.value : '',
        location: locationInput ? locationInput.value : '',
        twitter: twitterInput ? twitterInput.value : '',
        linkedin: linkedinInput ? linkedinInput.value : ''
      };
  
      fetch(profileApiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileDetails)
      })
      .then(response => {
        if (response.ok) {
          showAlert('User profile updated successfully!', 'alert-success');
        } else {
          showAlert('Failed to update user profile.', 'alert-danger');
        }
      })
      .catch(error => showAlert('Error updating user profile: ' + error.message, 'alert-danger'));
    }
  
    function updateImage() {
      const imageInput = document.getElementById('profile-image-upload');
      const file = imageInput ? imageInput.files[0] : null;
  
      if (!file) {
        showAlert('Please select an image file to upload.', 'alert-warning');
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: displayUrl })
        });
      })
      .then(response => {
        if (response.ok) {
          showAlert('Image updated successfully!', 'alert-success');
          fetchUserData();
        } else {
          showAlert('Failed to update image.', 'alert-danger');
        }
      })
      .catch(error => showAlert('Error updating image: ' + error.message, 'alert-danger'));
    }
  
    document.getElementById('update-image-btn')?.addEventListener('click', updateImage);
    document.getElementById('update-profile-btn')?.addEventListener('click', () => {
      updateUserDetails();
      updateUserProfile();
    });
  
    fetchUserData();
  });
  