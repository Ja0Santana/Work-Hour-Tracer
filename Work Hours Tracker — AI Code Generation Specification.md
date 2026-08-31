# Work Hours Tracker — AI Code Generation Specification

## 1. Project Overview

Build a **local-first web application for personal work-hour tracking**.

The application must allow the user to record everything they do during the workday, including:

- Date
- Project
- Activity category
- Start time
- End time
- Activity description
- Result / observations

The application must automatically calculate:

- Duration of each activity
- Total hours worked per day
- Total hours worked during the current week
- Remaining hours to reach the weekly goal
- Weekly progress percentage
- Total hours worked during the month
- Current hourly rate
- Estimated earnings
- Earnings accumulated during the current month
- Timeline of activities from `00:00` to `23:00`

The application must run **entirely on the frontend** and work locally without a backend.

---

# 2. Main Goals

The application should make it extremely easy for the user to answer:

> What did I work on today?

> How many hours did I work?

> How many hours do I still need to work this week?

> How much have I earned so far?

> How much should I receive at the end of the month?

The application should prioritize:

1. Simplicity
2. Fast data entry
3. Clear visualization
4. Accurate time calculations
5. Local data persistence
6. Responsive design
7. Professional UI
8. Easy future extensibility

---

# 3. Technology Stack

Use:

- React
- TypeScript
- Vite
- Modern CSS or Tailwind CSS
- LocalStorage for persistence

Avoid introducing a backend.

Avoid:

- REST APIs
- Database servers
- Authentication
- External cloud services
- Firebase
- Supabase
- MongoDB
- PostgreSQL

The application must work after:

```bash
npm install
npm run dev
```

---

# 4. Architecture

Use a modular frontend architecture.

Recommended structure:

```text
src/
├── components/
│   ├── Dashboard/
│   ├── TimeEntry/
│   ├── Timeline/
│   ├── WeeklyGoal/
│   ├── MonthlySummary/
│   ├── Header/
│   └── common/
│
├── pages/
│   ├── Dashboard.tsx
│   ├── History.tsx
│   └── Settings.tsx
│
├── hooks/
│   ├── useTimeEntries.ts
│   └── useSettings.ts
│
├── services/
│   └── storage.ts
│
├── types/
│   ├── timeEntry.ts
│   └── settings.ts
│
├── utils/
│   ├── time.ts
│   ├── calculations.ts
│   └── date.ts
│
├── App.tsx
└── main.tsx
```

The exact structure may be adjusted if there is a strong technical reason.

Do not over-engineer the application.

---

# 5. Data Model

## TimeEntry

Each work activity must have:

```ts
interface TimeEntry {
  id: string;
  date: string;
  project: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
```

---

# 6. Activity Categories

Provide a predefined list:

```text
Analysis
Development
Bug Fix
Testing
Planning
Documentation
UI/UX
Meeting
DevOps / Infrastructure
Study
Maintenance
Other
```

The UI should display friendly labels.

The category should be selected through a dropdown.

---

# 7. Application Settings

Create persistent settings:

```ts
interface AppSettings {
  weeklyGoalMinutes: number;
  hourlyRate: number;
}
```

Example:

```text
Weekly goal: 40 hours
Hourly rate: R$ 35.00
```

Store these values in LocalStorage.

---

# 8. Time Representation

Internally, calculations should preferably use **minutes** rather than floating-point hours.

Example:

```text
1 hour     = 60 minutes
7h30       = 450 minutes
40h        = 2400 minutes
```

This avoids precision problems.

The UI should display durations using:

```text
HHh MMmin
```

or:

```text
HH:MM
```

Choose one format and use it consistently.

---

# 9. Recording Activities

The primary action must be:

```text
+ Add activity
```

The form should contain:

### Date

Default:

```text
Today
```

Allow the user to change the date.

### Project

Free-text field or reusable project selector.

### Category

Dropdown using the predefined categories.

### Start time

Example:

```text
13:00
```

### End time

Example:

```text
17:00
```

### Activity

Example:

```text
Analysis of the frontend repository
```

