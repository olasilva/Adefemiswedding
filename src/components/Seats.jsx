import { CAP } from '../store'

export default function Seats({ c, events }) {
  return (
    <div className="seats">
      {Object.entries(events).map(([k, e]) => {
        const left = c ? Math.max(0, CAP - c[k]) : '–'
        const pct = c ? Math.min(100, (c[k] / CAP) * 100) : 0
        return (
          <div key={k}>
            <small>{e.title}</small>
            <strong>{left}</strong>
            <small>seats left</small>
            <i><u style={{ width: `${pct}%` }} /></i>
          </div>
        )
      })}
    </div>
  )
}