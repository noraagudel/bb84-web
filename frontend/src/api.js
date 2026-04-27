const BASE = '/api'

export const fetchIdealVariableR  = () => fetch(`${BASE}/ideal/variable-r`).then(r => r.json())
export const fetchIdealVariableN  = () => fetch(`${BASE}/ideal/variable-n`).then(r => r.json())
export const fetchIdealVariablePN = () => fetch(`${BASE}/ideal/variable-p-n`).then(r => r.json())

export const fetchNoisyThreshold  = () => fetch(`${BASE}/noisy/threshold-plot`).then(r => r.json())
export const fetchNoisyErrorDist  = () => fetch(`${BASE}/noisy/error-distribution`).then(r => r.json())
export const fetchNoisyVariableR  = () => fetch(`${BASE}/noisy/variable-r`).then(r => r.json())
export const fetchNoisyVariableN  = () => fetch(`${BASE}/noisy/variable-n`).then(r => r.json())
export const fetchNoisyROC        = () => fetch(`${BASE}/noisy/roc`).then(r => r.json())