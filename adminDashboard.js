import { contractAddress, contractABI } from './config.js';
let web3, votingContract;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => console.log('Connected account:', accounts[0]))
        .catch(_error => alert('MetaMask connection denied.'));
} else {
    alert('Please install MetaMask to use this dApp.');
}

votingContract = new web3.eth.Contract(contractABI, contractAddress);

document.addEventListener('DOMContentLoaded', () => {
    const viewResultsPopup = document.getElementById('view-results-popup');
    const partyPincodePopup = document.getElementById('party-pincode-popup');
    const pincodePopup = document.getElementById('pincode-popup');

    // Show popup for "View Results"
    document.getElementById('view-results-button').addEventListener('click', () => {
        viewResultsPopup.style.display = 'block';
        document.body.classList.add('show-overlay');
    });

    // Close "View Results" popup
    document.getElementById('close-popup-button').addEventListener('click', () => {
        viewResultsPopup.style.display = 'none';
        document.body.classList.remove('show-overlay');
    });

    
    document.getElementById('total-votes-button').addEventListener('click', async () => {
        try {
           
            const { 0: partyIds, 1: votes } = await votingContract.methods.getTotalVotes().call();
    
            // Fetch partyNames for each partyId from the database
            const results = [];
            for (let i = 0; i < partyIds.length; i++) {
                const partyId = partyIds[i].toString().trim();
                const votesCount = votes[i].toString();
                //console.log('partyId',partyId )
    
                // Fetch the party name from your API
                console.log('partyId:', partyId, 'Type of partyId:', typeof partyId);
                const partyID=Number(partyId);
                console.log('partyID:', partyID, 'Type of partyID:', typeof partyID);
                const response = await fetch(`http://localhost:5000/party-name/${partyID}`);
                console.log('response',response);
                if (!response.ok) {
                    throw new Error('Failed to fetch party name');
                }
                const partyData = await response.json();
                const partyName = partyData.partyName || 'Unknown'; // Fallback if no party name found
    
                // Push the result with partyId, partyName, and votes
                results.push({ partyId, partyName, votes: votesCount });
            }
    
            // Store the results in localStorage
            localStorage.setItem('results', JSON.stringify({ type: 'Total Votes', data: results }));
            window.location.href = './results.html';
        } catch (error) {
            console.error('Error fetching total votes:', error);
            alert('Failed to fetch total votes. Please try again.');
        }
    });
    
    // Show "Votes by Party and Pincode" popup
    document.getElementById('votes-by-party-and-pincode-button').addEventListener('click', () => {
        viewResultsPopup.style.display = 'none';
        partyPincodePopup.style.display = 'block';
    });

    // Close "Votes by Party and Pincode" popup
    document.getElementById('close-party-pincode-popup').addEventListener('click', () => {
        partyPincodePopup.style.display = 'none';
    });

    document.getElementById('submit-party-pincode-button').addEventListener('click', async () => {
        const partyId = document.getElementById('partyId').value;
        const pincode = document.getElementById('pincode').value;
    
        const votes = await votingContract.methods.getTotalVotesByPartyAndPincode(partyId, pincode).call();
        const results = [{ partyId, pincode, votes: votes.toString() }];
    
        localStorage.setItem('results', JSON.stringify({ type: `Votes for Party ${partyId} in Pincode ${pincode}`, data: results }));
        window.location.href = './results.html';
    });

    // Show "Votes by Pincode" popup
    document.getElementById('votes-by-pincode-button').addEventListener('click', () => {
        viewResultsPopup.style.display = 'none';
        pincodePopup.style.display = 'block';
    });

    // Close "Votes by Pincode" popup
    document.getElementById('close-pincode-popup').addEventListener('click', () => {
        pincodePopup.style.display = 'none';
    });

    document.getElementById('submit-pincode-button').addEventListener('click', async () => {
        const pincode = document.getElementById('pincode-only').value;
    
        const { 0: partyIds, 1: votes } = await votingContract.methods.getVotesByPincode(pincode).call();
        const results = partyIds.map((id, i) => ({ partyId: id.toString(), votes: votes[i].toString() }));
    
        localStorage.setItem('results', JSON.stringify({ type: `Votes in Pincode ${pincode}`, data: results }));
        window.location.href = './results.html';
    });

    // Logout
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = './login.html';
    });

    document.getElementById('register-candidate-button').addEventListener('click', () => {
        
        window.location.href = './candidateRegistration.html';
    });
});
