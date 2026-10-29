import { useEffect, useState } from 'react'

const C = {
  names: 'Omolara & Adefemi',
  date: '2027-03-29T10:00:00+01:00',
}

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.max(0, Math.floor((new Date(C.date) - now) / 1000))
  return [
    ['Days', Math.floor(s / 86400)],
    ['Hrs', Math.floor(s % 86400 / 3600)],
    ['Min', Math.floor(s % 3600 / 60)],
    ['Sec', s % 60],
  ]
}

export default function Header() {
  const cd = useCountdown()
  return (
    <header className="hdr">
      <a className="logo" href="#/">{C.names}</a>
      <div className="cd">
        {cd.map(([l, v]) => (
          <div key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
        ))}
      </div>
    </header>
  )
}