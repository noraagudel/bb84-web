export default function Home() {
  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 1.5rem', animation: 'fadeIn 0.5s ease-in' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0F172A', letterSpacing: '-0.5px', textAlign: 'center' }}>
        Simulador del Protocolo BB84
      </h1>

      {/* Tarjeta de introducción */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '2.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '3rem', borderLeft: '4px solid #3B82F6' }}>
        <h2 style={{ marginTop: 0, color: '#0F172A', fontSize: '1.5rem' }}>¿Qué es BB84?</h2>
        <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '1.1rem', margin: 0 }}>
          BB84 es el primer protocolo de distribución cuántica de claves (QKD), propuesto por
          Bennett y Brassard en 1984. Permite a dos partes (Alice y Bob) establecer una clave
          secreta compartida de forma que cualquier intento de espionaje por parte de un
          tercero (Eve) sea detectable, gracias a los principios de la mecánica cuántica.
        </p>
      </div>

      {/* Opciones de navegación */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'Caso Ideal', desc: '0% de ruido ambiental, 100% de intercepción. Condiciones perfectas para verificar la lógica pura del protocolo.', href: '/ideal' },
          { title: 'Ruido Ambiental Real', desc: 'Canal imperfecto. Se añade incertidumbre estadística y se calcula un umbral adaptativo para evitar falsas alarmas.', href: '/ruido' }
        ].map(c => (
          <a key={c.title} href={c.href} style={{ background: 'white', borderRadius: '12px',
            padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            textDecoration: 'none', color: 'inherit', display: 'block',
            borderTop: '4px solid #3B82F6', transition: 'all 0.2s ease-in-out' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <h3 style={{ margin: '0 0 1rem', color: '#1D4ED8', fontSize: '1.4rem' }}>{c.title}</h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '1.05rem', lineHeight: '1.6' }}>{c.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}