### Result / observations

Example:

```text
Analyzed the interface, existing functionalities,
application logic and identified possible improvements.
```

---

# 10. Automatic Duration Calculation

When the user enters:

```text
13:00
17:00
```

the application must calculate:

```text
4h00
```

Do not ask the user to manually enter the duration.

---

# 11. Midnight Activities

Activities crossing midnight should be handled safely.

Example:

```text
22:00 → 02:00
```

should be interpreted as:

```text
4 hours
```

However, for timeline visualization, preferably recommend splitting activities crossing midnight into two records:

```text
22:00 → 23:59
00:00 → 02:00
```

The application must not generate negative durations.

---

# 12. Dashboard

The Dashboard is the main screen.

It should show the current week prominently.

Example:

```text
WEEKLY GOAL

Worked
27h30

Goal
40h00

Remaining
12h30

Progress
68.75%
```

Also display:

```text
Hourly rate
R$ 35.00

Accumulated this week
R$ 962.50
```

---

# 13. Weekly Goal Calculation

The user defines a weekly goal.

Example:

```text
40h00
```

If the user worked:

```text
27h30
```

the application must calculate:

```text
Remaining:
12h30
```

Formula:

```text
remaining = max(weeklyGoal - worked, 0)
```

The application must never display a negative remaining value.

---

# 14. Weekly Progress

Calculate:

```text
progress = worked / weeklyGoal
```

Example:

```text
27h30 / 40h00 = 68.75%
```

If the user exceeds the goal:

```text
43h30 / 40h00 = 108.75%
```

The progress indicator may visually stop at 100%, but the actual value must remain available.

---

# 15. Weekly Surplus

If:

```text
Worked = 43h30
Goal = 40h00
```

display:

```text
Goal reached
+3h30 above goal
```

instead of:

```text
-3h30 remaining
```

---

# 16. Financial Calculations

The application must allow the user to configure:

```text
Hourly rate
```

Example:

```text
R$ 35.00
```

Calculate earnings using:

```text
earnings = workedMinutes / 60 * hourlyRate
```

Examples:

```text
8h × R$35 = R$280.00

20h30 × R$35 = R$717.50

40h × R$35 = R$1,400.00
```

---

# 17. Monthly Summary

Create a monthly summary.

Example:

```text
AUGUST 2026

Worked
152h30

Hourly rate
R$ 35.00

Estimated earnings
R$ 5,337.50
```

The month must be calculated from the dates of the recorded activities.

Do not simply multiply the weekly goal by the number of weeks.

Only actual registered work hours count.

---

# 18. Historical Monthly Data

The system must preserve the date associated with each activity.

This is important because the hourly rate may change in the future.

Do not destroy historical records when the current hourly rate changes.

For the first version, the application may use the current hourly rate for calculations.

However, structure the data model so that a future version could support:

```ts
hourlyRateAtEntry?: number;
```

if historical billing rates are required.

---

# 19. Daily Summary

Display the total worked on the selected day.

Example:

```text
Today

08:00 → 09:00
Meeting
1h00

09:00 → 12:00
Development
3h00

13:00 → 17:00
Frontend analysis
4h00

Total:
8h00
```

---

# 20. Timeline

Create a 24-hour timeline.

Hours:

```text
00 01 02 03 04 05 06 07 08 09 10 11
12 13 14 15 16 17 18 19 20 21 22 23
```

Activities must visually occupy the corresponding time interval.

Example:

```text
12    13    14    15    16    17    18

            ┌───────────────────┐
            │ Frontend Analysis │
            └───────────────────┘
```

The timeline should make it immediately clear:

- when the user worked;
- how long they worked;
- when there were gaps;
- which activity occupied each period.

---

# 21. Timeline Interaction

Clicking an activity in the timeline should open its details.

Possible actions:

```text
Edit
Delete
View details
```

---

# 22. Activity List

The Dashboard should also contain a chronological activity list.

Example:

```text
Today — August 31

13:00 – 17:00
Frontend Analysis
System X
4h00

09:00 – 12:00
Development
System X
3h00

08:00 – 09:00
Meeting
1h00
```

