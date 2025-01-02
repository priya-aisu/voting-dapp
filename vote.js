//import mongoose from 'mongoose'; // Ensure Mongoose is imported
import { contractAddress, contractABI } from './config.js';
//import { candidateSchema } from './models/candidates.js'; // Import the schema

// Compile the schema into a model
//const candidates = mongoose.model('candidates', candidateSchema); // Assign model

let web3;
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            console.log('Connected account:', accounts[0]);
        })
        .catch(error => {
            console.error('User denied account access:', error);
            alert('Please enable MetaMask to use this dApp.');
        });
} else {
    console.error('MetaMask not detected!');
    alert('Please install MetaMask to use this dApp.');
}

const votingContract = new web3.eth.Contract(contractABI, contractAddress);

export async function vote(candidateId) {
    try {
        // Retrieve partyId, pincode, and voterId for the candidate
        const { partyID, pincode } = await getPartyIdAndPincodeByCandidateId(candidateId);
        if (!partyID || !pincode) {
            alert('Failed to retrieve partyId, pincode, or voterId for the selected candidate.');
            return;
        }
        const voterId = window.prompt('Please enter your Voter ID:');
        if (!voterId) {
            alert('Voter ID is required to cast a vote.');
            return;
        }

        // Ensure voterId is a number
        const voterIdNumber = parseInt(voterId, 10);
        if (isNaN(voterIdNumber)) {
            alert('Invalid Voter ID. Please enter a valid number.');
            return;
        }

        const accounts = await web3.eth.getAccounts();
        await votingContract.methods
            .vote(voterIdNumber, parseInt(partyID), pincode)
            .send({ from: accounts[0] }) // Corrected method call
            .on('receipt', (receipt) => {
                console.log('Transaction Receipt:', receipt);
                alert('Vote cast successfully!');
            });

    } catch (error) {
        console.error('Error casting vote:', error);
        alert('Failed to cast vote. Please try again.');
    }
}

async function getPartyIdAndPincodeByCandidateId(candidateId) {
    try {
        console.log('candidateId',candidateId);
        const response = await fetch(`http://localhost:5000/candidate/${candidateId}`);
        console.log('response',response);
        if (!response.ok) throw new Error('Failed to fetch candidate data');
        const candidate = await response.json();
        console.log('candidate',candidate);
        return { partyID: candidate.partyID, pincode: candidate.pincode };
    } catch (error) {
        console.error(error);
        return { partyID: null, pincode: null};
    }
}
