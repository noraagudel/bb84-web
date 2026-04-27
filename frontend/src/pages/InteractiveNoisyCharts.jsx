import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';

// --- LÓGICA MATEMÁTICA EN JAVASCRIPT ---

// Calcula las combinaciones (n sobre k)
function combination(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= k; i++) {
    c = (c * (n - i + 1)) / i;
  }
  return c;
}

// Probabilidad de Masa (PMF) - Probabilidad exacta de tener 'k' errores
function binomPMF(k, n, p) {
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Probabilidad Acumulada (CDF) - Probabilidad de tener 'k' o menos errores
function binomCDF(k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) sum += binomPMF(i, n, p);
  return sum;
}

// Calcula el Umbral T (la inversa de la CDF)
function computeT(s, noise, alpha) {
  if (noise === 0 || alpha === 0) return 0;
  const target = 1 - alpha;
  for (let k = 0; k <= s; k++) {
    if (binomCDF(k, s, noise) >= target) return k;
  }
  return s;
}

// --- COMPONENTE REACT ---

export default function InteractiveNoisyCharts() {
  // Estados de los Sliders
  const [nQubits, setNQubits] = useState(200); // Hasta 400 para ver curvas bonitas
  const [alpha, setAlpha] = useState(0.05);
  const [noiseRate, setNoiseRate] = useState(0.02);
  const [pEve, setPEve] = useState(1.0);

  // useMemo re-calcula los datos SOLO cuando cambian los sliders
  const chartData = useMemo(() => {
    // Calculamos s_simulacion (igual que en tu Python: n * 0.5 * check_fraction)
    const check_fraction = 0.5;
    const s = Math.max(1, Math.floor(nQubits * 0.5 * check_fraction));
    
    // Probabilidades de error
    const p_err_eve = 0.25 * pEve;
    const p_err_total = noiseRate * (1 - p_err_eve) + (1 - noiseRate) * p_err_eve;
    
    // Calculamos Umbral T
    const T = computeT(s, noiseRate, alpha);

    const data = [];
    // Calculamos las curvas hasta s (o un poco más allá de T para no pintar espacios vacíos gigantes)
    const maxK = Math.min(s, Math.max(20, T * 3)); 

    for (let k = 0; k <= maxK; k++) {
      data.push({
        k: k,
        cdfRuido: binomCDF(k, s, noiseRate),
        pmfRuido: binomPMF(k, s, noiseRate),
        pmfEve: binomPMF(k, s, p_err_total),
      });
    }

    return { data, s, T };
  }, [nQubits, alpha, noiseRate, pEve]);

  // ... (Toda la lógica matemática de arriba se mantiene igual) ...

  const { data, s, T } = chartData;

  const sliderStyle = { width: '100%', cursor: 'pointer', accentColor: '#3B82F6' };
  const labelStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#1E293B', fontWeight: 600, marginBottom: '0.5rem' };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      
      {/* PANEL DE CONTROLES DEL CANAL (Alice y Bob) */}
      <h3 style={{ marginTop: 0, color: '#0F172A', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.5rem' }}>1. Configuración del Canal (Alice y Bob)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
        
        <div>
          <div style={labelStyle}><span>Qubits totales (n)</span> <span style={{ color: '#3B82F6' }}>{nQubits}</span></div>
          <input type="range" min="10" max="400" step="10" value={nQubits} onChange={(e) => setNQubits(Number(e.target.value))} style={sliderStyle} />
          <small style={{ color: '#64748B', fontSize: '0.8rem' }}>Muestra para test (s) = {s}</small>
        </div>

        <div>
          <div style={labelStyle}><span>Tolerancia (α)</span> <span style={{ color: '#3B82F6' }}>{(alpha * 100).toFixed(1)}%</span></div>
          <input type="range" min="0.001" max="0.20" step="0.001" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} style={sliderStyle} />
          <small style={{ color: '#64748B', fontSize: '0.8rem' }}>Riesgo de falsa alarma</small>
        </div>

        <div>
          <div style={labelStyle}><span>Ruido Natural</span> <span style={{ color: '#3B82F6' }}>{(noiseRate * 100).toFixed(1)}%</span></div>
          <input type="range" min="0" max="0.15" step="0.005" value={noiseRate} onChange={(e) => setNoiseRate(Number(e.target.value))} style={sliderStyle} />
          <small style={{ color: '#64748B', fontSize: '0.8rem' }}>Defectos en la fibra</small>
        </div>
      </div>

      {/* GRÁFICA 1: CDF y Alpha */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ textAlign: 'center', color: '#0F172A' }}>¿Cómo se define el Umbral T? (Probabilidad Acumulada)</h3>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#64748B', marginBottom: '1.5rem' }}>
          T es el error máximo tolerado donde la certeza alcanza la seguridad objetivo <b>1 - α ({(1 - alpha).toFixed(3)})</b>
        </p>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
              <XAxis dataKey="k" label={{ value: 'Errores observados (k)', position: 'insideBottom', offset: -10 }} stroke="#64748B" />
              <YAxis label={{ value: 'Probabilidad Acumulada P(X≤k)', angle: -90, position: 'insideLeft', offset: -10 }} stroke="#64748B" domain={[0, 1.05]} />
              <Tooltip formatter={(value) => value.toFixed(4)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              
              <Line type="stepAfter" dataKey="cdfRuido" name="CDF (Solo Ruido)" stroke="#3B82F6" strokeWidth={3} dot={false} />
              
              <ReferenceLine y={1 - alpha} stroke="#10B981" strokeDasharray="5 5" label={{ value: `Meta: ${1 - alpha}`, position: 'top', fill: '#10B981', fontWeight: 'bold' }} />
              <ReferenceLine x={T} stroke="#0F172A" strokeWidth={2} label={{ value: `Umbral T = ${T}`, position: 'insideTopRight', fill: '#0F172A', fontWeight: 'bold' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '2px dashed #E2E8F0', margin: '3rem 0' }} />

      {/* GRÁFICA 2: PMF y Colisión de distribuciones */}
      <div>
        <h3 style={{ textAlign: 'center', color: '#0F172A' }}>Distribución de Errores: Canal Seguro vs Ataque</h3>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#64748B', marginBottom: '2rem' }}>
          Cualquier número de errores <b>mayor que el Umbral ({T})</b> hará saltar la alarma de espionaje.
        </p>

        {/* PANEL DE CONTROL DE EVE (Exclusivo para la Gráfica 2) */}
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1.5rem', borderRadius: '8px', maxWidth: '500px', margin: '0 auto 2rem auto', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#991B1B', fontWeight: 600, marginBottom: '0.5rem' }}>
            <span>Agresividad de Eve (Intercepción p)</span>
            <span>{(pEve * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.05" value={pEve} onChange={(e) => setPEve(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#DC2626' }} />
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#B91C1C', textAlign: 'center' }}>
            Desplaza este valor para observar cómo se mueve la campana roja (Ataque).
          </p>
        </div>

        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
              <XAxis dataKey="k" label={{ value: 'Errores observados (k)', position: 'insideBottom', offset: -10 }} stroke="#64748B" />
              <YAxis label={{ value: 'Probabilidad Exacta P(X=k)', angle: -90, position: 'insideLeft', offset: -10 }} stroke="#64748B" />
              <Tooltip formatter={(value) => value.toFixed(4)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontWeight: 600 }} />
              
              <Area type="monotone" dataKey="pmfRuido" name="Solo Ruido (Seguro)" fill="#3B82F6" stroke="#2563EB" strokeWidth={2} fillOpacity={0.2} />
              <Area type="monotone" dataKey="pmfEve" name="Ruido + Eve (Ataque)" fill="#EF4444" stroke="#DC2626" strokeWidth={2} fillOpacity={0.2} />
              
              <ReferenceLine x={T} stroke="#0F172A" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Límite T = ${T}`, position: 'insideTopRight', fill: '#0F172A', fontWeight: 'bold' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}