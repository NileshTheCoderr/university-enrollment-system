# University Enrollment System

React (Vite) client + Node/Express API + local PostgreSQL database `University` (table `instructor`).

```
university-enrollment-system/
├── database/schema.sql      # creates + seeds the instructor table
├── server/                  # Express API (pg)
│   ├── .env                 # set your Postgres password here
│   └── src/{index.js, db.js}
└── client/                  # React + Vite dashboard
    └── src/{App.jsx, styles.css, main.jsx}
```

## 1. Database
```bash
psql -U postgres -c 'CREATE DATABASE "University";'
psql -U postgres -d University -f database/schema.sql
```
Already have the table? Skip the second command. If your database is named in lowercase, set `PGDATABASE=university` in `server/.env`.

## 2. Server (terminal 1)
```bash
cd server
# edit .env and set PGPASSWORD
npm install
npm run dev        # http://localhost:4000
```

## 3. Client (terminal 2)
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

## API
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/instructors?search=&dept=` | list / search / filter |
| GET | `/api/departments` | distinct departments |
| POST | `/api/instructors` | add `{id?, name, dept_name, salary}` |
| DELETE | `/api/instructors/:id` | remove |
