You are a product designer and business analyst. Below is a detailed specification for an Instructor Backoffice of an online learning platform. Your task is to summarize all instructor-facing features clearly and concisely, following the rules provided.

Platform Rules (Always Apply)
Publishing

Only published courses appear on the website or app.

Visibility

Everyone — course is visible to all users.
Signed In — only logged-in users can see the course.

Access

Open — any user can start the course normally.
On Invitation — only invited or enrolled users can access lessons.

Progress Tracking

Track lesson completion per learner.
Show completed / incomplete status per lesson.
Show overall course completion percentage.

Quiz Attempts & Points

Multiple attempts are allowed on each quiz.
Points decrease with each additional attempt, based on the instructor's rewards settings.
Total accumulated points determine the learner's badge level.


Instructor Features to Summarize
1. Courses Dashboard

Two views: Kanban and List.
Search courses by name.
Each course card/row shows: title, tags, view count, total lessons, total duration, and a Published badge if live.
Actions per course: Edit (opens course form) and Share (copy or generate course link).
A + button opens a small popup to enter a course name and create it instantly.


2. Course Form (Edit Course)
Header actions:

Toggle: Publish on Website (ON / OFF).
Preview — opens the learner-facing view.
Add Attendees — wizard to enroll learners directly via email.
Contact Attendees — wizard to email enrolled learners.
Course image upload.

Course fields:

Title (required)
Tags
Website (required when published)
Responsible / Course Admin (select a user)

Tabs inside the form:

Content — lessons list
Description — course-level description shown to learners
Options — visibility, access rules, course admin
Quiz — list of quizzes linked to this course


3. Lessons / Content Management (inside Content tab)

List of lessons showing: lesson title and type (Video / Document / Image / Quiz).
Each lesson has a 3-dot menu: Edit / Delete (delete requires confirmation).
Add Content button opens the lesson editor popup.


4. Lesson Editor (Add / Edit — popup with 3 tabs)
Tab 1 — Content:

Lesson title (required)
Type selector: Video / Document / Image
Responsible (optional)
Type-specific fields:

Video: URL (YouTube / Drive) + duration
Document: file upload + Allow Download toggle
Image: image upload + Allow Download toggle



Tab 2 — Description:

Rich text area for lesson description shown to learners.

Tab 3 — Additional Attachments:

Add extra resources as a file upload or an external URL.
Attachments appear on the learner's side under the lesson.


5. Course Options (inside Options tab)
Visibility ("Show course to"):

Everyone
Signed In

Access Rule:

Open
On Invitation
On Payment (shows a Price field when selected)

Course Admin:

Select the responsible person for this course.


6. Quizzes (inside Quiz tab)

List of quizzes linked to the course.
Each quiz has: Edit / Delete (delete requires confirmation).
Add Quiz button opens the quiz builder.


7. Quiz Builder
Left panel:

Numbered question list.
Buttons: Add Question and Rewards.

Question editor:

Question text input.
Multiple answer options (add as many as needed).
Mark one or more options as correct.

Rewards (points per attempt):

1st attempt → X points
2nd attempt → Y points
3rd attempt → Z points
4th attempt and beyond → W points


8. Reporting Dashboard
Overview cards (clickable — filters the table below):

Total Participants
Yet to Start
In Progress
Completed

Learner progress table columns:

Sr. No.
Course Name
Participant Name
Enrolled Date
Start Date
Time Spent
Completion Percentage
Completed Date
Status (Yet to Start / In Progress / Completed)

Customizable columns:

A side panel lets the instructor show or hide columns using checkboxes.