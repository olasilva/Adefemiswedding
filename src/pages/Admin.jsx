import { useEffect, useState } from 'react'
import { listRes, removeRes, adminLogin, adminLogout, isAdmin, demo, CAP } from '../store'
import Reveal from '../components/Reveal'

export default function Admin() {
  const [ok, setOk] = useState(false)
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [u, setU] = useState('')
  const [p, setP] = useState('')

  const load = () => listRes().then(setRows).catch(e => setErr(e.message))
  useEffect(() => { isAdmin().then(setOk) }, [])
  useEffect(() => {
    if (!ok) return
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [ok])

  const login = async (e) => {
    e.preventDefault()
    try { await adminLogin(u, p); setOk(true); setErr('') } catch (x) { setErr(x.message) }
  }

  if (!ok) return (
    <section className="sec dark adm">
      <Reveal>
        <form className="card form" onSubmit={login}>
          <h3>Couple Login</h3>
          {!demo && <label>Email<input type="email" value={u} onChange={e => setU(e.target.value)} /></label>}
          <label>{demo ? 'Passcode' : 'Password'}<input type="password" value={p} onChange={e => setP(e.target.value)} /></label>
          {err && <p className="err">{err}</p>}
          <button className="btn">Sign in</button>
        </form>
      </Reveal>
      <footer><a href="#/">← Back to invitation</a></footer>
    </section>
  )

  const tot = (k) => rows.filter(r => r[k]).reduce((a, r) => a + r.seats, 0)
  const list = rows.filter(r => (r.name + r.phone + r.code).toLowerCase().includes(q.toLowerCase()))

  const csv = () => {
    const h = ['Code', 'Name', 'Phone', 'Email', 'Seats', 'Traditional', 'Note', 'Booked']
    const body = rows.map(r =>
      [r.code, r.name, r.phone, r.email, r.seats, r.traditional ? 'Yes' : '', r.note, r.created_at]
        .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([[h.join(','), ...body].join('\n')], { type: 'text/csv' }))
    a.download = 'guest-list.csv'
    a.click()
  }

  return (
    <section className="sec adm">
      <Reveal><h2>Guest Dashboard</h2></Reveal>
      {demo && <Reveal delay={80}><p className="lead">Demo mode — data lives in this browser only.</p></Reveal>}
      <div className="stats">
        <Reveal delay={0}><div><b>{rows.length}</b>Bookings</div></Reveal>
        <Reveal delay={100}><div><b>{tot('traditional')}/{CAP}</b>Traditional seats</div></Reveal>
        <Reveal delay={200}><div><b>{Math.max(0, CAP - tot('traditional'))}</b>Seats left</div></Reveal>
      </div>
      <div className="tools">
        <input placeholder="Search name, phone or code" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn sm" onClick={csv}>Export CSV</button>
        <button className="btn sm" onClick={load}>Refresh</button>
        <button className="btn sm" onClick={() => { adminLogout(); setOk(false) }}>Sign out</button>
      </div>
      <div className="tbl">
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Phone</th><th>Seats</th><th>Events</th><th>Note</th><th /></tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td>{r.code}</td><td>{r.name}</td><td>{r.phone}</td><td>{r.seats}</td>
                <td>{r.traditional && 'Traditional'}</td><td>{r.note}</td>
                <td>
                  <button className="x" onClick={async () => {
                    if (confirm(`Cancel ${r.name}'s booking?`)) { await removeRes(r.id); load() }
                  }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="lead">No bookings yet.</p>}
      </div>
      <footer><a href="#/">← Back to invitation</a></footer>
    </section>
  )
}