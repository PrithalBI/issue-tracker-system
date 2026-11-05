# Interview Portal Submission Checklist

## Files
- Upload `issue-tracker-system.zip` if the portal requests a source-code/project archive.
- If the portal asks for a GitHub URL, first push this source to your own repository and submit that URL.
- If the portal asks for a live demo URL, deploy the app and verify both frontend and API before submitting. No live URL is included because deployment has not been performed.

## Before uploading
- [ ] Extract the ZIP once and confirm `frontend`, `backend`, `README.md`, and `BRD.md` are present.
- [ ] Configure local `.env` files using the `.env.example` templates.
- [ ] Run the application locally and test both user and admin flows.
- [ ] Do not upload `.env`, database credentials, JWT secrets, or real passwords.
- [ ] Be ready to explain the architecture, JWT authentication, role-based authorization, MongoDB schemas, and REST endpoints.

## Suggested project description for the portal

**IssueTrack — Full-Stack Issue Tracking and Management System**

Developed a full-stack web application using React, Node.js, Express, and MongoDB to manage software issues through their lifecycle. Implemented JWT authentication, role-based access for administrators and users, issue creation and editing, assignment, status tracking, comments, and dashboard statistics. Designed REST APIs with server-side authorization and documented local setup and cloud deployment steps.
