# Habit Tracker React + TypeScript MVP Plan

## Overview
Replace the existing vanilla JavaScript habit-tracker with a React + TypeScript single-page app. Focus on MVP core functionality: adding habits, daily tracking, streak visualization, and a simple today's dashboard.

## Tech Stack
- **React 18** with **TypeScript**
- **Vite** for build tooling and dev server
- **localStorage** for data persistence
- **Plain CSS** (no frameworks) for styling
- **No backend/database** - pure client-side app

## Core MVP Features (Must-Haves)
1. Add new habits (name only, 1-50 characters)
2. Mark habits as complete/incomplete for today
3. Visual streak counter per habit
4. Today's dashboard showing all habits with completion status
5. Data persistence via localStorage
6. Mobile-responsive layout

## Out of Scope for MVP (Nice-to-Haves)
- Edit/delete habits
- Historical data view
- Statistics beyond streaks
- Habit categories/tags
- Export/import
- Reminders/notifications
- Dark mode

## Implementation Plan

### Milestone 1: Project Setup & Foundation
**Goal**: Working React + TypeScript dev environment

**Tasks**:
1. Remove existing vanilla JS files (`app.js`, `index.html`, `styles.css`)
2. Initialize Vite + React + TypeScript project in same directory
3. Configure TypeScript with strict mode
4. Set up basic project structure:
   - `src/` directory
   - `src/components/` for React components
   - `src/types/` for TypeScript interfaces
   - `src/utils/` for helper functions
   - `src/App.tsx` as main component
   - `src/index.css` for global styles
5. Update `package.json` with React, TypeScript, Vite dependencies
6. Verify dev server runs (`npm run dev`)

**Dependencies**: None (foundation)

**Files to create/modify**:
- `package.json` - Add React, TypeScript, Vite dependencies
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `index.html` - Vite entry point (minimal)
- `src/main.tsx` - React entry point
- `src/App.tsx` - Main app component
- `src/index.css` - Base styles

### Milestone 2: Core Data Models & Types
**Goal**: Type-safe data structures for habits

**Tasks**:
1. Define TypeScript interfaces:
   - `Habit` interface: `id`, `name`, `completedDates: string[]`
   - `AppState` interface for habit list
2. Create date utility functions:
   - `getToday(): string` - Returns YYYY-MM-DD format
   - `isToday(date: string): boolean`
   - `formatDate(date: Date): string`
3. Create localStorage utility:
   - `loadHabits(): Habit[]` - Load from localStorage with error handling
   - `saveHabits(habits: Habit[]): void` - Save with quota error handling
   - Data validation on load

**Dependencies**: Milestone 1

**Files to create**:
- `src/types/habit.ts` - Habit and AppState interfaces
- `src/utils/dateUtils.ts` - Date helper functions
- `src/utils/storage.ts` - localStorage operations

### Milestone 3: Basic UI - Add Habit Form
**Goal**: Users can add new habits

**Tasks**:
1. Create `AddHabitForm` component:
   - Text input with validation (1-50 chars)
   - Submit button
   - Duplicate name prevention
   - Error message display
2. Add form to `App.tsx`
3. Basic styling for form (centered, clean)
4. Handle form submission - add habit to state

**Dependencies**: Milestone 2 (needs Habit type and state)

**Files to create**:
- `src/components/AddHabitForm.tsx`
- Update `src/App.tsx` to include form
- Add form styles to `src/index.css`

### Milestone 4: Habit List & Today's Dashboard
**Goal**: Display all habits with today's completion status

**Tasks**:
1. Create `HabitList` component:
   - Renders list of all habits
   - Shows habit name
   - Checkbox for today's completion
   - Empty state message when no habits
2. Create `HabitCard` component (if needed for structure):
   - Individual habit display
   - Checkbox for completion
3. Integrate into `App.tsx` as "Today's Habits" section
4. Basic responsive layout (mobile-first)

**Dependencies**: Milestone 3 (needs habits in state)

**Files to create**:
- `src/components/HabitList.tsx`
- `src/components/HabitCard.tsx` (optional, can be inline)
- Update `src/App.tsx`
- Add list/card styles to `src/index.css`

### Milestone 5: Streak Calculation & Display
**Goal**: Show visual streak counter for each habit

