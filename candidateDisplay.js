import { vote } from './vote.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Logout button functionality
    document.getElementById('logout-button').addEventListener('click', () => {
        // Clear localStorage
        localStorage.clear();

        // Redirect to login page
        window.location.href = './login.html';
    });

    // Fetch the election start and end time from the backend
    /*async function fetchElectionTimes() {
        try {
            const response = await fetch('http://localhost:5000/api/get-election-times');
            const data = await response.json();

            const electionStartTime = new Date(data.startTime);
            const electionEndTime = new Date(data.endTime);
            const currentTime = new Date();

            if (currentTime >= electionStartTime && currentTime <= electionEndTime) {
                displayCandidates();
            } else {
                // Redirect to a page informing the user that the election has ended
                window.location.href = './electionEnded.html';
            }
        } catch (error) {
            console.error('Error fetching election times:', error);
            // Optionally, show a message if there's an error fetching election times
            document.body.innerHTML = '<p>There was an error checking the election status.</p>';
        }
    }*/

    // Function to display candidates
    async function displayCandidates() {
        const userPincode = localStorage.getItem('userPincode');
        console.log('userPincode', userPincode);

        const candidatesContainer = document.getElementById('candidates-container');

        if (!userPincode) {
            candidatesContainer.innerHTML = '<p>Pincode not found. Please log in again.</p>';
            return;
        }

        try {
            // Fetch candidates matching the user's pincode
            const response = await fetch(`http://localhost:5000/candidates?pincode=${userPincode}`);
            const candidates = await response.json();

            if (candidates.length > 0) {
                candidatesContainer.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Party Name</th>
                                <th>Pincode</th>
                                <th>Vote</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${candidates.map(candidate => `
                                <tr>
                                    <td>${candidate.candidateName}</td>
                                    <td>${candidate.partyName}</td>
                                    <td>${candidate.pincode}</td>
                                    <td><button class="vote-button" data-candidate-id="${candidate._id}">Vote</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                document.querySelectorAll('.vote-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const candidateId = button.getAttribute('data-candidate-id');
                        vote(candidateId); // Call the imported vote function
                    });
                });
            } else {
                candidatesContainer.innerHTML = '<p>No candidates found for your area.</p>';
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            candidatesContainer.innerHTML = '<p>An error occurred while fetching candidates.</p>';
        }
    }
    displayCandidates();
    // Fetch election times and check if it's within the election window
    // fetchElectionTimes();
});
