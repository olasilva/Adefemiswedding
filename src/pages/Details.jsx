import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'

export default function Details() {
  return (
    <>
      <section className="sec ivory" style={{ paddingTop: '160px' }}>
        <Reveal><h2>Join us as we say “I do”</h2></Reveal>
        <Reveal delay={100}>
          <p className="lead">
            A day of love, laughter and celebration. We would be honoured to have you with us.
          </p>
        </Reveal>
        
        {/* Photos side-by-side */}
        <div className="photos">
          <Reveal delay={150}>
            <figure>
              <img src="/him.jpg" alt="Adefemi" />
            </figure>
          </Reveal>
          <Reveal delay={300}>
            <figure>
              <img src="/her.jpg" alt="Omolara" />
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="sec" style={{ background: '#fff' }}>
        <Reveal><h2>The Celebration</h2></Reveal>
        
        <div className="cards">
          <Reveal delay={100}>
            <div className="card">
              <h3>Traditional Wedding</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '16px' }}>
                Monday, 29 March 2027
              </p>
              <p>Venue to be announced</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <h3 className="sub" style={{ marginTop: '80px', fontFamily: 'Playfair Display' }}>
            Colours of the day
          </h3>
        </Reveal>
        
        <div className="sw">
          {[['Emerald Green', '#0a5c43'], ['Gold', '#c9a24b'], ['White', '#ffffff']].map(([n, h], i) => (
            <Reveal key={n} delay={300 + (i * 100)}>
              <div style={{ textAlign: 'center' }}>
                <i style={{ background: h }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n}</span>
              </div>
            </Reveal>
          ))}
        </div>
        
        <div style={{ marginTop: '80px' }}>
          <Link to="/rsvp" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Proceed to RSVP
          </Link>
        </div>
      </section>
    </>
  )
}