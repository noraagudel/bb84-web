import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import IdealCase from './pages/IdealCase'
import NoisyCase from './pages/NoisyCase'

// Paleta Científica / Corporativa
const navStyle = { 
  display: 'flex', gap: '2rem', padding: '1.2rem 2.5rem',
  background: '#0F172A', // Azul marino muy oscuro
  alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
}

const linkStyle = ({ isActive }) => ({
  color: isActive ? '#38BDF8' : '#94A3B8', // Azul claro si está activo, gris azulado si no
  textDecoration: 'none', 
  fontWeight: isActive ? 600 : 400, 
  fontSize: '1rem',
  transition: 'color 0.2s'
})

export default function App() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh',
      background: '#F8FAFC', color: '#1E293B' }}>
      
      <nav style={navStyle}>
        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.3rem', marginRight: 'auto', letterSpacing: '-0.5px' }}>
          BB84 Quantum Simulator
        </span>
        <NavLink to="/"        style={linkStyle}>Introducción</NavLink>
        <NavLink to="/ideal"   style={linkStyle}>Caso Ideal</NavLink>
        <NavLink to="/ruido"   style={linkStyle}>Ruido Ambiental</NavLink>
      </nav>
      
      <main>
        <Routes>
          <Route path="/"      element={<Home />} />
          <Route path="/ideal" element={<IdealCase />} />
          <Route path="/ruido" element={<NoisyCase />} />
        </Routes>
      </main>
    </div>
  )
}