Sort descending by start time or allow the user to choose.

---

# 23. Editing Activities

Every activity must be editable.

When editing:

- preserve the ID;
- update `updatedAt`;
- recalculate duration;
- update all dashboard statistics automatically.

---

# 24. Deleting Activities

Allow deletion.

Deletion must require confirmation.

Example:

```text
Delete this activity?

This will remove 4h00 from your work records.

Cancel
Delete
```

---

# 25. LocalStorage

All data must persist after:

- browser refresh;
- closing the browser;
- restarting the development server.

Use a centralized storage service.

Recommended keys:

```text
work-hours.entries
work-hours.settings
```

Avoid accessing LocalStorage directly from every component.

---

# 26. Import / Export

Add a Settings section with:

```text
Export data
Import data
```

Export all data to JSON.

Example:

```json
{
  "version": 1,
  "settings": {},
  "entries": []
}
```

The import system must validate the file before replacing existing data.

If possible, warn the user:

```text
Importing this file will replace your current local data.
```

---

# 27. Settings Screen

The Settings page should allow:

### Weekly goal

Example:

```text
40h00
```

### Hourly rate

Example:

```text
R$ 35.00
```

### Data management

```text
Export data
Import data
Clear all data
```

Clearing all data must require confirmation.

---

# 28. Currency

Default currency:

```text
BRL — Brazilian Real
```

Display:

```text
R$ 35,00
```

Use proper Brazilian number formatting.

Example:

```text
R$ 5.337,50
```

---

# 29. Responsive Design

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop should prioritize the dashboard and timeline.

Mobile should reorganize the interface into cards and vertically stacked sections.

The timeline may become horizontally scrollable on small screens.

---

# 30. Visual Design

Use a clean, modern productivity application aesthetic.

Prioritize:

- whitespace;
- clear hierarchy;
- readable typography;
- subtle borders;
- rounded cards;
- restrained shadows;
- clear visual feedback;
- accessible contrast.

Avoid excessive decoration.

The interface should feel like a professional time-tracking application rather than a spreadsheet.

---

# 31. Dashboard Cards

Use visually distinct cards for:

```text
Hours worked
Weekly goal
Remaining
Progress
Hourly rate
Estimated earnings
```

Do not overload the dashboard with unnecessary information.

---

# 32. Progress Visualization

Use a progress bar or circular indicator.

Example:

```text
██████████████░░░░░░

68.75%
```

When the goal is reached:

```text
████████████████████

100%
Goal reached
```

If the user exceeds the goal, show:

```text
100%+
+3h30
```

---

# 33. Current Week

The Dashboard should automatically determine the current week based on the current date.

Default week:

```text
Monday → Sunday
```

Allow navigation:

```text
← Previous week
Current week
Next week →
```

The user must be able to inspect historical weeks.

---

# 34. Current Month

Similarly, allow navigation between months:

```text
← July
August 2026
September →
```

The monthly summary should update automatically.

---

# 35. Week Calendar

Show the seven days of the current week.

Example:

```text
MON      TUE      WED      THU      FRI      SAT      SUN
8h       7h30     8h       6h       8h       0h       0h
```

Selecting a day should filter the activity list and timeline.

---

# 36. Overlapping Activities

The application should detect overlapping activities.

Example:

```text
13:00 → 15:00 Activity A
14:00 → 16:00 Activity B
```

Display a warning:

```text
These activities overlap by 1 hour.
```

Do not silently count overlapping periods as if they were separate real working time.

For the first version, the system may still calculate total entry durations, but the UI must clearly warn the user.

---

# 37. Duplicate / Invalid Data

Validate:

- End time is not empty.
- Start time is not empty.
- Activity description is not empty.
- Project may be optional if desired.
- End time cannot produce invalid duration.
- Date must be valid.
- Hourly rate cannot be negative.
- Weekly goal cannot be negative.

---

# 38. Performance

The application is expected to contain a relatively small number of records.

Nevertheless:

