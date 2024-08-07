document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('change-password-form');
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

  form.addEventListener('submit', (event) => {
      event.preventDefault(); 

      const oldPassword = document.getElementById('old_password').value.trim();
      const newPassword = document.getElementById('new_password').value.trim();
      const confirmNewPassword = document.getElementById('confirm-password').value.trim();

      alertContainer.innerHTML = ''; 

      if (newPassword === confirmNewPassword) {
          if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
              const info = {
                  old_password: oldPassword,
                  new_password: newPassword,
                  confirm_new_password: confirmNewPassword,
              };

              fetch('https://pet-adopt-website-picku.onrender.com/user/change-password/', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Token ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(info),
              })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      showAlert(data.message, 'alert-success');
                  } else {
                      showAlert('An error occurred while changing the password.', 'alert-danger');
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  showAlert('Failed to change password.', 'alert-danger');
              });
          } else {
              showAlert('Password must contain a minimum of eight characters, at least one letter, one number, and one special character.', 'alert-danger');
          }
      } else {
          showAlert('New password and confirm password do not match.', 'alert-danger');
      }
  });
});
