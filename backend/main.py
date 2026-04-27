from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from experiments import (
    experiment_variable_R,
    experiment_variable_n,
    experiment_roc_variable_n,
    experiment_variable_p_and_n
)
from grafics import plot_static_threshold, plot_error_distributions

app = FastAPI(title="BB84 Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── CASO IDEAL (0% ruido, 100% Eve) ────────────────────────────────────

@app.get("/api/ideal/variable-r")
def ideal_variable_r():
    return experiment_variable_R(
        n_fixed=16,
        R_values=[1, 2, 3, 5, 8, 12, 20],
        numero_ensayos=300,   # reducido para respuesta rápida en web
        intercept_prob=1.0,
        noise_rate=0.0,
        alpha=0.0
    )


@app.get("/api/ideal/variable-n")
def ideal_variable_n():
    return experiment_variable_n(
        qubit_counts=[1, 4, 8, 16, 32, 64, 128],
        numero_ensayos=300,
        intercept_prob=1.0,
        noise_rate=0.0,
        alpha=0.0
    )


@app.get("/api/ideal/variable-p-n")
def ideal_variable_p_n():
    return experiment_variable_p_and_n(
        qubit_counts=[1, 6, 8, 12, 20],
        numero_ensayos=200,
        p_values=np.linspace(0.0, 1.0, 11),
        noise_rate=0.0,
        alpha=0.0
    )


# ── CASO CON RUIDO (2% ruido, 100% Eve) ────────────────────────────────

@app.get("/api/noisy/threshold-plot")
def noisy_threshold_plot():
    return {"plot": plot_static_threshold(s_simulacion=50)}


@app.get("/api/noisy/error-distribution")
def noisy_error_distribution():
    return {"plot": plot_error_distributions(
        s_simulacion=50, noise_rate=0.02, intercept_prob=1.0, alpha=0.05
    )}


@app.get("/api/noisy/variable-r")
def noisy_variable_r():
    return experiment_variable_R(
        n_fixed=16,
        R_values=[1, 2, 3, 5, 8, 12, 20],
        numero_ensayos=300,
        intercept_prob=1.0,
        noise_rate=0.02,
        alpha=0.05
    )


@app.get("/api/noisy/variable-n")
def noisy_variable_n():
    return experiment_variable_n(
        qubit_counts=[1, 4, 8, 16, 32, 64, 128],
        numero_ensayos=300,
        intercept_prob=1.0,
        noise_rate=0.02,
        alpha=0.05
    )

# - ROC caso con ruido y eve puede estar o no presente, por eso no se fija el intercept_prob a 1.0, sino que se simula con probabilidad de ataque activo del 50% (intercept_prob=0.5) para generar una curva ROC realista.


@app.get("/api/noisy/roc")
def noisy_roc_plot():
    # Bajamos los ensayos a 300 para que la web cargue rápido
    return experiment_roc_variable_n(
        qubit_counts=[8, 16, 32, 64],
        numero_ensayos=300, 
        intercept_prob=1.0,
        noise_rate=0.02
    )
