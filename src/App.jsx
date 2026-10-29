import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Details from './pages/Details'
import RSVP from './pages/RSVP'
import './index.css'

export default function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/details" element={<Details />} />
        <Route path="/rsvp" element={<RSVP />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}