- avoid unnecessary renders;
- centralize calculations;
- use memoization when appropriate;
- avoid excessive LocalStorage writes.

Do not introduce unnecessary state-management libraries unless required.

React Context or a lightweight custom hook is sufficient.

---

# 39. Accessibility

The application must support:

- keyboard navigation;
- visible focus states;
- semantic HTML;
- accessible labels;
- sufficient color contrast;
- screen-reader-friendly controls;
- buttons with meaningful accessible names.

Do not rely exclusively on color to communicate status.

---

# 40. Error Handling

Errors should be communicated clearly.

Examples:

```text
Unable to save activity.
Please check the information and try again.
```

For import:

```text
Invalid backup file.
No data was changed.
```

---

# 41. Empty States

When no activities exist:

```text
No activities recorded today.

Start tracking your work by adding your first activity.
```

For a new month:

```text
No work hours recorded for this month yet.
```

---

# 42. Dashboard Example

The finished application should conceptually provide:

```text
┌─────────────────────────────────────────────────────────┐
│ Work Hours Tracker                         Aug 31, 2026 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ WEEKLY PROGRESS                                         │
│                                                         │
│  Worked       Goal        Remaining       Progress      │
│  27h30        40h00       12h30           68.75%        │
│                                                         │
│  ███████████████░░░░░                                   │
│                                                         │
│  Hourly rate: R$ 35,00                                  │
│  Accumulated: R$ 962,50                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ TODAY                                                   │
│                                                         │
│ 13:00 ─────────────── 17:00                             │
│        Frontend Analysis                                │
│        4h00                                              │
│                                                         │
│ [+ Add activity]                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ TIMELINE                                                │
│                                                         │
│ 08 09 10 11 12 13 14 15 16 17 18                       │
│             ████      █████████████                     │
│             Meeting   Frontend Analysis                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 43. Business Rules

The implementation must respect these rules:

### Rule 1

Only recorded activities count toward worked hours.

### Rule 2

Weekly goal is independent of monthly goal.

### Rule 3

Changing the weekly goal does not modify historical activities.

### Rule 4

Changing the hourly rate does not modify historical activities.

### Rule 5

Monthly earnings are based on actual recorded hours.

### Rule 6

Remaining weekly hours cannot be negative.

### Rule 7

Weekly progress may exceed 100%, but the visual indicator may cap at 100%.

### Rule 8

All calculations must use minutes internally whenever possible.

### Rule 9

All user data must remain local.

### Rule 10

Deleting an activity must immediately update:

- daily total;
- weekly total;
- weekly remaining;
- weekly progress;
- monthly total;
- estimated earnings;
- timeline.

---

# 44. Code Quality Requirements

The generated code must:

- use TypeScript properly;
- avoid `any` unless strictly necessary;
- avoid duplicated business logic;
- keep components reasonably small;
- separate UI from calculations;
- centralize date/time calculations;
- centralize persistence;
- use meaningful variable names;
- avoid magic numbers;
- avoid unnecessary dependencies;
- include reusable utility functions.

Do not put business calculations directly inside JSX when they can be extracted into utilities.

---

# 45. Suggested Utility Functions

Implement reusable functions such as:

```ts
calculateDuration(startTime, endTime)

calculateTotalMinutes(entries)

calculateWeeklyMinutes(entries, weekStart)

calculateMonthlyMinutes(entries, year, month)

calculateRemainingMinutes(worked, goal)

calculateProgress(worked, goal)

calculateEarnings(minutes, hourlyRate)

formatDuration(minutes)

formatCurrency(value)

getWeekStart(date)

getWeekEnd(date)

