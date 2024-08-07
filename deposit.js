document.addEventListener("DOMContentLoaded", function () {
    const depositBtn = document.getElementById('depositBtn');
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

    depositBtn.addEventListener('click', function () {
        const amount = parseFloat(document.getElementById('amount').value);

        if (isNaN(amount) || amount <= 0) {
            showAlert("Please enter a valid deposit amount.", 'alert-danger');
            return;
        }

        const depositUrl = 'https://pet-adopt-website-picku.onrender.com/user/deposit/';
        const token = localStorage.getItem('token'); 

        if (!token) {
            showAlert("Authentication token not found. Please log in again.", 'alert-danger');
            return;
        }

        fetch(depositUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` 
            },
            body: JSON.stringify({ balance: amount.toFixed(2) })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
        })
        .then(data => {
            showAlert(`Deposit successful! Your new balance is $${data.balance}`, 'alert-success');
            document.getElementById('amount').value = '';  
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(`An error occurred: ${error.message}`, 'alert-danger');
        });
    });
});
