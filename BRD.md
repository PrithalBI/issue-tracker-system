# Business Requirements Document (BRD)
## Issue Tracker System

**Document status:** Initial implementation baseline  
**Version:** 1.0

## 1. Introduction

The Issue Tracker System is a web application for recording, assigning, monitoring, discussing, and resolving work issues. It provides a centralized place for administrators and users to manage issue lifecycles.

## 2. Business objectives

- Centralize issue reporting and tracking.
- Make ownership and responsibility visible through assignment.
- Provide a consistent issue lifecycle.
- Improve communication through issue comments.
- Give administrators a quick view of issue counts and workload.

## 3. Scope

### In scope

- User registration and login.
- Admin authentication and role-based permissions.
- Issue creation, editing, viewing, and deletion.
- Assignment of issues to users by an admin.
- Status tracking: Open, In Progress, Closed.
- Comments on issues.
- Dashboard counts.
- Remote hosting and developer documentation.

### Out of scope for this release

- Email, SMS, or push notifications.
- File attachments.
- SLA and escalation rules.
- Advanced analytics and exports.
- Multi-tenant organizations and teams.

## 4. Stakeholders and user roles

| Role | Responsibilities |
|---|---|
| Admin | View all issues, assign users, manage issues, and monitor dashboard |
| User | Create issues, view created/assigned issues, update permitted fields/status, and comment |

## 5. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall allow a user to register with name, email, and password. | Must |
| FR-02 | The system shall authenticate users and admins. | Must |
| FR-03 | The system shall restrict protected functions to authenticated accounts. | Must |
| FR-04 | Users shall be able to create issues with title, description, and priority. | Must |
| FR-05 | Issue creators and admins shall be able to edit issue details, subject to authorization rules. | Must |
| FR-06 | Issue creators and admins shall be able to delete issues. | Must |
| FR-07 | Admins shall be able to assign and unassign issues to registered users. | Must |
| FR-08 | Authorized users shall be able to update issue status. | Must |
| FR-09 | The system shall support Open, In Progress, and Closed statuses. | Must |
| FR-10 | Issue participants and admins shall be able to add comments. | Must |
| FR-11 | The dashboard shall show total, open, in-progress, and closed issue counts. | Must |
| FR-12 | Users shall only see issues they created or that are assigned to them. | Must |

## 6. Non-functional requirements

- Security: passwords must be hashed; protected routes must validate JWTs and permissions.
- Performance: common dashboard and issue-list requests should respond promptly under normal educational-project workloads.
- Usability: the interface should be responsive and provide clear validation/error feedback.
- Maintainability: frontend, backend, routes, controllers, models, and configuration should be separated.
- Availability: hosted services should be monitored and restarted according to provider capabilities.
- Data integrity: required fields and allowed status/priority values must be validated.

## 7. Proposed system architecture

```text
User / Admin browser
        |
        v
React + Vite frontend
        |
        | REST API (JSON, JWT)
        v
Express / Node.js backend
        |
        v
Mongoose data models
        |
        v
MongoDB database
```

## 8. Data requirements

### User
- Name
- Email (unique)
- Hashed password
- Role (`user` or `admin`)
- Created and updated timestamps

### Issue
- Title
- Description
- Status (`Open`, `In Progress`, `Closed`)
- Priority (`Low`, `Medium`, `High`)
- Creator reference
- Assignee reference (optional)
- Comments (author, message, timestamps)
- Created and updated timestamps

## 9. Business rules and permissions

- New public registrations always receive the `user` role.
- Admin accounts are provisioned using protected backend environment configuration.
- Admins can view all issues and assign/unassign users.
- Regular users can view issues they created or are assigned.
- A creator can edit issue title, description, and priority; an assignee can update status. Admins can update all issue fields.
- Only the creator or admin can delete an issue.
- Only an issue creator, assignee, or admin can comment.
- The backend is the source of truth for authorization; frontend controls are not security boundaries.

## 10. API requirements

The application exposes REST endpoints under `/api`:

- `/api/auth`: register, login, current-user details.
- `/api/issues`: list, create, update, delete, assign, comments, and user lookup for admins.
- `/api/dashboard`: status summary counts.
- `/api/health`: service health check.

Detailed methods, request bodies, and access rules are documented in `README.md`.

## 11. Deployment

### Hosting locations

- Frontend: Vercel.
- Backend: Render Web Service.
- Database: MongoDB Atlas.
- Source control: GitHub.

The production URLs must be entered in `README.md` after deployment. The project is not considered deployed until the real frontend and API URLs have been verified.

### Deployment approach

The application is deployed as three services. The React frontend is built into static assets and hosted on Vercel. The Express API runs as a Node.js web service on Render. MongoDB Atlas provides the managed database. The frontend communicates with the API using HTTPS REST requests and JWT bearer tokens.

### Required services and configuration

- GitHub repository containing `frontend` and `backend`.
- MongoDB Atlas cluster and database user.
- Render Web Service with root directory `backend`.
- Vercel project with root directory `frontend`.
- Backend variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, optional initial admin values, and `PORT` where required.
- Frontend variable: `VITE_API_URL`.

### Initial deployment steps

1. Push source code to GitHub.
2. Create and configure the MongoDB Atlas database.
3. Create the Render backend service; install dependencies with `npm install` and start with `npm start`.
4. Configure backend secrets and deploy.
5. Verify the backend `/api/health` endpoint.
6. Create the Vercel frontend project; build with `npm run build` and publish `dist`.
7. Configure `VITE_API_URL` to point to the Render API.
8. Set backend `CLIENT_URL` to the deployed Vercel origin.
9. Redeploy/restart services after environment changes.
10. Run end-to-end smoke tests for registration, login, issue creation, assignment, status updates, comments, and dashboard counts.
11. Record the verified live URLs in the README.

### Update / rollback approach

For updates, commit and push the change to the deployment branch, review build and runtime logs, and smoke-test the changed workflow. For a failed release, redeploy the previous known-good commit using the hosting provider's deployment history. Back up data before database migrations or destructive changes.

## 12. Acceptance criteria

- A user can register and sign in.
- An admin can sign in using the provisioned admin account.
- Users can create and view their permitted issues.
- Admins can view all issues and assign them to users.
- Authorized users can update issue status.
- Authorized users can add comments.
- Dashboard counts match the records visible to the current role.
- Unauthorized API requests are rejected.
- The README allows another developer to install and run the application.
- The deployed frontend and API are reachable and documented with verified URLs.

## 13. Risks and assumptions

- Hosting provider free-tier sleep, quotas, and availability may affect response times.
- MongoDB network access and credentials must be configured correctly.
- The initial admin password must be changed and protected.
- This is an initial portfolio/educational release; production use requires additional security hardening, automated tests, monitoring, backups, and rate limiting.

## 14. Future enhancements

- Email and push notifications.
- File attachments.
- Issue labels, categories, and due dates.
- Search, pagination, and advanced filters.
- Audit history and activity feed.
- Automated tests and CI/CD checks.
- SLA tracking and reports.
