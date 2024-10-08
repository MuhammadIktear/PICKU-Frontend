const loadReview = () => {
    fetch("https://picku-a-pet-adoption-website.onrender.com/pets/list/")
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
            <a href=details.html?id=${pet.id} class="mt-1"  style="text-decoration: none; cursor: pointer; color:#ce8460; " onmouseover="this.style.color='black';" onmouseout="this.style.color='#ce8460';"><h3>${pet.name}</h3></a>
            <p style="color:dark; font-size: 17px"; letter-spacing: 0.5px;>${review.body}</p>
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
  