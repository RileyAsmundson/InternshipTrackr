# InternshipTrackr

Project repository for CSCI 3308

## Team Members

- Alexander Jezierski
- Eder Santillan
- Riley Asmundson
- Vishnu Renganathan
-  Emma Gebbie
---

## Project Description

Briefly describe the purpose of the application.

Include:
- What the application does
- Who the intended users are
- What problem the application is trying to solve

---

## Application Idea

Describe the original idea for the project.

### Problem

Briefly explain the problem your team identified.

### Proposed Solution

Briefly explain how your application addresses the problem.

---

## User-Centered Design Process

### Step 1: Application Idea

Describe the initial application idea.

### Step 2: Initial Design

Describe your team's first version of the solution.

### Step 3: User Interviews

Briefly describe:
- Who was interviewed
- What questions were asked
- Important feedback received

### Step 4: Evaluation of Initial Design

Explain what your team learned from the interviews.

### Step 5: Redesigned Solution

Describe the changes made based on user feedback.

### Step 6: Final User Feedback

Summarize the feedback received after presenting the redesigned application.

---

## Features

### Required Features

- [ ] Login page
- [ ] Registration page
- [ ] Home page
- [ ] Server-to-database communication
- [ ] User information stored in database
- [ ] Password hashing
- [ ] Session management
- [ ] User logout
- [ ] Docker containerization

### Additional Features

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
- [ ] User profile page
- [ ] Admin functionality
- [ ] External API integration
- [ ] User activity/history storage

---

## Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- Handlebars

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### Development / Deployment

- Docker
- Docker Compose
- Git
- GitHub

### Additional Libraries / APIs

- Add libraries here
- Add external APIs here

---

## Project Structure

```text
<ProjectRepository>/
├── TeamMeetingLogs/
├── MilestoneSubmissions/
├── ProjectSourceCode/
│   ├── docker-compose.yaml
│   ├── .gitignore
│   ├── package.json
│   ├── src/
│   │   ├── views/
│   │   │   ├── pages/
│   │   │   │   ├── home.hbs
│   │   │   │   ├── login.hbs
│   │   │   │   └── register.hbs
│   │   │   ├── partials/
│   │   │   │   ├── header.hbs
│   │   │   │   └── footer.hbs
│   │   │   └── layouts/
│   │   │       └── main.hbs
│   │   ├── resources/
│   │   │   ├── css/
│   │   │   │   └── style.css
│   │   │   ├── js/
│   │   │   │   └── script.js
│   │   │   └── img/
│   │   ├── init_data/
│   │   │   ├── create.sql
│   │   │   └── insert.sql
│   │   └── index.js
│   └── test/
│       └── server.spec.js
└── README.md
```

---

## Database Design

Briefly describe the database structure.

### Tables

- `users`
- Table 2
- Table 3
- Table 4

### Relationships

Describe the relationships between database tables.

### ER Diagram

Add the ER diagram here when available.

---

## Application Pages

### Home Page

Brief description.

### Login Page

Brief description.

### Registration Page

Brief description.

### Page / Feature 4

Brief description.

### Page / Feature 5

Brief description.

---

## API / Server Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Home page |
| GET | `/login` | Display login page |
| POST | `/login` | Authenticate user |
| GET | `/register` | Display registration page |
| POST | `/register` | Register new user |
| GET | `/logout` | Log user out |
| GET | `/example` | Example route |

Add or remove routes as the application develops.

---

## Authentication and Security

### Password Hashing

Describe how passwords are hashed before being stored.

### Sessions

Describe how user sessions are created and maintained.

### Protected Routes

List pages or endpoints that require the user to be logged in.

---

## External APIs

### API Name

Purpose:

Endpoint(s) used:

Data retrieved:

How the data is used in the application:

---

## Installation

### Prerequisites

Install:

- Git
- Docker
- Docker Desktop
- Node.js, if required for local development

### Clone the Repository

```bash
git clone <repository-url>
```

```bash
cd <repository-name>
```

### Environment Variables

Create a `.env` file if required.

Example:

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
SESSION_SECRET=
```

Do not commit passwords, API keys, or other secrets to GitHub.

---

## Running the Application

Start Docker Desktop.

Then run:

```bash
docker compose up
```

Or:

```bash
docker compose up -d
```

Application URL:

```text
http://localhost:3000
```

Stop the application with:

```bash
docker compose down
```

---

## Testing

Describe how the project is tested.

Example:

```bash
npm test
```

### Tests

- Authentication tests
- Route tests
- Database tests
- API tests

---

## Milestones

### Milestone 1

- Task
- Task
- Task

### Milestone 2

- Task
- Task
- Task

### Milestone 3

- Task
- Task
- Task

---

## Team Responsibilities

| Team Member | Responsibilities |
|---|---|
| Member 1 | |
| Member 2 | |
| Member 3 | |
| Member 4 | |

---

## Git / GitHub Workflow

### Branches

Example:

```text
main
development
feature/<feature-name>
```

### Workflow

1. Pull the latest changes.
2. Create or switch to your branch.
3. Make changes.
4. Commit changes.
5. Push your branch.
6. Create a pull request.
7. Review and merge.

Example:

```bash
git pull
git checkout -b feature/example
git add .
git commit -m "Add example feature"
git push origin feature/example
```

---

## Known Issues

- Issue 1
- Issue 2
- Issue 3

---

## Future Improvements

- Improvement 1
- Improvement 2
- Improvement 3

---

## Screenshots

### Home Page

Add screenshot here.

### Login Page

Add screenshot here.

### Registration Page

Add screenshot here.

### Other Pages

Add screenshots here.

---

## Demo

Demo URL:

```text
<URL>
```

Demo video:

```text
<URL>
```

---

## References

- Course resources
- API documentation
- Libraries used
- Other references

---

## Contributors

- Alexander Jezierski
- Eder Santillan
- Riley Asmundson
- Vishnu Renganathan
- Emma Gebbie
