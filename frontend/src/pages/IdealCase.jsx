import { useState } from 'react'
import { fetchIdealVariableR, fetchIdealVariableN, fetchIdealVariablePN } from '../api'

// Añadimos descripciones claras a cada opción
const simulations = [
  { key: 'r',  label: 'Evolución por Iteraciones (R)', desc: 'Mantiene los qubits fijos. Útil para ver cómo repetir el protocolo asegura la detección de Eve.', fetch: fetchIdealVariableR  },
  { key: 'n',  label: 'Impacto de Qubits (n)', desc: 'Envío único. Muestra cómo aumentar la longitud del mensaje mejora exponencialmente la seguridad.', fetch: fetchIdealVariableN  },
  { key: 'pn', label: 'Agresividad de Eve (p)', desc: 'Cruza diferentes tamaños de mensaje (n) con distintas tasas de intercepción de Eve (p).', fetch: fetchIdealVariablePN },
]

function PlotCard({ title, src }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', marginBottom: '2rem' }}>
      <h3 style={{ marginTop: 0, color: '#0F172A' }}>{title}</h3>
      <img src={`data:image/png;base64,${src}`} alt={title} style={{ width: '100%', borderRadius: '8px' }} />
    </div>
  )
}

export default function IdealCase() {
  const [active, setActive] = useState('r')
  const [data, setData]     = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  async function runExperiment(key, fetchFn) {
    setActive(key)
    if (data[key]) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(d => ({ ...d, [key]: res }))
    } catch {
      setError('Error de conexión. ¿Está Uvicorn encendido?')
    } finally {
      setLoading(false)
    }
  }

  const current = data[active]

  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
      
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ color: '#0F172A', margin: '0 0 0.5rem 0', fontSize: '2.2rem' }}>Caso Ideal</h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
          Ausencia total de ruido en la fibra óptica. Cualquier error detectado proviene de una intercepción al 100%.
        </p>
      </header>

      {/* CUADRÍCULA DE TARJETAS DE SELECCIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {simulations.map(sim => {
          const isActive = active === sim.key;
          return (
            <div 
              key={sim.key} 
              onClick={() => runExperiment(sim.key, sim.fetch)}
              style={{
                padding: '1.2rem', borderRadius: '10px', cursor: 'pointer',
                background: isActive ? '#EFF6FF' : 'white',
                border: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: isActive ? '#1D4ED8' : '#1E293B', fontSize: '1.05rem' }}>
                {sim.label}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4' }}>
                {sim.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* ÁREA DE RESULTADOS */}
      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#3B82F6', fontWeight: 'bold' }}>⏳ Ejecutando simulación cuántica...</div>}
      {error   && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

      {current && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <PlotCard title="Probabilidad de Detección" src={current.plot} />
          {current.confusion && <PlotCard title="Matriz de Confusión" src={current.confusion} />}
        </div>
      )}
    </div>
  )
}