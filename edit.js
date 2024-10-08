document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('addPetForm');
    const speciesSelect = document.getElementById('species');
    const statusSelect = document.getElementById('status');
    const sexSelect = document.getElementById('sex');
    const breedSelect = document.getElementById('breed');
    const colorSelect = document.getElementById('color');
    const sizeSelect = document.getElementById('size');
    const imageInput = document.getElementById('profile-image-upload');
    const imagePreview = document.getElementById('profile-image-preview');
    const updateImageBtn = document.getElementById('update-image-btn');
    const alertContainer = document.getElementById('alert-container');

    const apiUrls = {
        species: 'https://picku-a-pet-adoption-website.onrender.com/pets/species/',
        status: 'https://picku-a-pet-adoption-website.onrender.com/pets/status/',
        sex: 'https://picku-a-pet-adoption-website.onrender.com/pets/sex/',
        breed: 'https://picku-a-pet-adoption-website.onrender.com/pets/breed/',
        color: 'https://picku-a-pet-adoption-website.onrender.com/pets/color/',
        size: 'https://picku-a-pet-adoption-website.onrender.com/pets/size/',
    };

    const dataCache = {};

    const fetchData = async (url, key) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            dataCache[key] = data;
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
        }
    };

    await Promise.all(Object.keys(apiUrls).map(key => fetchData(apiUrls[key], key)));

    const populateSelect = (selectElement, key) => {
        if (!selectElement || !dataCache[key]) return;
        selectElement.innerHTML = '<option value="">Select option</option>';
        dataCache[key].forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;  
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    };

    Object.keys(apiUrls).forEach(key => populateSelect(document.getElementById(key), key));

    const loadPetData = async () => {
        try {
            const petId = new URLSearchParams(window.location.search).get('id');
            if (!petId) throw new Error('Pet ID is missing from the URL.');

            const response = await fetch(`https://picku-a-pet-adoption-website.onrender.com/pets/petlist/${petId}/`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const pet = await response.json();

            document.getElementById('name').value = pet.name;
            document.getElementById('location').value = pet.location;
            speciesSelect.value = pet.species;
            statusSelect.value = pet.status;
            sexSelect.value = pet.sex;
            breedSelect.value = pet.breed;
            colorSelect.value = pet.color;
            sizeSelect.value = pet.size;
            document.getElementById('rehoming-fee').value = pet.rehoming_fee;
            document.getElementById('personality-summary').value = pet.details;

            if (pet.image) {
                imagePreview.src = pet.image;  // Assuming pet.image is already the display_url
            }
        } catch (error) {
            console.error('Error loading pet data:', error);
            showAlert('Failed to load pet data. Please try again.', 'alert-danger');
        }
    };

    await loadPetData();

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'xzygjgsf'); // Cloudinary upload preset

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/ds97wytcs/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            return data.secure_url;  // Get the secure_url from the Cloudinary response
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Failed to upload image. Please try again.', 'alert-danger');
            return null;
        }
    };

    updateImageBtn.addEventListener('click', async () => {
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const secureUrl = await uploadImageToCloudinary(file);
            if (secureUrl) {
                imagePreview.src = secureUrl;
            }
        } else {
            showAlert('Please select an image file.', 'alert-warning');
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const createdById = localStorage.getItem('user_id');
        if (!createdById) {
            showAlert('User ID is required.', 'alert-danger');
            return;
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('status', statusSelect.value);
        formData.append('created_by', createdById);
        formData.append('details', document.getElementById('personality-summary').value);
        formData.append('rehoming_fee', document.getElementById('rehoming-fee').value);

        ['species', 'sex', 'breed', 'color', 'size'].forEach(field => {
            const value = document.getElementById(field).value;
            if (!value) {
                showAlert(`Please select a ${field}.`, 'alert-warning');
                return;
            }
            formData.append(field, value);
        });

        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const secureUrl = await uploadImageToCloudinary(file);
            if (secureUrl) {
                formData.append('image', secureUrl);  // Send the secure_url to your backend
            }
        }

        try {
            const petId = new URLSearchParams(window.location.search).get('id');
            if (!petId) throw new Error('Pet ID is missing from the URL.');

            const response = await fetch(`https://picku-a-pet-adoption-website.onrender.com/pets/petlist/${petId}/`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                displayErrors(errorData);
                throw new Error(`Failed to update pet: ${errorData.detail || response.statusText}`);
            }

            showAlert('Pet updated successfully!', 'alert-success');
        } catch (error) {
            console.error('Error updating pet:', error);
            showAlert('Failed to update pet. Please try again.', 'alert-danger');
        }
    });

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

    const displayErrors = (errors) => {
        let errorMessage = '';
        for (const [field, messages] of Object.entries(errors)) {
            errorMessage += `${field}: ${messages.join(', ')}\n`;
        }
        showAlert(errorMessage, 'alert-danger');
    };
});
