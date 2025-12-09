/**
 * Habit Tracker Application
 * Follows anti-pitfall guidelines for data persistence, validation, and UX
 */

// Data Schema Version - for migration support
const DATA_SCHEMA_VERSION = 1;
const STORAGE_KEY = 'habitTrackerData';
const MAX_HABIT_NAME_LENGTH = 50;
const MIN_HABIT_NAME_LENGTH = 1;

/**
 * Data Access Layer - Handles localStorage operations with error handling
 */
class HabitStorage {
    static save(data) {
        try {
            const dataToSave = {
                version: DATA_SCHEMA_VERSION,
                habits: data.habits || [],
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                HabitTracker.showToast('Storage quota exceeded. Please export and clear some data.', 'error');
            } else {
                HabitTracker.showToast('Failed to save data. Please try again.', 'error');
            }
            console.error('Storage save error:', error);
            return false;
        }
    }

    static load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return { habits: [] };
            }

            const data = JSON.parse(stored);
            
            // Validate data structure
            if (!data || typeof data !== 'object' || !Array.isArray(data.habits)) {
                console.warn('Invalid data structure, resetting to default');
                return { habits: [] };
            }

            // Future: Implement migration logic here if version changes
            if (data.version !== DATA_SCHEMA_VERSION) {
                console.warn('Schema version mismatch, may need migration');
            }

            // Validate and sanitize habits
            const validHabits = data.habits.filter(habit => 
                habit && 
                typeof habit.id === 'string' &&
                typeof habit.name === 'string' &&
                Array.isArray(habit.completedDates)
            );

            return { habits: validHabits };
        } catch (error) {
            console.error('Storage load error:', error);
            HabitTracker.showToast('Failed to load data. Starting fresh.', 'error');
            return { habits: [] };
        }
    }

    static export() {
        const data = this.load();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habits-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // Validate imported data structure
                    if (!imported || typeof imported !== 'object' || !Array.isArray(imported.habits)) {
                        reject(new Error('Invalid file format'));
                        return;
                    }

                    // Validate each habit
                    const validHabits = imported.habits.filter(habit => 
                        habit && 
                        typeof habit.id === 'string' &&
                        typeof habit.name === 'string' &&
                        habit.name.length >= MIN_HABIT_NAME_LENGTH &&
                        habit.name.length <= MAX_HABIT_NAME_LENGTH &&
                        Array.isArray(habit.completedDates)
                    );

                    if (validHabits.length === 0 && imported.habits.length > 0) {
                        reject(new Error('No valid habits found in file'));
                        return;
                    }

                    resolve({ habits: validHabits });
                } catch (error) {
                    reject(new Error('Failed to parse file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

/**
 * Date Utility - Handles timezone-aware date operations
 */
class DateUtils {
    /**
     * Get today's date in ISO format (YYYY-MM-DD) using local timezone
     */
    static getToday() {
        const now = new Date();
        return this.formatDate(now);
    }

    /**
     * Format date to YYYY-MM-DD format
     */
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Parse date string (YYYY-MM-DD) to Date object
     */
    static parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    /**
     * Check if date string is today
     */
    static isToday(dateString) {
        return dateString === this.getToday();
    }

    /**
     * Check if date string is yesterday
     */
    static isYesterday(dateString) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return dateString === this.formatDate(yesterday);
    }

    /**
     * Get number of days between two dates
     */
    static daysBetween(date1, date2) {
        const d1 = this.parseDate(date1);
        const d2 = this.parseDate(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
}

/**
 * Streak Calculator - Handles streak calculation logic
 */
class StreakCalculator {
    /**
     * Calculate current streak for a habit
     * Streak is consecutive days including today if completed
     */
    static calculateStreak(completedDates) {
        if (!completedDates || completedDates.length === 0) {
            return 0;
        }

        // Sort dates in descending order
        const sortedDates = [...completedDates].sort().reverse();
        const today = DateUtils.getToday();

        // Check if today is completed
        let streak = 0;
        let currentDate = today;
        let dateIndex = 0;

        // If today is completed, start counting from today
        if (sortedDates[0] === today) {
            streak = 1;
            currentDate = today;
            dateIndex = 1;
        } else {
            // If today is not completed, check if yesterday was completed
            if (sortedDates[0] === DateUtils.formatDate(new Date(Date.now() - 86400000))) {
                streak = 1;
                currentDate = sortedDates[0];
                dateIndex = 1;
            } else {
                return 0; // No recent completion
            }
        }

        // Count consecutive days backwards
        while (dateIndex < sortedDates.length) {
            const expectedDate = DateUtils.formatDate(
                new Date(DateUtils.parseDate(currentDate).getTime() - 86400000)
            );

            if (sortedDates[dateIndex] === expectedDate) {
                streak++;
                currentDate = expectedDate;
                dateIndex++;
            } else {
                break; // Streak broken
            }
        }

        return streak;
    }

    /**
     * Calculate longest streak for a habit
     */
    static calculateLongestStreak(completedDates) {
        if (!completedDates || completedDates.length === 0) {
            return 0;
        }

        const sortedDates = [...completedDates].sort();
        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const daysDiff = DateUtils.daysBetween(sortedDates[i - 1], sortedDates[i]);
            
            if (daysDiff === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    }
}

/**
 * Main Habit Tracker Application
 */
class HabitTracker {
    constructor() {
        this.habits = [];
        this.initializeApp();
    }

    initializeApp() {
        // Load data from storage
        const data = HabitStorage.load();
        this.habits = data.habits || [];

        // Set up event listeners
        this.setupEventListeners();

        // Render initial state
        this.render();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('habit-form');
        form.addEventListener('submit', (e) => this.handleAddHabit(e));

        // Input validation
        const habitNameInput = document.getElementById('habit-name');
        habitNameInput.addEventListener('input', () => this.validateHabitName());

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => this.handleExport());
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.handleImport(e));
    }

    validateHabitName() {
        const input = document.getElementById('habit-name');
        const errorDiv = document.getElementById('habit-name-error');
        const name = input.value.trim();

        // Clear previous error
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');

        // Check length
        if (name.length > 0 && name.length < MIN_HABIT_NAME_LENGTH) {
            errorDiv.textContent = `Habit name must be at least ${MIN_HABIT_NAME_LENGTH} character.`;
            errorDiv.classList.add('show');
            input.setCustomValidity('Habit name too short');
            return false;
        }

        if (name.length > MAX_HABIT_NAME_LENGTH) {
            errorDiv.textContent = `Habit name must be ${MAX_HABIT_NAME_LENGTH} characters or less.`;
            errorDiv.classList.add('show');
            input.setCustomValidity('Habit name too long');
            return false;
        }

        // Check for duplicates
        const isDuplicate = this.habits.some(
            habit => habit.name.toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate) {
            errorDiv.textContent = 'A habit with this name already exists.';
            errorDiv.classList.add('show');
            input.setCustomValidity('Duplicate habit name');
            return false;
        }

        input.setCustomValidity('');
        return true;
    }

    handleAddHabit(e) {
        e.preventDefault();
        
        const input = document.getElementById('habit-name');
        const name = input.value.trim();

        if (!this.validateHabitName()) {
            input.focus();
            return;
        }

        // Create new habit
        const habit = {
            id: this.generateId(),
            name: name,
            completedDates: [],
            createdAt: DateUtils.getToday()
        };

        this.habits.push(habit);
        this.saveAndRender();

        // Reset form
        input.value = '';
        input.focus();

        this.showToast(`Habit "${name}" added successfully!`, 'success');
    }

    handleToggleComplete(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = DateUtils.getToday();
        const index = habit.completedDates.indexOf(today);

        if (index > -1) {
            // Remove today's completion
            habit.completedDates.splice(index, 1);
            this.showToast(`Marked "${habit.name}" as incomplete for today.`, 'success');
        } else {
            // Add today's completion
            habit.completedDates.push(today);
            habit.completedDates.sort(); // Keep dates sorted
            this.showToast(`Great job! "${habit.name}" completed for today!`, 'success');
        }

        this.saveAndRender();
    }

    handleDeleteHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        if (confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveAndRender();
            this.showToast(`Habit "${habit.name}" deleted.`, 'success');
        }
    }

    handleExport() {
        try {
            HabitStorage.export();
            this.showToast('Habits exported successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to export habits.', 'error');
            console.error('Export error:', error);
        }
    }

    async handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const imported = await HabitStorage.import(file);
            
            // Merge with existing habits (avoid duplicates by name)
            const existingNames = new Set(this.habits.map(h => h.name.toLowerCase()));
            const newHabits = imported.habits.filter(h => !existingNames.has(h.name.toLowerCase()));
            
            if (newHabits.length === 0 && imported.habits.length > 0) {
                this.showToast('All habits in the file already exist.', 'error');
                return;
            }

            this.habits = [...this.habits, ...newHabits];
            this.saveAndRender();
            this.showToast(`Imported ${newHabits.length} habit(s) successfully!`, 'success');
        } catch (error) {
            this.showToast(`Import failed: ${error.message}`, 'error');
            console.error('Import error:', error);
        } finally {
            // Reset file input
            e.target.value = '';
        }
    }

    saveAndRender() {
        if (HabitStorage.save({ habits: this.habits })) {
            this.render();
        }
    }

    render() {
        this.renderHabits();
        this.renderStats();
        this.renderEmptyState();
    }

    renderHabits() {
        const container = document.getElementById('habits-list');
        container.innerHTML = '';

        // Sort habits by name
        const sortedHabits = [...this.habits].sort((a, b) => 
            a.name.localeCompare(b.name)
        );

        sortedHabits.forEach(habit => {
            const card = this.createHabitCard(habit);
            container.appendChild(card);
        });
    }

    createHabitCard(habit) {
        const today = DateUtils.getToday();
        const isCompleted = habit.completedDates.includes(today);
        const streak = StreakCalculator.calculateStreak(habit.completedDates);
        const longestStreak = StreakCalculator.calculateLongestStreak(habit.completedDates);
        const totalCompletions = habit.completedDates.length;

        const card = document.createElement('div');
        card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
        card.setAttribute('role', 'listitem');

        card.innerHTML = `
            <div class="habit-info">
                <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                <div class="habit-meta">
                    <span>
                        <strong>Streak:</strong> 
                        <span class="streak-badge">${streak} day${streak !== 1 ? 's' : ''}</span>
                    </span>
                    <span><strong>Longest:</strong> ${longestStreak} day${longestStreak !== 1 ? 's' : ''}</span>
                    <span><strong>Total:</strong> ${totalCompletions} completion${totalCompletions !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="habit-actions">
                <div class="checkbox-wrapper">
                    <input 
                        type="checkbox" 
                        id="habit-${habit.id}"
                        ${isCompleted ? 'checked' : ''}
                        aria-label="Mark ${this.escapeHtml(habit.name)} as ${isCompleted ? 'incomplete' : 'complete'} for today"
                    >
                </div>
                <button 
                    class="btn btn-danger" 
                    aria-label="Delete habit ${this.escapeHtml(habit.name)}"
                >
                    Delete
                </button>
            </div>
        `;

        // Add event listeners
        const checkbox = card.querySelector(`#habit-${habit.id}`);
        checkbox.addEventListener('change', () => this.handleToggleComplete(habit.id));

        const deleteBtn = card.querySelector('.btn-danger');
        deleteBtn.addEventListener('click', () => this.handleDeleteHabit(habit.id));

        return card;
    }

    renderStats() {
        const totalHabits = this.habits.length;
        const activeStreaks = this.habits.filter(habit => 
            StreakCalculator.calculateStreak(habit.completedDates) > 0
        ).length;
        
        const longestStreak = this.habits.reduce((max, habit) => {
            const streak = StreakCalculator.calculateLongestStreak(habit.completedDates);
            return Math.max(max, streak);
        }, 0);

        const today = DateUtils.getToday();
        const todayCompleted = this.habits.filter(habit => 
            habit.completedDates.includes(today)
        ).length;

        document.getElementById('total-habits').textContent = totalHabits;
        document.getElementById('active-streaks').textContent = activeStreaks;
        document.getElementById('longest-streak').textContent = longestStreak;
        document.getElementById('today-completed').textContent = todayCompleted;
    }

    renderEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const habitsList = document.getElementById('habits-list');
        
        if (this.habits.length === 0) {
            emptyState.classList.remove('hidden');
            habitsList.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            habitsList.style.display = 'grid';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.habitTracker = new HabitTracker();
    });
} else {
    window.habitTracker = new HabitTracker();
}
