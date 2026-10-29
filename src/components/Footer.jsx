import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname === '/admin'

  // Hide footer on the home page so the video is standalone
  if (isHome) return null

  return (
    <footer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '16px' }}>
        <Link to="/">Go Back Home</Link>
        {!isAdmin && <Link to="/admin">Couple Admin</Link>}
      </div>
      <p style={{ opacity: 0.7 }}>Omolara & Adefemi · 29 March 2027</p>
    </footer>
  )
}