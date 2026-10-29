import { Link } from 'react-router-dom'
import Seats from '../components/Seats'
import { useEffect, useState } from 'react'
import { counts } from '../store'

export default function Home() {
  const [c, setC] = useState(null)
  useEffect(() => { counts().then(setC).catch(() => {}) }, [])

  const C = {
    names: 'Omolara & Adefemi',
    events: { traditional: { title: 'Traditional Wedding' } }
  }

  return (
    <section className="hero">
      <video src="/hero.mp4" poster="/her.jpg" autoPlay muted loop playsInline />
      <div className="veil" />
      <div className="hero-in">
        <p className="eyebrow">Together with their families</p>
        <h1>{C.names}</h1>
        <p className="dates">29 March 2027</p>
        
        <Seats c={c} events={C.events} />
        
        <Link to="/details" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Book your seat
        </Link>
      </div>
    </section>
  )
}