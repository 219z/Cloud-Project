// Halo Polling App JavaScript - Modified for AWS Backend

class HaloPollingApp {
    constructor() {
        // Need to get the API Gateway URL from the AWS console later.
        // This is for Part 2 of the project.
        this.apiUrl = "https://YOUR_API_GATEWAY_URL/dev"; // IMPORTANT: Remember to replace this.

        this.polls = [];
        this.currentPollId = null;
        this.initializeApp();
    }

    initializeApp() {
        // First, link up all the HTML elements.
        this.pollQuestionInput = document.getElementById('poll-question');
        this.pollOption1Input = document.getElementById('poll-option-1');
        this.pollOption2Input = document.getElementById('poll-option-2');
        this.submitPollButton = document.getElementById('submit-poll-button');
        this.pollsList = document.getElementById('polls-list');
        this.pollResults = document.getElementById('poll-results');

        // Set up the button clicks.
        this.addEventListeners();

        // Load existing polls from the database.
        this.loadPolls();
    }

    addEventListeners() {
        // What to do when the submit button is clicked.
        this.submitPollButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.createPoll();
        });

        // Also let the user press Enter to submit.
        [this.pollQuestionInput, this.pollOption1Input, this.pollOption2Input].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.createPoll();
                }
            });
        });
    }

    async createPoll() {
        const question = this.pollQuestionInput.value.trim();
        const option1 = this.pollOption1Input.value.trim();
        const option2 = this.pollOption2Input.value.trim();

        if (!question || !option1 || !option2) {
            this.showMessage('Please fill in all fields!', 'error');
            return;
        }

        // Prepare the data to send to the backend.
        const pollData = {
            question: question,
            options: [
                { text: option1, votes: 0 },
                { text: option2, votes: 0 }
            ]
        };

        try {
            // This is the part that sends the data to my Lambda function.
            const response = await fetch(`${this.apiUrl}/polls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pollData)
            });

            if (!response.ok) {
                throw new Error('Failed to create poll on the server.');
            }

            this.clearForm();
            this.loadPolls(); // Refresh the list to show the new poll.
            this.showMessage('Poll created successfully! 🎉');

        } catch (error) {
            console.error("Error creating poll:", error);
            this.showMessage('Error creating poll. See console for details.', 'error');
        }
    }

    clearForm() {
        this.pollQuestionInput.value = '';
        this.pollOption1Input.value = '';
        this.pollOption2Input.value = '';
    }

    renderPolls() {
        this.pollsList.innerHTML = '';

        if (this.polls.length === 0) {
            this.pollsList.innerHTML = '<div class="empty-state">No active polls. Create one to get started!</div>';
            return;
        }

        this.polls.forEach(poll => {
            const pollElement = this.createPollElement(poll);
            this.pollsList.appendChild(pollElement);
        });
    }

    createPollElement(poll) {
        const pollDiv = document.createElement('div');
        pollDiv.className = 'poll-item';
        pollDiv.dataset.pollId = poll.pollID; // Use the pollID that DynamoDB generates.

        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

        pollDiv.innerHTML = `
            <div class="poll-question">${poll.question}</div>
            <div class="poll-options">
                <span class="poll-option">${poll.options[0].text}</span>
                <span class="poll-option">${poll.options[1].text}</span>
            </div>
            <div class="poll-meta" style="margin-top: 10px; font-size: 0.8rem; color: rgba(184, 212, 255, 0.7);">
                Total votes: ${totalVotes}
            </div>
        `;

        // When a poll item is clicked, show the results for it.
        pollDiv.addEventListener('click', () => {
            this.showPollResults(poll);
        });

        return pollDiv;
    }

    // This function handles the voting part.
    async vote(pollId, optionIndex) {
        try {
            // Send the vote data to the other Lambda function.
            const response = await fetch(`${this.apiUrl}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionIndex: optionIndex })
            });

            if (!response.ok) {
                throw new Error('Vote failed on the server.');
            }

            // The backend should send back the updated poll info.
            const updatedPoll = await response.json();

            // Find the poll in my local list and update it with the new data.
            const pollIndex = this.polls.findIndex(p => p.pollID === pollId);
            if (pollIndex !== -1) {
                this.polls[pollIndex] = updatedPoll;
            }

            // Refresh the screen to show the new vote count.
            this.renderPolls();
            this.showPollResults(updatedPoll);
            this.showMessage(`Thanks for voting! 🗳️`);

        } catch (error) {
            console.error("Error voting:", error);
            this.showMessage('Error submitting vote. See console for details.', 'error');
        }
    }

    // This part generates the HTML for the results and voting options.
    showPollResults(poll) {
        this.currentPollId = poll.pollID;
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

        const resultsHTML = `
            <div class="results-container">
                <h3 style="margin-bottom: 20px; color: #00d4ff;">${poll.question}</h3>
                <div class="results-stats" style="margin-bottom: 20px; text-align: center; color: #b8d4ff;">
                    Total Votes: ${totalVotes}
                </div>
                ${poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return `
                        <div class="result-item" onclick="pollingApp.vote('${poll.pollID}', ${index})">
                            <div class="result-label">
                                <span>${option.text}</span>
                                <span>${option.votes} votes (${percentage}%)</span>
                            </div>
                            <div class="result-bar">
                                <div class="result-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div style="margin-top: 20px; text-align: center;">
                    <button onclick="pollingApp.clearResults()" class="clear-button">
                        Close Results
                    </button>
                </div>
            </div>
        `;

        this.pollResults.innerHTML = resultsHTML;
    }

    clearResults() {
        this.pollResults.innerHTML = '';
        this.currentPollId = null;
    }

    // No need for savePolls() anymore, data is in DynamoDB now.

    // This function gets all the polls from the database when the page loads.
    async loadPolls() {
        this.pollsList.innerHTML = '<div class="empty-state">Loading polls from the Pillar of Autumn...</div>';
        try {
            // Actually call the backend API to get the list of polls.
            const response = await fetch(`${this.apiUrl}/polls`);
            if (!response.ok) {
                throw new Error('Failed to load polls from the server.');
            }
            const data = await response.json();
            this.polls = data; // Keep the list of polls from the backend here.
            this.renderPolls(); // Display the polls on the screen.

        } catch (error) {
            console.error("Error loading polls:", error);
            this.pollsList.innerHTML = '<div class="empty-state error">Could not load polls. Is the backend running?</div>';
        }
    }

    showMessage(message, type = 'success') {
        const toast = document.createElement('div');
        toast.textContent = message;
        const gradient = type === 'error'
            ? 'linear-gradient(45deg, #cc0000, #ff4d4d)'
            : 'linear-gradient(45deg, #0066cc, #00d4ff)';
        
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${gradient};
            color: white; padding: 15px 25px; border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            z-index: 1000; font-weight: 600; opacity: 0;
            transform: translateX(100%); transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Start the app once the HTML page is ready.
document.addEventListener('DOMContentLoaded', () => {
    window.pollingApp = new HaloPollingApp();
});
