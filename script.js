// Halo Polling App JavaScript

class HaloPollingApp {
    constructor() {
        this.polls = [];
        this.currentPollId = null;
        this.initializeApp();
    }

    initializeApp() {
        // Get DOM elements
        this.pollQuestionInput = document.getElementById('poll-question');
        this.pollOption1Input = document.getElementById('poll-option-1');
        this.pollOption2Input = document.getElementById('poll-option-2');
        this.submitPollButton = document.getElementById('submit-poll-button');
        this.pollsList = document.getElementById('polls-list');
        this.pollResults = document.getElementById('poll-results');

        // Add event listeners
        this.addEventListeners();

        // Load any existing polls from localStorage
        this.loadPolls();
    }

    addEventListeners() {
        // Handle form submission
        this.submitPollButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.createPoll();
        });

        // Handle Enter key in form inputs
        [this.pollQuestionInput, this.pollOption1Input, this.pollOption2Input].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.createPoll();
                }
            });
        });
    }

    createPoll() {
        const question = this.pollQuestionInput.value.trim();
        const option1 = this.pollOption1Input.value.trim();
        const option2 = this.pollOption2Input.value.trim();

        // Validate inputs
        if (!question || !option1 || !option2) {
            alert('Please fill in all fields to create a poll!');
            return;
        }

        // Create new poll object
        const newPoll = {
            id: Date.now(),
            question: question,
            options: [
                { text: option1, votes: 0 },
                { text: option2, votes: 0 }
            ],
            totalVotes: 0,
            createdAt: new Date().toLocaleString()
        };

        // Add to polls array
        this.polls.push(newPoll);

        // Clear form
        this.clearForm();

        // Update display
        this.renderPolls();
        this.savePolls();

        // Show success message
        this.showMessage('Poll created successfully! 🎉');
    }

    clearForm() {
        this.pollQuestionInput.value = '';
        this.pollOption1Input.value = '';
        this.pollOption2Input.value = '';
    }

    renderPolls() {
        this.pollsList.innerHTML = '';

        if (this.polls.length === 0) {
            return; // CSS will show the empty state message
        }

        this.polls.forEach(poll => {
            const pollElement = this.createPollElement(poll);
            this.pollsList.appendChild(pollElement);
        });
    }

    createPollElement(poll) {
        const pollDiv = document.createElement('div');
        pollDiv.className = 'poll-item';
        pollDiv.dataset.pollId = poll.id;

        pollDiv.innerHTML = `
            <div class="poll-question">${poll.question}</div>
            <div class="poll-options">
                <span class="poll-option">${poll.options[0].text}</span>
                <span class="poll-option">${poll.options[1].text}</span>
            </div>
            <div class="poll-meta" style="margin-top: 10px; font-size: 0.8rem; color: rgba(184, 212, 255, 0.7);">
                Created: ${poll.createdAt} | Total votes: ${poll.totalVotes}
            </div>
        `;

        // Add click event for voting
        pollDiv.addEventListener('click', () => {
            this.showVotingInterface(poll);
        });

        return pollDiv;
    }

    showVotingInterface(poll) {
        const question = poll.question;
        const option1 = poll.options[0].text;
        const option2 = poll.options[1].text;

        const choice = confirm(`Vote on: "${question}"\n\nClick OK to vote for: ${option1}\nClick Cancel to vote for: ${option2}`);
        
        if (choice !== null) { // User didn't cancel the dialog
            this.vote(poll.id, choice ? 0 : 1);
        }
    }

    vote(pollId, optionIndex) {
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll) return;

        // Add vote
        poll.options[optionIndex].votes++;
        poll.totalVotes++;

        // Update display
        this.renderPolls();
        this.showPollResults(poll);
        this.savePolls();

        // Show feedback
        const optionText = poll.options[optionIndex].text;
        this.showMessage(`Thanks for voting for "${optionText}"! 🗳️`);
    }

    showPollResults(poll) {
        this.currentPollId = poll.id;
        
        const resultsHTML = `
            <div class="results-container">
                <h3 style="margin-bottom: 20px; color: #00d4ff;">${poll.question}</h3>
                <div class="results-stats" style="margin-bottom: 20px; text-align: center; color: #b8d4ff;">
                    Total Votes: ${poll.totalVotes}
                </div>
                ${poll.options.map((option, index) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    return `
                        <div class="result-item">
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
                    <button onclick="pollingApp.clearResults()" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(0, 150, 255, 0.3); color: #b8d4ff; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                        Clear Results
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

    savePolls() {
        localStorage.setItem('haloPolls', JSON.stringify(this.polls));
    }

    loadPolls() {
        const savedPolls = localStorage.getItem('haloPolls');
        if (savedPolls) {
            this.polls = JSON.parse(savedPolls);
            this.renderPolls();
        }
    }

    showMessage(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #0066cc, #00d4ff);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
            z-index: 1000;
            font-weight: 600;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.pollingApp = new HaloPollingApp();
});

// Add some example functionality for demonstration
document.addEventListener('DOMContentLoaded', () => {
    // Add a subtle loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
