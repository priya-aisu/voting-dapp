import { contractAddress, contractABI } from './config.js';
const signinForm = document.getElementById('signin-form');

let web3;
let votingContract;

async function initializeWeb3() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum); 
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Web3 initialized');
            
            votingContract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected to contract:", votingContract);
        } catch (error) {
            console.error('Error initializing Web3:', error);
            alert('Failed to connect to MetaMask.');
        }
    } else {
        alert('MetaMask is not installed. Please install it.');
    }
}

window.addEventListener('load', initializeWeb3);

signinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!web3 || !votingContract) {
        alert('Blockchain connection not established. Please ensure MetaMask is connected.');
        return;
    }

    const dobInput = document.getElementById('dob').value;
    const dob = new Date(dobInput);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const isBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (age < 18 || (age === 18 && !isBirthdayPassed)) {
        alert('You must be at least 18 years old to sign up.');
        return;
    }
   
    const aadharInput = document.getElementById('aadhar').value;
    if (!/^\d{12}$/.test(aadharInput)) {
        alert('Aadhaar number must be exactly 12 digits.');
        return;
    }

    const mobileInput = document.getElementById('mobile').value;
    if (!/^\d{10}$/.test(mobileInput)) {
        alert('Mobile number must contain exactly 10 digits.');
        return;
    }


    const formData = new FormData(signinForm);
    const data = Object.fromEntries(formData.entries());
    console.log('data',data);

        try {
        const accounts = await web3.eth.getAccounts();
        console.log('Accounts:', accounts);

               
        await votingContract.methods
            .registerVoter( parseInt(data.voterId),data.name)
            .send({ from: accounts[0] })
            .on('receipt', (receipt) => {
                console.log('Transaction Receipt:', receipt);
                alert('Voter registered successfully on blockchain.');
            });
            

        // Save voter data to MongoDB
        fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    alert('Account created successfully!');
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    alert(result.message || 'An error occurred. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error saving to MongoDB:', error);
                alert('Failed to save voter data to the database.');
            });
    } catch (error) {
        console.error('Error registering voter on blockchain:', error);
        alert('Failed to register voter on blockchain. Please try again.');
    }
});