isSameDay(dateA, dateB)
```

---

# 46. Testing

Create unit tests for critical business logic.

At minimum test:

### Duration

```text
13:00 → 17:00 = 240 minutes
```

### Fractional hour

```text
13:00 → 13:30 = 30 minutes
```

### Weekly goal

```text
40h goal
27h30 worked
12h30 remaining
```

### Goal exceeded

```text
40h goal
43h30 worked
0h remaining
3h30 surplus
```

### Earnings

```text
30 minutes × R$35/hour = R$17.50
```

### Monthly calculation

Ensure only activities inside the selected month are counted.

### Week calculation

Ensure activities from adjacent weeks are not counted.

---

# 47. Acceptance Criteria

The application is considered complete when:

- [ ] User can create an activity.
- [ ] User can edit an activity.
- [ ] User can delete an activity.
- [ ] Activity duration is calculated automatically.
- [ ] Activities persist after browser refresh.
- [ ] Weekly goal can be configured.
- [ ] Hourly rate can be configured.
- [ ] Weekly worked hours update automatically.
- [ ] Remaining weekly hours update automatically.
- [ ] Weekly progress updates automatically.
- [ ] Weekly surplus is displayed correctly.
- [ ] Monthly hours update automatically.
- [ ] Monthly earnings update automatically.
- [ ] Timeline displays activities from 00h to 23h.
- [ ] Day selection works.
- [ ] Week navigation works.
- [ ] Month navigation works.
- [ ] Activity overlap is detected.
- [ ] Data can be exported.
- [ ] Data can be imported.
- [ ] All data remains local.
- [ ] Application is responsive.
- [ ] Application has accessible controls.
- [ ] Critical calculations have tests.
- [ ] No backend is required.

---

# 48. Development Strategy

Implement the project incrementally.

### Phase 1 — Foundation

Create:

- Vite project;
- React;
- TypeScript;
- base layout;
- routing/navigation if necessary;
- global styles.

### Phase 2 — Data Layer

Implement:

- types;
- LocalStorage service;
- settings;
- time entries.

### Phase 3 — Time Tracking

Implement:

- activity form;
- activity list;
- editing;
- deleting;
- duration calculation.

### Phase 4 — Weekly System

Implement:

- weekly goal;
- weekly calculation;
- remaining hours;
- progress;
- surplus.

### Phase 5 — Financial System

Implement:

- hourly rate;
- weekly earnings;
- monthly earnings;
- currency formatting.

### Phase 6 — Timeline

Implement:

- 24-hour timeline;
- activity blocks;
- day filtering;
- activity interaction.

### Phase 7 — History

Implement:

- weekly navigation;
- monthly navigation;
- historical records;
- daily summaries.

### Phase 8 — Backup

Implement:

- JSON export;
- JSON import;
- validation;
- clear-data functionality.

### Phase 9 — UX

Improve:

- responsive behavior;
- accessibility;
- empty states;
- loading states where applicable;
- error states;
- animations/transitions where appropriate.

### Phase 10 — Testing and Review

Verify:

- calculations;
- edge cases;
- LocalStorage;
- responsive UI;
- accessibility;
- TypeScript errors;
- linting;
- production build.

---

# 49. Important AI Instructions

You are acting as a **senior frontend engineer**.

Do not blindly implement every detail if it creates unnecessary complexity.

Prioritize:

```text
Correctness
>
Maintainability
>
Usability
>
Visual polish
>
Additional features
```

Do not add features outside this specification without a clear technical reason.

Do not introduce a backend.

Do not use fake APIs.

Do not hardcode calculated values.

All dashboard numbers must come from the stored activity records and application settings.

The application must remain functional after refreshing the browser.

Before considering the implementation complete, verify every acceptance criterion.

---

# 50. Definition of Done

The project is finished when the user can open the application locally and perform the following workflow without any manual calculation:

```text
1. Configure:
   Weekly goal = 40h
   Hourly rate = R$35/h

2. Add:
   13:00 → 17:00
   Frontend repository analysis

3. Application calculates:
   Activity = 4h
   Daily total = 4h
   Weekly total = 4h
   Remaining = 36h
   Progress = 10%
   Earnings = R$140

4. Continue adding activities during the week.

5. Dashboard automatically updates.

6. At the end of the month:
   Monthly hours are calculated automatically.
   Estimated earnings are calculated automatically.

7. User can export a complete backup of the data.
```

The final result should feel like a **small, polished personal work-hours management application**, not simply a form connected to LocalStorage.