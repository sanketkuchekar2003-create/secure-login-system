# Secure Login System with Password Strength Checker

This project is a full-stack cyber security mini-project built with:

- HTML, CSS, JavaScript
- Node.js and Express
- MongoDB and Mongoose
- bcrypt for password hashing

## Folder structure

```text
gym/
|-- config/
|   `-- db.js
|-- controllers/
|   `-- authController.js
|-- models/
|   `-- User.js
|-- public/
|   |-- login.html
|   |-- signup.html
|   |-- script.js
|   `-- styles.css
|-- routes/
|   `-- authRoutes.js
|-- utils/
|   `-- validation.js
|-- .env.example
|-- .gitignore
|-- package.json
|-- README.md
`-- server.js
```

## Features

- Signup page and login page
- Password strength checker with weak, medium, and strong status
- Real-time password validation messages
- Secure password hashing using bcrypt
- MongoDB storage for user details
- Proper validation for name, email, and password
- Wrong password and login success messages
- Loading indicator and disabled buttons while processing
- Cleaner backend structure using routes + controller + utility functions

## Improvements made

- Modern card-based UI for login and signup pages
- Better spacing, colors, typography, and responsive layout
- Real-time validation for all password rules
- Clear error messages for invalid email, weak password, user exists, and wrong password
- Beginner-friendly code with separated backend logic
- Better request handling with proper HTTP status codes and server error responses

## How to run locally

1. Install Node.js and MongoDB on your system.
2. Open the project folder in a terminal.
3. Run:

```bash
npm install
```

4. Create a `.env` file in the project root.
5. Copy the values from `.env.example` into `.env`.
6. Make sure MongoDB is running locally.
7. Start the project:

```bash
npm run dev
```

Or run:

```bash
npm start
```

8. Open your browser and go to:

```text
http://localhost:3000
```

## API endpoints

### Signup

- `POST /api/auth/signup`

Example request body:

```json
{
  "name": "Aman Sharma",
  "email": "aman@example.com",
  "password": "Secure@123"
}
```

### Login

- `POST /api/auth/login`

Example request body:

```json
{
  "email": "aman@example.com",
  "password": "Secure@123"
}
```

## Security notes

- Passwords are hashed with bcrypt before storage.
- Plain text passwords are never saved to MongoDB.
- Email format is validated on the server.
- Weak passwords are rejected during signup.
- Password rules require:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
