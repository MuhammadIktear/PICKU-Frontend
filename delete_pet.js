document.addEventListener('DOMContentLoaded', () => {
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            const petId = new URLSearchParams(window.location.search).get('id');
            if (!petId) {
                alert('Pet ID is missing.');
                return;
            }

            const confirmed = confirm('Are you sure you want to delete this pet?');
            if (confirmed) {
                try {
                    const response = await fetch(`https://pet-adopt-website-picku.onrender.com/pets/petlist/${petId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                        },
                    });

                    if (response.ok) {
                        alert('Pet deleted successfully!');
                        window.location.href = 'profile.html'; 
                    } else {
                        const errorData = await response.json();
                        console.error('Error response from server:', errorData);
                        alert(`Failed to delete pet: ${errorData.detail || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error deleting pet:', error);
                    alert('Failed to delete pet. Please try again.');
                }
            }
        });
    } else {
        console.warn('Confirm delete button not found.');
    }
});
