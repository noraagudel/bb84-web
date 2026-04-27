import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.stats import binom
from bb84_simulator import simulate_bb84_iteration, compute_threshold
from grafics import plot_confusion_matrix, plot_static_threshold, plot_error_distributions, plot_multiple_roc_curves
import io, base64


def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return b64


def theoretical_detection_prob(s, p_eve, noise_rate, alpha):
    if noise_rate == 0.0:
        return 1.0 - (1.0 - 0.25 * p_eve) ** s
    p_err_eve = 0.25 * p_eve
    p_err_total = noise_rate * (1 - p_err_eve) + (1 - noise_rate) * p_err_eve
    T = compute_threshold(s, noise_rate, alpha)
    return 1.0 - binom.cdf(T, s, p_err_total)


def experiment_variable_R(n_fixed, R_values, numero_ensayos, intercept_prob, noise_rate, alpha):
    check_fraction = 0.5
    emp_probs, teo_probs, all_metrics = [], [], []

    for R in R_values:
        detected_count = 0
        for _ in range(numero_ensayos):
            caught = False
            for _ in range(R):
                res = simulate_bb84_iteration(n_fixed, intercept_prob, noise_rate, check_fraction, alpha)
                if res:
                    all_metrics.append(res['metrics'])
                    if res['eve_detected']:
                        caught = True
                        break
            if caught:
                detected_count += 1
        emp_probs.append(detected_count / numero_ensayos * 100)

        s_avg = max(1, int(n_fixed * 0.5 * check_fraction))
        p_single = theoretical_detection_prob(s_avg, intercept_prob, noise_rate, alpha)
        teo_probs.append((1 - (1 - p_single) ** R) * 100)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(R_values, emp_probs, marker='o', label='Empírica')
    ax.plot(R_values, teo_probs, marker='s', linestyle='--', label='Teórica')
    ax.set_title(f'Detección acumulada tras R iteraciones (n={n_fixed} qubits)')
    ax.set_xlabel('Iteraciones (R)')
    ax.set_ylabel('Probabilidad de Detección (%)')
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.legend()
    fig.tight_layout()

    return {
        'plot': fig_to_base64(fig),
        'confusion': plot_confusion_matrix(all_metrics, f"Matriz de Confusión (R variable, n={n_fixed})"),
        'R_values': R_values,
        'emp_probs': emp_probs,
        'teo_probs': teo_probs
    }


def experiment_variable_n(qubit_counts, numero_ensayos, intercept_prob, noise_rate, alpha):
    check_fraction = 0.5
    emp_probs, teo_probs, all_metrics = [], [], []

    for n in qubit_counts:
        detected_count, valid_runs, suma_teo = 0, 0, 0.0
        for _ in range(numero_ensayos):
            res = simulate_bb84_iteration(n, intercept_prob, noise_rate, check_fraction, alpha)
            if res:
                valid_runs += 1
                all_metrics.append(res['metrics'])
                if res['eve_detected']:
                    detected_count += 1
                suma_teo += theoretical_detection_prob(res['s_simulacion'], intercept_prob, noise_rate, alpha)

        emp_probs.append((detected_count / valid_runs * 100) if valid_runs else 0)
        teo_probs.append((suma_teo / valid_runs * 100) if valid_runs else 0)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(qubit_counts, emp_probs, marker='o', label='Empírica')
    ax.plot(qubit_counts, teo_probs, marker='s', linestyle='--', label='Teórica')
    ax.set_title(f'Detección vs Número de Qubits (muestras={numero_ensayos})')
    ax.set_xlabel('Qubits (n)')
    ax.set_ylabel('Probabilidad de Detección (%)')
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.legend()
    fig.tight_layout()

    return {
        'plot': fig_to_base64(fig),
        'confusion': plot_confusion_matrix(all_metrics, f"Matriz de Confusión (n variable)"),
        'qubit_counts': qubit_counts,
        'emp_probs': emp_probs,
        'teo_probs': teo_probs
    }


def experiment_roc_variable_n(qubit_counts, numero_ensayos, intercept_prob, noise_rate):
    check_fraction = 0.5
    resultados_roc = {} 
    
    for n in qubit_counts:
        y_true = []
        y_scores = []
        
        for _ in range(numero_ensayos):
            ataque_activo = np.random.rand() < 0.5
            p_actual = intercept_prob if ataque_activo else 0.0
            
            res = simulate_bb84_iteration(n, p_actual, noise_rate, check_fraction, alpha=0.05)
            
            if res:
                tasa_error = res['errors_count'] / res['s_simulacion']
                y_true.append(res['eve_present'])
                y_scores.append(tasa_error)
                
        resultados_roc[f"n={n}"] = (y_true, y_scores)
        
    # Guardamos el base64 que devuelve la función gráfica
    plot_b64 = plot_multiple_roc_curves(resultados_roc, title=f"Evolución de la Detección (Ruido={noise_rate*100}%)")
    
    return {
        "plot": plot_b64
    }


def experiment_variable_p_and_n(qubit_counts, numero_ensayos, p_values, noise_rate, alpha):
    check_fraction = 0.5
    colores = ['tab:blue', 'tab:orange', 'tab:green', 'tab:red', 'tab:purple', 'tab:brown']
    fig, ax = plt.subplots(figsize=(12, 8))
    all_metrics = []
    series = []

    for idx, n in enumerate(qubit_counts):
        emp_probs, teo_probs = [], []
        color = colores[idx % len(colores)]
        for p in p_values:
            detected, valid, suma_teo = 0, 0, 0.0
            for _ in range(numero_ensayos):
                res = simulate_bb84_iteration(n, p, noise_rate, check_fraction, alpha)
                if res:
                    valid += 1
                    all_metrics.append(res['metrics'])
                    if res['eve_detected']:
                        detected += 1
                    suma_teo += theoretical_detection_prob(res['s_simulacion'], p, noise_rate, alpha)
            emp_probs.append((detected / valid * 100) if valid else 0)
            teo_probs.append((suma_teo / valid * 100) if valid else 0)

        ax.plot(p_values, emp_probs, marker='o', color=color, label=f'Empírica (n={n})')
        ax.plot(p_values, teo_probs, linestyle='--', color=color, alpha=0.6, label=f'Teórica (n={n})')
        series.append({'n': n, 'emp': emp_probs, 'teo': teo_probs})

    ax.set_title('Detección vs Tasa de Intercepción de Eve (p)\n(0% Ruido)')
    ax.set_xlabel('Fracción interceptada por Eve (p)')
    ax.set_ylabel('Probabilidad de Detección (%)')
    ax.set_xticks(np.arange(0, 1.1, 0.1))
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    fig.tight_layout()

    return {
        'plot': fig_to_base64(fig),
        'confusion': plot_confusion_matrix(all_metrics, "Matriz de Confusión (Eve y n variables)"),
        'p_values': list(p_values),
        'series': series
    }