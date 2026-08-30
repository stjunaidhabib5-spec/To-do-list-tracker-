# Product Requirements Document (PRD)
## Personal Task & Calendar Tracker

### 1. Project Overview
A centralized, single-user web application designed to track tasks, deadlines, and milestones. The system categorizes items into two primary buckets: **Academic** (e.g., university coursework, engineering projects, club executive responsibilities) and **Skill Acquisition** (e.g., competitive programming on Codeforces, machine learning on Kaggle, learning new automation tools like n8n). 

### 2. Core Features & Requirements
* **Task Management (CRUD):** Ability to create, read, update, and delete tasks.
* **Categorization:** Strictly divided into "Academic" and "Skill Acquisition" tags.
* **Calendar Interface:** A visual monthly/weekly grid displaying tasks on their respective due dates.
* **Status Tracking:** A one-click toggle to mark tasks as "Completed" or "Pending."
* **Filtering:** Options to filter the calendar and dashboard by category or completion status.

### 3. Technology Stack
* **Frontend Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **Calendar Library:** React Big Calendar or FullCalendar
* **Database & API:** Supabase (PostgreSQL)
* **Deployment & Hosting:** Vercel

### 4. Database Schema (Supabase/PostgreSQL)
**Table Name:** `tasks`

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary key, auto-generated |
| `title` | Text | Short name of the task (e.g., "Solve 5 Beecrowd problems", "PCB Design Draft") |
| `description` | Text | Detailed notes, requirements, or links |
| `category` | Text | Restricted to 'Academic' or 'Skill Acquisition' |
| `due_date` | Timestamp | Date and time the task is scheduled |
| `is_completed` | Boolean | Default `false` |
| `created_at` | Timestamp | Auto-generated timestamp |

### 5. Development Phases

#### Phase 1: Environment & Project Setup
* Initialize the Next.js project using `npx create-next-app@latest`.
* Configure Tailwind CSS for styling.
* Set up the Git repository and initial commit.

#### Phase 2: Database Configuration (Supabase)
* Create a new Supabase project.
* Execute the SQL script to build the `tasks` table.
* Obtain the project API keys for frontend integration.

#### Phase 3: UI/UX Development (Frontend)
* Build the main dashboard layout with a clean, responsive navigation header.
* Create the "Add Task" modal/form including title, description, category dropdown, and date picker.
* Integrate the Calendar component and populate it with static mock data to test the rendering layout.
* Design the individual task cards with a checkbox for the `is_completed` toggle.

#### Phase 4: Application Logic & Integration (Backend/CRUD)
* Install the Supabase client library (`@supabase/supabase-js`).
* Write asynchronous functions to fetch the live tasks from the database.
* Wire the "Add Task" form to trigger an `INSERT` operation.
* Wire the completion checkbox to trigger an `UPDATE` operation, instantly reflecting the task as done.
* Ensure the calendar dynamically re-renders and filters correctly when data changes.

#### Phase 5: Testing & Deployment
* Perform local testing to ensure tasks appear on the correct dates and persist upon page refresh.
* Push the final code to GitHub.
* Import the repository into Vercel for continuous deployment.
* Add the Supabase URL and Anon Key to Vercel's Environment Variables.
* Deploy to production and verify live functionality.
