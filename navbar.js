document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('user_id');
  const userToken = localStorage.getItem('token');
  const loginNav = document.getElementById('nav_login');
  const registerNav = document.getElementById('nav_register');
  const logoutNav = document.getElementById('nav_logout');
  const profileNav = document.getElementById('nav_profile');

  const checkTokenValidity = async () => {
      try {
          const response = await fetch('https://pet-adopt-website-picku.onrender.com/user/logout/', {
              headers: {
                  'Authorization': `Token ${userToken}`
              }
          });

          if (response.status === 401) {
              localStorage.removeItem('user_id');
              localStorage.removeItem('token');
          } else if (response.ok) {
              loginNav.classList.add('d-none');
              registerNav.classList.add('d-none');
              logoutNav.classList.remove('d-none');
              profileNav.classList.remove('d-none');
          } else {
              console.error('Error checking token validity:', response.statusText);
              localStorage.removeItem('user_id');
              localStorage.removeItem('token');
          }
      } catch (error) {
          console.error('Error fetching token validity:', error);
          localStorage.removeItem('user_id');
          localStorage.removeItem('token');
      }
  };

  if (userId && userToken) {
      checkTokenValidity();
  } else {
      loginNav.classList.remove('d-none');
      registerNav.classList.remove('d-none');
      logoutNav.classList.add('d-none');
      profileNav.classList.add('d-none');
  }
});
