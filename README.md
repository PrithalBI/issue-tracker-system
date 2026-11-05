# Issue Tracker System

A full-stack web application designed to help teams manage, assign, track, and resolve issues efficiently. The system provides separate access for administrators and normal users, along with issue management, status tracking, comments, and a dashboard.

## 🚀 Features

- **User Registration & Login:** Users can create accounts and securely log in.
- **Admin Login:** Administrators can access administrative features.
- **Issue Management:** Create, view, edit, and delete issues.
- **Issue Assignment:** Admins can assign issues to registered users.
- **Status Tracking:** Track issues using three statuses:
  - Open
  - In Progress
  - Closed
- **Comments:** Add comments to issues for communication and updates.
- **Dashboard:** View issue statistics and counts.
- **Authentication & Authorization:** JWT-based authentication and role-based access control.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcryptjs

## 📁 Project Structure

```text
issue-tracker-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
│
├── BRD.md
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas)
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

```bash
cd issue-tracker-system
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

Add the following configuration:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/issue_tracker
JWT_SECRET=your_secure_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

Replace the example values with your own secure configuration.

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the application in your browser using the URL displayed by Vite, usually:

```text
http://localhost:5173
```

## 👤 User Roles

### Admin
- Log in as an administrator.
- View and manage issues.
- Assign issues to users.
- Track issue status.
- Monitor dashboard statistics.

### Normal User
- Register and log in.
- Create issues.
- View available issues.
- Update permitted issue details and status.
- Add comments.
- Track issue progress.

*Available actions depend on the permissions configured in the application.*

## 📊 Issue Status

| Status | Description |
|---|---|
| Open | Newly created issue |
| In Progress | Issue is being worked on |
| Closed | Issue has been resolved |

## 🔐 Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected API routes.
- Role-based access control.
- Environment variables for sensitive configuration.

## 🎯 Project Objective

The main objective of this project is to develop a centralized issue management platform that simplifies issue reporting, assignment, monitoring, and resolution through a user-friendly interface.

## 🔮 Future Enhancements

- Email notifications.
- File attachments for issues.
- Advanced search and filtering.
- Issue priority management.
- Real-time notifications.
- Detailed reports and analytics.

## 👨‍💻 Developer

**Prithal B. I**

Computer Science Graduate / Fresher

Full Stack Development Project

## 📄 License

This project is developed for learning and demonstration purposes.