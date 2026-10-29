import { useEffect, useState } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Admin from './pages/Admin'
import './index.css'

export default function App() {
  const [h, setH] = useState(location.hash)
  useEffect(() => {
    const f = () => { setH(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return (
    <>
      <Header />
      {h === '#/admin' ? <Admin /> : <Home />}
    </>
  )
}