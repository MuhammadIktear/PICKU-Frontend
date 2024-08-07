document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adoptForm');
    const userToken = localStorage.getItem('token');
    const petId = new URLSearchParams(window.location.search).get('id');
    const alertContainer = document.getElementById('alert-container');
  
    form.addEventListener('submit', (event) => {
      event.preventDefault();
  
      if (!userToken) {
        showAlert('Please log in or register to apply for adoption.', 'alert-danger');
        return;
      }
  
      const formData = new FormData(form);
      const data = {
        full_name: formData.get('fullName'),
        email: formData.get('email'),
        phone_no: formData.get('phone'),
        address: formData.get('address'),
        pet: petId
      };
  
      fetch('https://pet-adopt-website-picku.onrender.com/pets/adopt/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${userToken}`
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(error => Promise.reject(error));
        }
      })
      .then(data => {
        showAlert('Adoption application submitted successfully! Check your email.', 'alert-success');
        form.reset(); 
      })
      .catch(error => {
        console.error('Error applying for adoption:', error);
        let errorMessage = 'Failed to apply for adoption. Please try again.';
        if (error && error.error) {
          errorMessage = `Error: ${error.error}`;
        }
        showAlert(errorMessage, 'alert-danger');
      });
    });
  
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
  });
  