**Tasks**:
1. Create streak calculation utility:
   - `calculateStreak(completedDates: string[]): number`
   - Handles consecutive days logic (including today if completed)
   - Returns 0 if no recent completion
2. Add streak display to `HabitCard`:
   - Visual badge/counter showing current streak
   - Format: "🔥 5 days" or similar
3. Update UI to show streak prominently

**Dependencies**: Milestone 4 (needs habit display)

**Files to create/modify**:
- `src/utils/streakCalculator.ts` - Streak calculation logic
- Update `src/components/HabitCard.tsx` or `HabitList.tsx` to show streaks
- Add streak badge styles

### Milestone 6: State Management & Persistence
**Goal**: Connect UI to localStorage, persist all changes

**Tasks**:
1. Implement React state management in `App.tsx`:
   - `useState<Habit[]>` for habits list
   - Load habits from localStorage on mount
   - Save to localStorage on every state change (use `useEffect`)
2. Connect all UI actions to state:
   - Add habit → update state → save
   - Toggle completion → update state → save
3. Handle edge cases:
   - localStorage quota exceeded (show error toast)
   - Invalid/corrupted data (reset to empty array)
4. Add loading state (optional, simple)

**Dependencies**: Milestones 2, 3, 4, 5 (needs all components working)

**Files to modify**:
- `src/App.tsx` - Add state management and persistence
- `src/utils/storage.ts` - Ensure error handling is robust

### Milestone 7: Mobile Responsiveness & Polish
**Goal**: App works well on mobile devices

**Tasks**:
1. Add responsive CSS:
   - Mobile-first breakpoints
   - Touch-friendly button/checkbox sizes
   - Proper spacing on small screens
2. Test on mobile viewport (browser dev tools)
3. Ensure form inputs are mobile-friendly
4. Polish visual design:
   - Consistent spacing
   - Readable typography
   - Clear visual hierarchy
   - Accessible colors (WCAG AA)

**Dependencies**: All previous milestones

**Files to modify**:
- `src/index.css` - Add responsive styles and polish

## File Structure (Final)
```
habit-tracker/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── habit.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── storage.ts
│   │   └── streakCalculator.ts
│   └── components/
│       ├── AddHabitForm.tsx
│       ├── HabitList.tsx
│       └── HabitCard.tsx (optional)
└── rules/
    └── anti-pitfall-guidelines.mdc
```

## Development Workflow
1. Start with Milestone 1, complete fully before moving on
2. Test each milestone independently
3. Use `npm run dev` for development
4. Keep commits small and focused per milestone
5. Test localStorage persistence in browser dev tools

## Success Criteria
- Users can add habits (with validation)
- Users can mark habits complete/incomplete for today
- Streak counter displays correctly for each habit
- All data persists across page refreshes
- App is usable on mobile devices (320px+ width)
- No console errors or TypeScript errors
- Happy path works end-to-end

## Risk Mitigation
- **localStorage quota**: Handle errors gracefully, show user message
- **Date/timezone issues**: Use consistent date format (YYYY-MM-DD), local timezone
- **TypeScript complexity**: Start simple, add types incrementally
- **State management**: Keep it simple with useState, avoid over-engineering with Context/Redux

## Estimated Timeline (2 weeks)
- Milestone 1: 1 day (setup)
- Milestone 2: 1 day (types/utils)
- Milestone 3: 1 day (form)
- Milestone 4: 2 days (list/dashboard)
- Milestone 5: 1 day (streaks)
- Milestone 6: 2 days (state/persistence)
- Milestone 7: 2 days (responsive/polish)
- Buffer/testing: 3 days

Total: ~14 days

## Implementation Todos
1. Milestone 1: Set up Vite + React + TypeScript project, remove vanilla JS files, configure build tools
2. Milestone 2: Define TypeScript interfaces (Habit, AppState) and create utility functions (dateUtils, storage)
3. Milestone 3: Build AddHabitForm component with validation and duplicate prevention
4. Milestone 4: Create HabitList component showing today's habits with completion checkboxes
5. Milestone 5: Implement streak calculation logic and display streak badges on habit cards
6. Milestone 6: Connect React state to localStorage, persist all changes with error handling
7. Milestone 7: Add mobile-responsive CSS and polish UI for production readiness
