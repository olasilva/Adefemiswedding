import { useState } from 'react'
import { reserve, counts } from '../store'
import Reveal from '../components/Reveal'
import { Link } from 'react-router-dom'

export default function RSVP() {
  const [f, setF] = useState({ name: '', phone: '', email: '', seats: 1, traditional: true, note: '' })
  const [err, setErr] = useState(''), [code, setCode] = useState(''), [busy, setBusy] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (!f.traditional) return setErr('Please confirm you will attend.')
    setBusy(true)
    try { setCode(await reserve(f)) } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  return (
    <section className="sec dark" style={{ minHeight: '100vh', paddingTop: '160px' }}>
      <Reveal><h2>Reserve Your Seat</h2></Reveal>
      {code ? (
        <Reveal delay={100}>
          <div className="card ok">
            <h3>You're on the list! 🎉</h3>
            <p>Your reservation code</p>
            <div className="code">{code}</div>
            <p>Please screenshot this code and present it at the entrance.</p>
            <Link to="/" className="btn" style={{ marginTop: '20px', textDecoration: 'none' }}>Back to Home</Link>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={100}>
          <form className="card form" onSubmit={submit}>
            <label>Full name<input required value={f.name} onChange={e => set('name', e.target.value)} /></label>
            <label>Phone / WhatsApp<input required type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} /></label>
            <label>Email (optional)<input type="email" value={f.email} onChange={e => set('email', e.target.value)} /></label>
            <label>Number of seats (including you)
              <div className="step">
                <button type="button" onClick={() => set('seats', Math.max(1, f.seats - 1))}>−</button>
                <b>{f.seats}</b>
                <button type="button" onClick={() => set('seats', Math.min(6, f.seats + 1))}>+</button>
              </div>
            </label>
            <label className="chk">
              <input type="checkbox" checked={f.traditional} onChange={x => set('traditional', x.target.checked)} />
              I will attend the Traditional Wedding
            </label>
            <label>Message to the couple (optional)<textarea rows="3" value={f.note} onChange={e => set('note', e.target.value)} /></label>
            {err && <p className="err">{err}</p>}
            <button className="btn" disabled={busy}>{busy ? 'Reserving…' : 'Confirm reservation'}</button>
          </form>
        </Reveal>
      )}
    </section>
  )
}