# 🎮 Halo Polling App

A simple single-page web application for creating and participating in Halo-themed polls.

## Features

- **Create Polls**: Add questions with two options
- **Vote**: Participate in polls with an easy voting interface
- **Results**: View real-time results with visual progress bars
- **Persistence**: Polls are saved locally in your browser
- **Responsive**: Works on desktop and mobile devices
- **Halo Theme**: Beautiful blue/cyan styling inspired by the Halo universe

## Getting Started

1. **Open the app**: Simply open `index.html` in your web browser
2. **Create a poll**: Fill in the poll question and two options, then click "Create Poll"
3. **Vote**: Click on any poll in the list to vote
4. **View results**: See real-time results displayed with progress bars

## File Structure

```
halo-polling-app/
├── index.html          # Main HTML structure
├── styles.css          # Halo-themed styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details

### HTML Structure
- Form with IDs: `poll-question`, `poll-option-1`, `poll-option-2`, `submit-poll-button`
- Display sections: `polls-list`, `poll-results`
- Semantic HTML with proper accessibility

### CSS Features
- Responsive design with CSS Grid and Flexbox
- Glassmorphism effects with backdrop blur
- Gradient backgrounds and smooth animations
- Mobile-first responsive design

### JavaScript Functionality
- ES6 class-based architecture (`HaloPollingApp`)
- LocalStorage for data persistence
- Dynamic DOM manipulation
- Event-driven voting system
- Toast notifications for user feedback

## Browser Compatibility

This app works in all modern browsers that support:
- ES6 Classes
- LocalStorage
- CSS Grid and Flexbox
- Backdrop Filter (for glassmorphism effects)

## Usage Example

1. **Create a poll**: "What's your favorite Halo game?"
   - Option 1: "Halo: Combat Evolved"
   - Option 2: "Halo 2"

2. **Vote**: Click on the poll and choose your option

3. **View results**: See the voting percentages and vote counts

## Development

To modify the app:
- Edit `index.html` for structure changes
- Modify `styles.css` for styling updates
- Update `script.js` for functionality changes

All interactive elements have clear IDs for easy JavaScript selection with `document.getElementById()`.

## License

This project is open source and available under the MIT License.
