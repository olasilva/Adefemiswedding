import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'

export default function Details() {
  return (
    <>
      <section className="sec details-intro" style={{ paddingTop: '160px' }}>
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
        
        <div className="cards" style={{ justifyContent: 'center' }}>
          <Reveal delay={100}>
            {/* Replaced the card text with the invitation image */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              marginTop: '24px'
            }}>
              <img 
                src="/invitation.jpg" 
                alt="Traditional Wedding Invitation" 
                style={{
                  width: '100%',
                  maxWidth: '550px',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              />
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
          <Link to="/access" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Proceed to RSVP
          </Link>
        </div>
      </section>
    </>
  )
}