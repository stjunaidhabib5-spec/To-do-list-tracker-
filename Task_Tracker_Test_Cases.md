# Test Cases: Personal Task & Calendar Tracker

This document outlines the test cases for the development and QA phases of the task tracking application. These tests ensure all core functionalities work as expected before deploying to production.

## 1. Task Management (CRUD)

| Test Case ID | Description | Pre-conditions | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-1.1** | Create a new task | App is loaded, user is on dashboard | 1. Click "Add Task".<br>2. Enter Title (e.g., "Draft DIU Robotics Club report").<br>3. Select Due Date.<br>4. Click Save. | The task is successfully saved to the database and appears on the dashboard. |
| **TC-1.2** | Read/Display tasks | Tasks exist in the Supabase database | 1. Open the application.<br>2. Navigate to the task list view. | All existing tasks are fetched and displayed accurately. |
| **TC-1.3** | Update task details | At least one task exists | 1. Click on an existing task.<br>2. Edit the description.<br>3. Click "Update". | The task reflects the new description locally and in the database. |
| **TC-1.4** | Delete a task | At least one task exists | 1. Click the "Delete" icon on a task.<br>2. Confirm deletion. | The task is removed from the UI and the database. |

## 2. Categorization & Assignment

| Test Case ID | Description | Pre-conditions | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-2.1** | Assign "Academic" category | "Add Task" modal is open | 1. Fill out task details.<br>2. Select "Academic" from the category dropdown.<br>3. Save task. | Task is created with the "Academic" tag visually displayed. |
| **TC-2.2** | Assign "Skill Acquisition" category | "Add Task" modal is open | 1. Fill out task details (e.g., "Complete n8n automation workflow").<br>2. Select "Skill Acquisition".<br>3. Save task. | Task is created with the "Skill Acquisition" tag visually displayed. |

## 3. Status Tracking

| Test Case ID | Description | Pre-conditions | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-3.1** | Mark task as completed | A pending task exists | 1. Click the checkbox next to a pending task. | Checkbox is ticked, text is crossed out (optional), and database `is_completed` updates to `true`. |
| **TC-3.2** | Unmark completed task | A completed task exists | 1. Click the checkbox next to a completed task. | Checkbox is unticked, task appears pending, and database updates to `false`. |

## 4. Calendar Interface

| Test Case ID | Description | Pre-conditions | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-4.1** | Render task on correct date | Calendar view is open | 1. Create a task for a specific future date (e.g., 15th of the month).<br>2. Check the calendar grid. | The task block appears exactly on the 15th of the month in the calendar grid. |
| **TC-4.2** | Calendar navigation | Calendar view is open | 1. Click "Next Month".<br>2. Click "Previous Month". | The calendar accurately displays the correct month and its respective tasks without crashing. |

## 5. Filtering

| Test Case ID | Description | Pre-conditions | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-5.1** | Filter by Category | Multiple tasks of both categories exist | 1. Click the "Academic" filter button. | Only tasks with the "Academic" category are displayed; others are hidden. |
| **TC-5.2** | Filter by Status | Both pending and completed tasks exist | 1. Click the "Show Pending Only" filter. | Completed tasks disappear from the view, showing only active tasks. |
