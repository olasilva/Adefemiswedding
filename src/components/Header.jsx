import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const C = { names: 'Omolara & Adefemi', date: '2027-03-29T10:00:00+01:00' }

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { 
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t) 
  }, [])
  
  const s = Math.max(0, Math.floor((new Date(C.date) - now) / 1000))
  return [
    ['Days', Math.floor(s / 86400)], 
    ['Hrs', Math.floor(s % 86400 / 3600)], 
    ['Min', Math.floor(s % 3600 / 60)], 
    ['Sec', s % 60]
  ]
}

export default function Header() {
  const cd = useCountdown()
  const location = useLocation()
  
  // Hide navigation links on the Home (video) page so it remains a standalone cover
  const isHome = location.pathname === '/'

  return (
    <header className="hdr">
      <Link className="logo" to="/">{C.names}</Link>
      
      {/* Navigation Links - Only show if NOT on the home page */}
      {!isHome && (
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/details">Details</Link>
          <Link to="/rsvp" className="nav-rsvp">RSVP</Link>
        </nav>
      )}

      <div className="cd">
        {cd.map(([l, v]) => (
          <div key={l}>
            <b>{String(v).padStart(2, '0')}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </header>
  )
}