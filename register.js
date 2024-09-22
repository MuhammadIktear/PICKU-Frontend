document.addEventListener('DOMContentLoaded', async () => {
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
  const getValue = (id) => document.getElementById(id)?.value.trim();
  async function handleRegistration(event){
      event.preventDefault();
      const username = getValue("username");
      const first_name = getValue("first-name");
      const last_name = getValue("last-name");
      const email = getValue("email");
      const password = getValue("password");
      const confirm_password = getValue("confirm-password");
      const info = {
          username,
          first_name,
          last_name,
          email,
          password,
          confirm_password,
      };

      if (password !== confirm_password) {
          showAlert("Password and confirm password do not match", "alert-danger");
          return;
      }

      if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
          showAlert("Password must contain at least one letter, one number, and one special character, and be at least 8 characters long.", "alert-danger");
          return;
      }

      try {
          const response = await fetch("https://picku-a-pet-adoption-website.onrender.com/user/register/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(info),
          });

          if (!response.ok) {   
              const errorData = await response.json();
              showAlert("An error occurred during registration. Please ensure email ID and unique username. Please try again.", "alert-danger");
              return;
          }

          const data = await response.json();
          console.log(data);
          showAlert("Check your email for confirmation", "alert-success");
      } catch (error) {
          console.error("Registration error:", error);
          showAlert("An error occurred during registration. Please ensure email ID and unique username. Please try again.", "alert-danger");
      }
  };

  async function handleLogin(event){
      event.preventDefault();

      const username = getValue("login-username");
      const password = getValue("login-password");

      if (!username || !password) {
          showAlert("Username and password are required.", "alert-danger");
          return;
      }

      try {
          const response = await fetch("https://picku-a-pet-adoption-website.onrender.com/user/login/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              showAlert(`Login failed: ${errorData.detail || response.statusText}`, "alert-danger");
              return;
          }

          const data = await response.json();
          console.log(data);

          if (data.token && data.user_id) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("user_id", data.user_id);
              window.location.href = "index.html";
          } else {
              showAlert("Invalid login credentials.", "alert-danger");
          }
      } catch (error) {
          console.error("Login error:", error);
          showAlert("An error occurred during login. Please try again.", "alert-danger");
      }
  };
  const registrationForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  if (registrationForm) {
      registrationForm.addEventListener("submit", handleRegistration);
  } else {
      console.error("Registration form not found.");
  }

  if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
  } else {
      console.error("Login form not found.");
  }
});
