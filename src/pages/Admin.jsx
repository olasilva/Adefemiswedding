import { useEffect, useState } from 'react'
import { listRes, removeRes, adminLogin, adminLogout, isAdmin, demo, CAP } from '../store'
import Reveal from '../components/Reveal'

export default function Admin() {
  const [ok, setOk] = useState(false)
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [p, setP] = useState('')
  
  // State for the Access Code copy feature
  const [copied, setCopied] = useState(false)
  const inviteCode = "omoaade27"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

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
    try { 
      await adminLogin(p) 
      setOk(true); 
      setErr('') 
    } catch (x) { 
      setErr(x.message) 
    }
  }

  // --- LOGIN SCREEN ---
  if (!ok) return (
    <section className="adm" style={{ display: 'grid', placeItems: 'center', paddingTop: '100px' }}>
      <Reveal>
        <form className="login-card" onSubmit={login}>
          <h3>Couple Login</h3>
          <label>
            Enter Password
            <input 
              type="password" 
              value={p} 
              onChange={e => setP(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </label>
          {err && <p className="err">{err}</p>}
          <button className="btn">Sign in</button>
        </form>
      </Reveal>
    </section>
  )

  // --- DASHBOARD SCREEN ---
  const tot = (k) => rows.filter(r => r[k]).reduce((a, r) => a + r.seats, 0)
  const list = rows.filter(r => (r.name + r.phone + r.code).toLowerCase().includes(q.toLowerCase()))

  // Group guests 5 per table based on their total seats
  const getTableAssignments = () => {
    let table = 1;
    let seatsAtCurrentTable = 0;
    const assignments = {};

    rows.forEach((r) => {
      // If adding this party's seats exceeds 5 (and the table isn't empty), move to the next table
      if (seatsAtCurrentTable + r.seats > 5 && seatsAtCurrentTable > 0) {
        table++;
        seatsAtCurrentTable = 0;
      }
      
      assignments[r.id] = table;
      seatsAtCurrentTable += r.seats;
    });

    return assignments;
  };

  const tableAssignments = getTableAssignments();

  const csv = () => {
    const h = ['Code', 'Name', 'Phone', 'Email', 'Seats', 'Table No.', 'Traditional', 'Note', 'Booked']
    const body = rows.map((r) =>
      [r.code, r.name, r.phone, r.email, r.seats, tableAssignments[r.id], r.traditional ? 'Yes' : '', r.note, r.created_at]
        .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([[h.join(','), ...body].join('\n')], { type: 'text/csv' }))
    a.download = 'guest-list.csv'
    a.click()
  }

  // Helper to download a simple text ticket for the guest
  const downloadTicket = (r) => {
    const tableNo = tableAssignments[r.id];
    const ticketText = `
=========================================
      WEDDING INVITATION TICKET
=========================================

Guest Name: ${r.name}
Phone: ${r.phone}
Seats Booked: ${r.seats}

⭐ TABLE NUMBER: ${tableNo} ⭐

Reservation Code: ${r.code}

Please present this code at the entrance.
We look forward to celebrating with you!
=========================================
    `.trim();

    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ticketText], { type: 'text/plain' }))
    a.download = `Ticket-${r.name.replace(/\s+/g, '-')}.txt`
    a.click()
  }

  return (
    <section className="adm">
      <Reveal><h2>Guest Dashboard</h2></Reveal>
      
      {demo && <Reveal delay={80}><p className="lead" style={{ textAlign: 'center', marginBottom: '32px' }}>Demo mode — data lives in this browser only.</p></Reveal>}

      {/* ACCESS CODE SECTION */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto 40px', 
        background: 'var(--white)', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--bg-dark)' }}>Guest Access Code</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Send this code to your guests so they can access the RSVP page.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', maxWidth: '350px', margin: '0 auto' }}>
          <input 
            type="text" 
            readOnly 
            value={inviteCode} 
            style={{ 
              textAlign: 'center', 
              fontFamily: 'monospace', 
              fontSize: '1.1rem', 
              letterSpacing: '2px',
              background: '#FAFAFA',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <button 
            onClick={handleCopy}
            className="btn"
            style={{ padding: '0 24px', borderRadius: '8px', whiteSpace: 'nowrap' }}
          >
            {copied ? 'Copied! ✓' : 'Copy'}
          </button>
        </div>
        {copied && (
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '12px', fontWeight: 600 }}>
            Code copied to clipboard!
          </p>
        )}
      </div>
      
      <div className="stats">
        <Reveal delay={0}><div><b>{rows.length}</b>Bookings</div></Reveal>
        <Reveal delay={100}><div><b>{tot('traditional')}/{CAP}</b>Traditional seats</div></Reveal>
        <Reveal delay={200}><div><b>{Math.max(0, CAP - tot('traditional'))}</b>Seats left</div></Reveal>
      </div>

      <div className="tools">
        <input placeholder="Search name, phone or code" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn sm" onClick={csv}>Export CSV</button>
        <button className="btn sm" onClick={load}>Refresh</button>
        <button className="btn sm" style={{ background: '#E74C3C' }} onClick={() => { adminLogout(); setOk(false) }}>Sign out</button>
      </div>

      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Seats</th>
              <th>Table</th>
              <th>Events</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.seats}</td>
                <td>
                  <span style={{ 
                    background: 'var(--accent)', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    Table {tableAssignments[r.id]}
                  </span>
                </td>
                <td>{r.traditional && 'Traditional'}</td>
                <td>{r.note}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn sm" 
                    onClick={() => downloadTicket(r)}
                    style={{ background: 'var(--bg-dark)', color: 'white', padding: '6px 12px', fontSize: '0.7rem' }}
                  >
                    Download Ticket
                  </button>
                  <button className="x" onClick={async () => {
                    if (confirm(`Cancel ${r.name}'s booking?`)) { await removeRes(r.id); load() }
                  }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="lead" style={{ padding: '40px' }}>No bookings yet.</p>}
      </div>
    </section>
  )
}