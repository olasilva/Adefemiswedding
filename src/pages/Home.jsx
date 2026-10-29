import { useEffect, useState } from 'react'
import { counts, reserve } from '../store'
import Seats from '../components/Seats'
import Reveal from '../components/Reveal'

const C = {
  names: 'Omolara & Adefemi',
  date: '2027-03-29T10:00:00+01:00',
  events: {
    traditional: {
      title: 'Traditional Wedding',
      when: 'Monday, 29 March 2027',
      venue: 'Venue to be announced',
    },
  },
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

function useSeats() {
  const [c, setC] = useState(null)
  const load = () => counts().then(setC).catch(() => {})
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [])
  return [c, load]
}

export default function Home() {
  const [c, reload] = useSeats()
  const [f, setF] = useState({ name: '', phone: '', email: '', seats: 1, traditional: true, note: '' })
  const [err, setErr] = useState(''), [code, setCode] = useState(''), [busy, setBusy] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (!f.traditional) return setErr('Please confirm you will attend.')
    setBusy(true)
    try { setCode(await reserve(f)); reload() } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  return (
    <>
      <section className="hero">
        <video src="/hero.mp4" poster="/her.jpg" autoPlay muted loop playsInline />
        <div className="veil" />
        <div className="hero-in">
          <p className="eyebrow">Together with their families</p>
          <h1>{C.names}</h1>
          <p className="dates">29 March 2027</p>
          <Seats c={c} events={C.events} />
          <button className="btn" onClick={() => go('reserve')}>Reserve your seat</button>
        </div>
      </section>

      <section className="sec ivory">
        <Reveal><h2>Join us as we say “I do”</h2></Reveal>
        <Reveal delay={100}><p className="lead">A day of love, laughter and celebration. We would be honoured to have you with us.</p></Reveal>
        <div className="photos">
          <Reveal delay={150}><figure><img src="/him.jpg" alt="The groom" /></figure></Reveal>
          <Reveal delay={300}><figure><img src="/her.jpg" alt="The bride" /></figure></Reveal>
        </div>
      </section>

      <section className="sec">
        <Reveal><h2>The Celebration</h2></Reveal>
        <div className="cards">
          {Object.values(C.events).map((e, i) => (
            <Reveal key={e.title} delay={i * 120}>
              <div className="card">
                <h3>{e.title}</h3>
                <p>{e.when}</p>
                <p>{e.venue}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={100}><h3 className="sub">Colours of the day</h3></Reveal>
        <div className="sw">
          {[['Emerald Green', '#0a5c43'], ['Gold', '#c9a24b'], ['White', '#ffffff']].map(([n, h], i) => (
            <Reveal key={n} delay={i * 100}>
              <div><i style={{ background: h }} />{n}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sec dark" id="reserve">
        <Reveal><h2>Reserve Your Seat</h2></Reveal>
        {code ? (
          <Reveal delay={100}>
            <div className="card ok">
              <h3>You're on the list! 🎉</h3>
              <p>Your reservation code</p>
              <div className="code">{code}</div>
              <p>Please screenshot this code and present it at the entrance.</p>
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
                I will attend the Traditional Wedding · {C.events.traditional.when}
              </label>
              <label>Message to the couple (optional)<textarea rows="3" value={f.note} onChange={e => set('note', e.target.value)} /></label>
              {err && <p className="err">{err}</p>}
              <button className="btn" disabled={busy}>{busy ? 'Reserving…' : 'Confirm reservation'}</button>
            </form>
          </Reveal>
        )}
      </section>

      <footer>{C.names} · 29 March 2027 · <a href="#/admin">Couple login</a></footer>
    </>
  )
}