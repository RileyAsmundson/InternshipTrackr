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

InternshipTrackr is an internship discovery and application management platform designed for college students who are actively searching for internships and preparing to enter the workforce.

Students often use several different websites, spreadsheets, calendars, and personal notes to manage their internship search. This can make it difficult to keep track of applications, deadlines, interviews, and offers.

Our project aims to solve this problem by providing one centralized platform where students can discover internship opportunities and manage every stage of the internship application process.

The application will provide users with a personalized dashboard where they can quickly view their application statuses, upcoming deadlines, interviews, and offers.

---

## Application Idea

For college students who need a convenient way to track internships and manage their applications, InternshipTrackr is an internship tracking application that helps users stay organized by tracking application progress, deadlines, interviews, and offers.

Unlike platforms such as LinkedIn or Handshake, InternshipTrackr combines internship discovery with comprehensive application management tools, allowing students to navigate the entire internship search process in one place.

### Problem

College students frequently apply to many internship opportunities across several different platforms.

Important information may be spread across:
- LinkedIn
- Handshake
- Company career websites
- Email
- Personal calendars
- Spreadsheets
- Notes

Managing all of these resources separately can make it difficult for students to remember deadlines, interview dates, application statuses, and other important information.

### Proposed Solution

InternshipTrackr will provide students with a centralized platform for managing their internship search.

Users will be able to:

- Create an account
- Log in securely
- Discover internship opportunities
- Save internship opportunities
- Track submitted applications
- Update application statuses
- Track deadlines
- Record interview dates
- Track internship offers
- View application progress from a personalized dashboard

---

## User-Centered Design Process(Documentation in Progress)

### Step 1: Application Idea

initial application idea description. 

### Step 2: Initial Design

Team's first version of the solution.

### Step 3: User Interviews

Brief description of the following:
- Who was interviewed
- What questions were asked
- Important feedback received

### Step 4: Evaluation of Initial Design

What we learned as a team from the interviews. 

### Step 5: Redesigned Solution

Changes made based on user feedback.

### Step 6: Final User Feedback

Feedback received after presenting the redesigned application.

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

Database structure description.

### Tables

- users

| Column       | Type         | Constraints |
|--------------|--------------|-------------|
| username     | VARCHAR(50)  | PRIMARY KEY |
| password     | VARCHAR(60)  | NOT NULL    |
| email        | VARCHAR(100) | NOT NULL    |
| first_name   | VARCHAR(100) | NOT NULL    |
| last_name    | VARCHAR(100) | NOT NULL    |
| phone_number | VARCHAR(15)  |             |

- internships

| Column      | Type         | Constraints |
|-------------|--------------|-------------|
| id          | SERIAL       | PRIMARY KEY |
| title       | VARCHAR(100) | NOT NULL    |
| description | TEXT         | NOT NULL    |
| company     | VARCHAR(100) | NOT NULL    |
| location    | VARCHAR(100) | NOT NULL    |
| start_date  | DATE         | NOT NULL    |
| end_date    | DATE         | NOT NULL    |
| openings    | INT          | NOT NULL    |

- interviews

| Column         | Type        | Constraints                    |
|----------------|-------------|--------------------------------|
| id             | SERIAL      | PRIMARY KEY                    |
| internship_id  | INT         | FOREIGN KEY → internships(id)  |
| user_id        | VARCHAR(50) | FOREIGN KEY → users(username)  |
| interview_date | DATE        | NOT NULL                       |
| interview_time | TIME        | NOT NULL                       |
| status         | VARCHAR(20) | NOT NULL                       |

- applications

| Column           | Type        | Constraints                    |
|------------------|-------------|--------------------------------|
| id               | SERIAL      | PRIMARY KEY                    |
| internship_id    | INT         | FOREIGN KEY → internships(id)  |
| user_id          | VARCHAR(50) | FOREIGN KEY → users(username)  |
| application_date | DATE        | NOT NULL                       |
| status           | VARCHAR(20) | NOT NULL                       |

- internship_tags

| Column   | Type        | Constraints |
|----------|-------------|-------------|
| tag_id   | SERIAL      | PRIMARY KEY |
| tag_name | VARCHAR(50) | NOT NULL    |

- internship_to_tag

| Column        | Type | Constraints                            |
|---------------|------|----------------------------------------|
| internship_id | INT  | FOREIGN KEY → internships(id)          |
| tag_id        | INT  | FOREIGN KEY → internship_tags(tag_id)  |

### Relationships

| Table A     | Relationship | Table B          | Via                                |
|-------------|--------------|------------------|------------------------------------|
| users       | one-to-many  | applications     | applications.user_id               |
| internships | one-to-many  | applications     | applications.internship_id         |
| users       | one-to-many  | interviews       | interviews.user_id                 |
| internships | one-to-many  | interviews       | interviews.internship_id           |
| internships | many-to-many | internship_tags  | internship_to_tag (join table)     |

### ER Diagram

Add the ER diagram here when available.

---

## Application Pages(Documentation in Progress)

### Home Page

General introduction to InternshipTrackr and access to important application features.

### Login Page

Allows existing users to securely log into their account.

### Registration Page

Allows new users to create an InternshipTrackr account.

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

### Password Hashing(Documentation in Progress)

how passwords are hashed before being stored.

### Sessions

how user sessions are created and maintained.

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

## Known Issues(Documentation in Progress)

- Issue 1
- Issue 2
- Issue 3

---

## Future Improvements(Documentation in Progress)

- Improvement 1
- Improvement 2
- Improvement 3

---

## Screenshots(Documentation in Progress)

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
