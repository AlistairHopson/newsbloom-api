# Newsbloom

View the project: https://newsbloom.herokuapp.com/api

## Overview

Newsbloom is an application project that serves news-related data in a similar manner to websites such as Reddit. It serves articles and user data to clients, and allows interaction through votes and comments.

## Initial Setup Instructions:

1. Fork this repository to your GitHub account

2. Clone your forked repository to your local machine

3. Install the project dependencies with npm install
   (Postgres, Express, Dotenv, Jest, Jest-Sorted, Supertest, & pg-format)

4. The database can be seeded by running the seed script in the package.json: it can be run with **npm run seed**

5. The **tests** folder contains tests for the application and its utilities: these can be run with npm test <file-name>

6. You should **create the relevant environment variables** (.env.test & .env.development) and ensure they are named appropriately (PGDATABASE=nc_news_test & PGDATABASE=nc_news).

## Recommended Node and Postgres Versions:

- Node: v18.1.0
- Postgres: 14.4
