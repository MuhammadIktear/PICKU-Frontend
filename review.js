const loadReview = () => {
    fetch("https://pet-adopt-website-picku.onrender.com/pets/list/")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          displayReview(data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching reviews:', error));
  };
  
  const displayReview = (pets) => {
    const parent = document.getElementById("review-container");
    parent.innerHTML = ''; 
  
    let hasReviews = false;
  
    pets.forEach((pet) => {
      if (pet.reviews && Array.isArray(pet.reviews) && pet.reviews.length > 0) {
        pet.reviews.forEach((review) => {
          hasReviews = true;
  
          const div = document.createElement("div");
          div.classList.add("review-card");
  
          const img = document.createElement("img");
          img.src = pet.image;
          img.alt = pet.name;
          img.style.cursor = "pointer";
          const link = document.createElement("a");
          link.href = `details.html?id=${pet.id}`;
          link.appendChild(img);
  
          div.appendChild(link);
  
          div.innerHTML += `
            <h4 class="mt-1">${pet.name}</h4>
            <p style="color:dark">${review.body}</p>
            <small style="color:#ce8460;">Reviewed by ${review.author_username}</small> on <small style="color:#ce8460;">${new Date(review.created_at).toLocaleDateString()}</small>
          `;
  
          parent.appendChild(div);
        });
      }
    });
  
    if (!hasReviews) {
      parent.innerHTML = '<p>No reviews yet.</p>';
    }
  };
  
  loadReview();
  