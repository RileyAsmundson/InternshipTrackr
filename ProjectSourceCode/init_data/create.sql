/* 
   Table of all the users and their passwords
*/
CREATE TABLE if NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15)
);

/* 
   Table of all the internships
*/

CREATE TABLE if NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    openings INT NOT NULL
);

/* 
   Table of all the interviews
*/

CREATE TABLE if NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    internship_id INT REFERENCES internships(id),
    user_id VARCHAR(50) REFERENCES users(username),
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL
);

/* 
   Table of all the applications
*/
CREATE TABLE if NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    internship_id INT REFERENCES internships(id),
    user_id VARCHAR(50) REFERENCES users(username),
    application_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL
);

/* 
   Table of all the tags for internships for categorization
*/
CREATE TABLE if NOT EXISTS internship_tags (
    tag_name VARCHAR(50) NOT NULL,
    tag_id SERIAL PRIMARY KEY
);

CREATE TABLE if NOT EXISTS internship_to_tag (
    internship_id INT REFERENCES internships(id),
    tag_id INT REFERENCES internship_tags(tag_id)
);

/*
   Table of application deadlines for users
*/
CREATE TABLE IF NOT EXISTS deadlines (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(username),
    internship_id INT REFERENCES internships(id),
    title VARCHAR(200) NOT NULL,
    deadline_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE
);