import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// List instructors, optionally filtered by ?search= (name or id) and ?dept=
app.get('/api/instructors', async (req, res, next) => {
  try {
    const search = String(req.query.search ?? '').trim();
    const dept = String(req.query.dept ?? '').trim();
    const { rows } = await pool.query(
      `SELECT id::text AS id, name, dept_name, salary::float8 AS salary
         FROM staff
        WHERE ($1::text = '' OR name ILIKE '%' || $1::text || '%' OR id::text ILIKE '%' || $1::text || '%')
          AND ($2::text = '' OR dept_name = $2::text)
        ORDER BY name`,
      [search, dept]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// Distinct departments for the filter chips and the form suggestions
app.get('/api/departments', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT dept_name FROM instructor ORDER BY dept_name');
    res.json(rows.map((r) => r.dept_name));
  } catch (e) { next(e); }
});

// Add an instructor. If no id is given, the next numeric id is used.
app.post('/api/instructors', async (req, res, next) => {
  try {
    let { id, name, dept_name, salary } = req.body;
    name = String(name ?? '').trim();
    dept_name = String(dept_name ?? '').trim();
    id = String(id ?? '').trim();
    const pay = Number(salary);
    if (!name || !dept_name || salary === '' || salary == null || Number.isNaN(pay) || pay < 0) {
      return res.status(400).json({ error: 'Name, department and a valid salary are required.' });
    }
    if (!id) {
      const { rows } = await pool.query(
        `SELECT COALESCE(MAX(id::text::int), 0) + 1 AS next FROM instructor WHERE id::text ~ '^[0-9]+$'`
      );
      id = String(rows[0].next);
    }
    const { rows } = await pool.query(
      `INSERT INTO instructor (id, name, dept_name, salary) VALUES ($1, $2, $3, $4)
       RETURNING id::text AS id, name, dept_name, salary::float8 AS salary`,
      [id, name, dept_name, pay]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That ID is already in use.' });
    next(e);
  }
});

app.delete('/api/instructors/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM instructor WHERE id::text = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Staff member not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Database error: ' + err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
