document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addPetForm');
    const speciesSelect = document.getElementById('species');
    const statusSelect = document.getElementById('status');
    const sexSelect = document.getElementById('sex');
    const breedSelect = document.getElementById('breed');
    const colorSelect = document.getElementById('color');
    const sizeSelect = document.getElementById('size');
    const imageInput = document.getElementById('animal-images');
    const rehomingFeeInput = document.getElementById('rehoming-fee');

    const apiUrls = {
        species: 'https://pet-adopt-website-picku.onrender.com/pets/species/',
        status: 'https://pet-adopt-website-picku.onrender.com/pets/status/',
        sex: 'https://pet-adopt-website-picku.onrender.com/pets/sex/',
        breed: 'https://pet-adopt-website-picku.onrender.com/pets/breed/',
        color: 'https://pet-adopt-website-picku.onrender.com/pets/color/',
        size: 'https://pet-adopt-website-picku.onrender.com/pets/size/',
    };

    const dataCache = {};

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

    const populateSelect = async (selectElement, url, key) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            dataCache[key] = data;

            selectElement.innerHTML = '<option value="">Select option</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id; 
                option.textContent = item.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            showAlert('Failed to load data. Please try again later.', 'alert-danger');
        }
    };

    Object.keys(apiUrls).forEach(key => populateSelect(document.getElementById(key), apiUrls[key], key));

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

        ['species', 'sex', 'breed', 'color', 'size'].forEach(field => {
            const value = document.getElementById(field).value;
            if (!value) {
                showAlert(`Please select a ${field}.`, 'alert-danger');
                return;
            }
            formData.append(field, value);
        });

        const rehomingFee = rehomingFeeInput.value.trim();
        if (rehomingFee === '' || isNaN(rehomingFee)) {
            showAlert('Rehoming fee must be a valid number.', 'alert-danger');
            return;
        }
        formData.append('rehoming_fee', rehomingFee);

        if (imageInput.files.length > 0) {
            const imageFile = imageInput.files[0];
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/ds97wytcs/upload`;
            const cloudinaryUploadPreset = 'xzygjgsf';
            const imageFormData = new FormData();
            imageFormData.append('file', imageFile);
            imageFormData.append('upload_preset', cloudinaryUploadPreset);

            try {
                const cloudinaryResponse = await fetch(cloudinaryUrl, {
                    method: 'POST',
                    body: imageFormData
                });

                if (!cloudinaryResponse.ok) {
                    throw new Error('Failed to upload image to Cloudinary.');
                }

                const cloudinaryResult = await cloudinaryResponse.json();
                console.log('Image uploaded successfully:', cloudinaryResult);
                formData.append('image', cloudinaryResult.secure_url);
            } catch (error) {
                console.error('Error uploading image:', error);
                showAlert('Failed to upload image. Please try again.', 'alert-danger');
                return;
            }
        } else {
            showAlert('An image file is required.', 'alert-danger');
            return;
        }

        console.log('Form data:', formData); 

        try {
            const response = await fetch('https://pet-adopt-website-picku.onrender.com/pets/petlist/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                displayErrors(errorData);
                throw new Error(`Failed to add pet: ${errorData.detail || response.statusText}`);
            }

            const result = await response.json();
            showAlert('Pet added successfully!', 'alert-success');
            form.reset();
        } catch (error) {
            console.error('Error adding pet:', error);
            showAlert('Failed to add pet. Please try again.', 'alert-danger');
        }
    });

    const displayErrors = (errors) => {
        let errorMessage = '';
        for (const [field, messages] of Object.entries(errors)) {
            errorMessage += `${field}: ${messages.join(', ')}\n`;
        }
        showAlert(errorMessage, 'alert-danger');
    };
});
