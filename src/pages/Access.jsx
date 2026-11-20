import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { verifyEventAccess } from '../store'

export default function Access() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await verifyEventAccess(name, password)
      navigate('/rsvp', { replace: true })
    } catch (x) {
      setError(x.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sec dark access-page" style={{ minHeight: '100vh', paddingTop: '160px' }}>
      <Reveal><h2>Invitation Only</h2></Reveal>
      <Reveal delay={100}>
        <p className="lead">Enter your name and the event password provided by the celebrant to continue.</p>
        <form className="card form" onSubmit={submit}>
          <label>
            Full name
            <input
              required
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <label>
            Event password
            <input
              required
              type="text" // <--- Changed from "password" to "text" so it is visible
              autoComplete="off" // Changed so browsers don't try to autofill saved passwords
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? 'Checking invitation…' : 'Continue to RSVP'}
          </button>
        </form>
      </Reveal>
    </section>
  )
}