import { useState } from 'react'
import { fetchNoisyVariableR, fetchNoisyVariableN, fetchNoisyROC } from '../api'
import InteractiveNoisyCharts from './InteractiveNoisyCharts'

const simulations = [
  { key: 'interactive', label: 'Análisis Teórico Interactivo', desc: 'Explora matemáticamente cómo se define el Umbral T y chocan las distribuciones sin necesidad de simular.', fetch: null },
  { key: 'r',   label: 'Evolución por Iteraciones (R)', desc: 'Simula múltiples rondas con un ruido del 2%. Evalúa cómo el ruido complica la detección.', fetch: fetchNoisyVariableR  },
  { key: 'n',   label: 'Impacto de Qubits (n)', desc: 'Analiza la precisión en un solo envío. A más qubits, mejor se diferencia a Eve del ruido.', fetch: fetchNoisyVariableN  },
  { key: 'roc', label: 'Curvas ROC (Machine Learning)', desc: 'Mide la capacidad real del sistema para distinguir entre una falsa alarma y un ataque genuino.', fetch: fetchNoisyROC        },
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

export default function NoisyCase() {
  const [active, setActive]   = useState('interactive')
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function runExperiment(key, fetchFn) {
    setActive(key)
    if (!fetchFn) return; 
    
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
        <h1 style={{ color: '#0F172A', margin: '0 0 0.5rem 0', fontSize: '2.2rem' }}>Ruido Ambiental Real</h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
          Canal imperfecto con interferencias. Alice y Bob deben usar un Umbral Estadístico (T) para evitar Falsas Alarmas.
        </p>
      </header>

      {/* CUADRÍCULA DE TARJETAS DE SELECCIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
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
      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#3B82F6', fontWeight: 'bold' }}>⏳ Ejecutando simulador en servidor backend...</div>}
      {error   && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

      {active === 'interactive' && <InteractiveNoisyCharts />}

      {active !== 'interactive' && current && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <PlotCard title="Análisis de Rendimiento" src={current.plot} />
          {current.confusion && <PlotCard title="Matriz de Confusión" src={current.confusion} />}
        </div>
      )}
    </div>
  )
}