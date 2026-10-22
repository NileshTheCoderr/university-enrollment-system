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
        `SELECT COALESCE(MAX(id::text::int), 0) + 1 AS next FROM staff WHERE id::text ~ '^[0-9]+$'`
      );
      id = String(rows[0].next);
    }
    const { rows } = await pool.query(
      `INSERT INTO staff (id, name, dept_name, salary) VALUES ($1, $2, $3, $4)
       RETURNING id::text AS id, name, dept_name, salary::float8 AS salary`,
      [id, name, dept_name, pay]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That ID is already in use.' });
    next(e);
  }
});

