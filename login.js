document.getElementById('login-button').addEventListener('click', async () => {
    const aadhar= document.getElementById('aadhar').value;
    const password = document.getElementById('password').value;
    const username=document.getElementById('username').value;

    if (!aadhar || !password||!username) {
        alert('Please enter both aadhar and password.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, aadhar, password }),
        });

        const result = await response.json();
        
        // Log the response and result for debugging
        console.log('Response:', response);
        console.log('Result:', result);

        // Check if the response is OK and if the result contains success
        if (response.ok && result.user) {
            // Store data in localStorage
            localStorage.setItem('aadhar', aadhar);
            localStorage.setItem('userPincode', result.user.pincode); // Assuming 'user.pincode' is correct
            console.log("User Pincode stored:", result.user.pincode); // Log to verify it's being stored
            alert('Login successful!');
            if (username === 'admin') {
                window.location.href = './adminDashboard.html'; 
                alert('Login successful!');
            }
        } else {
            alert(result.message || 'Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});


document.getElementById('vote-button').addEventListener('click', () => {
    // Check if the username and pincode are stored before navigating
    if (localStorage.getItem('aadhar') && localStorage.getItem('userPincode')) {
        window.location.href = './candidateDisplay.html';
    } else {
        alert('Please log in first.');
    }
});
