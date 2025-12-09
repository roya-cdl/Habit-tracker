# Habit Tracker

A modern, feature-rich habit tracking application built with vanilla JavaScript. Track your daily habits, maintain streaks, and view your progress with beautiful statistics.

## Features

- ✅ **Create & Manage Habits** - Add, complete, and delete habits with validation
- 🔥 **Streak Tracking** - Automatic streak calculation with visual indicators
- 📊 **Statistics Dashboard** - View total habits, active streaks, longest streak, and daily completions
- 💾 **Data Persistence** - All data saved to localStorage with error handling
- 📤 **Export/Import** - Export your habits to JSON or import from backup
- 🎨 **Modern UI** - Clean, responsive design that works on all devices
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- ✅ **Input Validation** - Prevents duplicates, enforces length limits, and provides feedback

## Getting Started

### Quick Start

1. Open `index.html` in a modern web browser
2. Start adding habits and tracking your progress!

### Using a Local Server (Recommended)

For the best experience, serve the files through a local server:

```bash
# Using npm
npm start

# Or using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

Then open `http://localhost:3000` (or the port shown) in your browser.

## Usage

### Adding a Habit

1. Enter a habit name in the "Add New Habit" form (1-50 characters)
2. Click "Add Habit" or press Enter
3. The habit will appear in your habits list

### Completing a Habit

- Check the checkbox next to a habit to mark it as complete for today
- Uncheck to mark as incomplete
- Your streak will automatically update

### Viewing Statistics

The statistics section shows:
- **Total Habits**: Number of habits you're tracking
- **Active Streaks**: Number of habits with current streaks
- **Longest Streak**: Your best streak across all habits
- **Completed Today**: Number of habits completed today

### Exporting Data

1. Click the "Export" button
2. A JSON file will be downloaded with all your habit data
3. Keep this file as a backup

### Importing Data

1. Click the "Import" button
2. Select a previously exported JSON file
3. Habits will be merged with existing ones (duplicates by name are skipped)

### Deleting a Habit

1. Click the "Delete" button on any habit card
2. Confirm the deletion
3. The habit and all its data will be removed

## Technical Details

### Data Storage

- All data is stored in browser localStorage
- Data structure includes versioning for future migrations
- Automatic validation and error handling for corrupted data

### Streak Calculation

- Streaks count consecutive days including today if completed
- If today is not completed, checks if yesterday was completed
- Streaks break when a day is missed

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses localStorage API (available in all modern browsers)

## Project Structure

```
habit-tracker/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── app.js          # Application logic and data management
├── package.json    # Project configuration
└── README.md       # This file
```

## Anti-Pitfall Guidelines

This project follows comprehensive anti-pitfall guidelines (see `.cursorrules` in parent directory) covering:

- ✅ Data persistence with error handling
- ✅ Timezone-aware date handling
- ✅ Input validation and sanitization
- ✅ Accurate streak calculations
- ✅ Performance optimization
- ✅ Accessibility (WCAG AA compliant)
- ✅ Data integrity and backup
- ✅ User feedback and error messages

## Future Enhancements

Potential features for future versions:
- Reminders and notifications
- Habit categories and tags
- Goal setting (e.g., "30-day challenge")
- Calendar view of completions
- Habit templates
- Social sharing
- Dark mode

## License

MIT
