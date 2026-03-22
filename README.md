# User Management System

A full-stack web application for managing users with role-based access control. Admins and leads can add, edit, delete, and reset passwords for users. Each user has a profile with image upload support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Class Components) |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| File Uploads | Multer |
| Hosting | Vercel (Frontend), Railway (Backend + DB) |

---

## Core Features

- JWT-based login and session management
- Role-based access — Admin, Lead, Support, User
- Add, edit, delete users with profile image upload
- Admin-only password reset with temporary password generation
- Change password with current password verification
- Paginated and searchable user dashboard
- Responsive UI with teal/dark theme

---

## How It Works

1. User logs in with username, email, or phone — JWT token is issued and stored in session
2. Dashboard fetches paginated users from the backend API based on the logged-in user's role
3. Admins and leads can create users with a generated secure password, edit details, upload images, and reset passwords
4. All passwords are hashed using bcrypt before storing — change password verifies the current password before updating
5. Frontend is deployed on Vercel, backend and MySQL database are hosted on Railway

---

## Project Structure

```
User-Management-System/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # Login, Signup, Dashboard, AddUser, EditUser, Profile, ChangePassword
│       ├── components/      # Header, Footer, DataTable, BrandLogo
│       └── utils/           # helpers.js, styles.js
└── server/                  # Node.js backend
    ├── routes/              # auth.js, users.js
    ├── middleware/          # verifyToken.js
    └── config/              # db.js
```

---

## Developed by

**SN Pavani** — Powered by React / Node.js
