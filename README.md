# Node.js Mail Server with Nodemailer and MongoDB

This project sets up a backend mail server using Node.js, Express, Nodemailer, and MongoDB. It handles form submissions from a frontend, stores the data in a MongoDB database, and sends confirmation emails using modern HTML templates.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [Email Templates](#email-templates)
- [API Endpoints](#api-endpoints)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)

## Features

- **Form Submission Handling**: Processes data from various frontend forms (Contact, Application, Newsletter).
- **Email Sending**: Utilizes Nodemailer to send confirmation emails to users.
- **Modern Email Templates**: Emails are styled with a header and footer banner for a consistent look.
- **Database Storage**: Stores all form submissions in a MongoDB database for record-keeping.
- **Environment Variables**: Securely manages sensitive information (SMTP credentials, MongoDB URI) using `.env` file.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (LTS version recommended)
- **npm**: Comes with Node.js.
- **MongoDB**: A running MongoDB instance (local or cloud-based like MongoDB Atlas).

## Installation

1.  **Clone the repository (if applicable) or navigate to the project directory:**
    ```bash
    cd /path/to/your/project
    ```

2.  **Install the required Node.js packages:**
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root directory of your project and add the following environment variables. Replace the placeholder values with your actual credentials.

```dotenv
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MONGO_URI=your_mongodb_uri
PORT=3000 # Optional: specify a port for the server, defaults to 3000
```

-   **`SMTP_HOST`**: Your SMTP server host (e.g., `smtp.gmail.com`, `smtp.mailtrap.io`).
-   **`SMTP_PORT`**: Your SMTP server port (e.g., `587` for TLS, `465` for SSL). Set `secure` to `true` in `server.js` if using port 465.
-   **`SMTP_USER`**: Your SMTP username (usually your email address).
-   **`SMTP_PASS`**: Your SMTP password or application-specific password.
-   **`MONGO_URI`**: Your MongoDB connection string (e.g., `mongodb://localhost:27017/your_database_name` or a MongoDB Atlas URI).
-   **`ADMIN_EMAIL`**: The email address where all admin notifications for form submissions will be sent.

## Database Schema

The `models/Submission.js` file defines the Mongoose schema for storing form submissions. Each submission document will have the following structure:

```javascript
const submissionSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});
```

-   **`formType`**: A string indicating the type of form (e.g., "Contact Form", "Application Form", "Newsletter Subscription").
-   **`formData`**: An object containing all the key-value pairs submitted from the respective form.
-   **`submittedAt`**: The timestamp when the form was submitted.

## Email Templates

The server uses `templates/header.html` and `templates/footer.html` to construct the email layout.

-   **`templates/header.html`**: Contains the opening HTML tags, basic styling for the header, and a placeholder for a company logo and title.
-   **`templates/footer.html`**: Contains the closing HTML tags, basic styling for the footer, copyright information, and address.

You can customize these HTML files to match your branding and design requirements.

## API Endpoints

The `server.js` file exposes the following API endpoints for form submissions:

### 1. Contact Form

-   **URL**: `/submit-contact`
-   **Method**: `POST`
-   **Request Body (JSON)**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "subject": "Inquiry about services",
      "message": "I would like to know more about your programs."
    }
    ```
-   **Functionality**: Saves contact form data to MongoDB, sends a confirmation email to the provided email address, and sends an admin notification email to `ADMIN_EMAIL`.

### 2. Application Form

-   **URL**: `/submit-application`
-   **Method**: `POST`
-   **Request Body (JSON)**:
    ```json
    {
      "firstname": "Jane",
      "lastname": "Smith",
      "program": "Kindergarten",
      "parent_name": "Alice Smith",
      "number": "123-456-7890",
      "email": "alice.smith@example.com",
      "address": "123 Main St, Anytown",
      "dob": "2020-01-15",
      "gender": "Female",
      "agree": true
    }
    ```
-   **Functionality**: Saves application form data to MongoDB, sends a confirmation email to the parent's email address, and sends an admin notification email to `ADMIN_EMAIL`.

### 3. Newsletter Subscription Form

-   **URL**: `/subscribe-newsletter`
-   **Method**: `POST`
-   **Request Body (JSON)**:
    ```json
    {
      "newsletter_email": "subscriber@example.com"
    }
    ```
-   **Functionality**: Saves newsletter subscription email to MongoDB, sends a confirmation email to the subscriber, and sends an admin notification email to `ADMIN_EMAIL`.

## Running the Server

To start the server, open your terminal in the project's root directory and run:

```bash
node server.js
```

The server will start on the port specified in your `.env` file (defaulting to `3000`) and log a message to the console:

```
Server running on port 3000
MongoDB connected
```

## Project Structure

```
.
├── .env                  # Environment variables for configuration
├── forms.txt             # Documentation of form definitions
├── models/
│   └── Submission.js     # Mongoose schema for form submissions
├── templates/
│   ├── header.html       # HTML template for email header
│   └── footer.html       # HTML template for email footer
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Dependency tree lock file
└── server.js             # Main server application
└── README.md             # This documentation file
