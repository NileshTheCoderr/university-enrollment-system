import { useCallback, useEffect, useState } from 'react';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

async function api(path, opts) {
  // Use the Vercel environment variable, falling back to localhost for local testing
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
  
  const r = await fetch(`${baseUrl}/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Cannot reach the server. Is the backend running?');
  return data;
}

const hue = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const EMPTY = { id: '', name: '', dept_name: '', salary: '' };

export default function App() {
  const [rows, setRows] = useState([]);
  const [depts, setDepts] = useState([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDepts = () => api('/departments').then(setDepts).catch(() => {});
  const loadRows = useCallback(
    () =>
      api('/instructors?' + new URLSearchParams({ search, dept }))
        .then(setRows)
        .catch((e) => setMsg({ type: 'error', text: e.message }))
        .finally(() => setLoading(false)),
    [search, dept]
  );

  useEffect(() => { loadDepts(); }, []);
  useEffect(() => {
    const t = setTimeout(loadRows, 250);
    return () => clearTimeout(t);
  }, [loadRows]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const added = await api('/instructors', { method: 'POST', body: JSON.stringify(form) });
      setForm(EMPTY);
      setMsg({ type: 'ok', text: `Added ${added.name} (ID ${added.id}).` });
      loadRows();
      loadDepts();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const remove = async (r) => {
    if (!confirm(`Remove ${r.name} from the staff list?`)) return;
    try {
      await api('/instructors/' + encodeURIComponent(r.id), { method: 'DELETE' });
      setMsg({ type: 'ok', text: `Removed ${r.name}.` });
      loadRows();
      loadDepts();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const avg = rows.length ? rows.reduce((s, r) => s + r.salary, 0) / rows.length : 0;

  return (
    <div className="shell">
      <header className="top">
        <div>
          <h1>Enrollment Office</h1>
          <p>Manage instructors across every department.</p>
        </div>
        <dl className="stats">
          <div><dt>Showing</dt><dd>{rows.length}</dd></div>
          <div><dt>Departments</dt><dd>{depts.length}</dd></div>
          <div><dt>Average salary</dt><dd>{money(avg)}</dd></div>
        </dl>
      </header>

      {msg && (
        <div className={'banner ' + msg.type} role="status">
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <main className="split">
        <aside className="panel form-panel">
          <h2>Add staff member</h2>
          <form onSubmit={submit}>
            <label>Full name
              <input value={form.name} onChange={set('name')} placeholder="e.g. Ananya Rao" required />
            </label>
            <label>Department
              <input value={form.dept_name} onChange={set('dept_name')} list="dept-list" placeholder="e.g. Physics" required />
              <datalist id="dept-list">{depts.map((d) => <option key={d} value={d} />)}</datalist>
            </label>
            <label>Salary (₹)
              <input type="number" min="0" step="1" value={form.salary} onChange={set('salary')} placeholder="e.g. 75000" required />
            </label>
            <label>ID <span className="hint">leave blank to assign the next one</span>
              <input value={form.id} onChange={set('id')} maxLength={5} placeholder="Auto" />
            </label>
            <button className="primary" type="submit">Add staff member</button>
          </form>
        </aside>

        <section className="panel table-panel">
          <div className="toolbar">
            <input className="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID" aria-label="Search staff" />
            <div className="chips" role="group" aria-label="Filter by department">
              <button className={!dept ? 'chip on' : 'chip'} onClick={() => setDept('')}>All</button>
              {depts.map((d) => (
                <button key={d} className={dept === d ? 'chip on' : 'chip'} onClick={() => setDept(dept === d ? '' : d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className="scroll">
            <table>
              <thead>
                <tr><th>Staff member</th><th>ID</th><th>Department</th><th className="num">Salary</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="person">
                        <span className="avatar" style={{ background: `hsl(${hue(r.name)} 60% 92%)`, color: `hsl(${hue(r.name)} 50% 30%)` }}>{initials(r.name)}</span>
                        {r.name}
                      </div>
                    </td>
                    <td className="muted">{r.id}</td>
                    <td><span className="badge" style={{ background: `hsl(${hue(r.dept_name)} 60% 93%)`, color: `hsl(${hue(r.dept_name)} 55% 28%)` }}>{r.dept_name}</span></td>
                    <td className="num">{money(r.salary)}</td>
                    <td className="act"><button className="ghost" onClick={() => remove(r)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && rows.length === 0 && (
              <p className="empty">No staff match these filters. Clear the search or add a new staff member.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
