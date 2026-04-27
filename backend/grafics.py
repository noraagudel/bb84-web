import matplotlib
matplotlib.use('Agg')  # Sin GUI — obligatorio para servidor
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import binom
from bb84_simulator import compute_threshold
import io, base64


def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return b64


def plot_confusion_matrix(metrics_list, title="Matriz de Confusión"):
    total_TP = sum(m['TP'] for m in metrics_list)
    total_FP = sum(m['FP'] for m in metrics_list)
    total_TN = sum(m['TN'] for m in metrics_list)
    total_FN = sum(m['FN'] for m in metrics_list)

    matrix = np.array([[total_TP, total_FN],
                       [total_FP, total_TN]])

    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(matrix, cmap='Blues')
    for (i, j), val in np.ndenumerate(matrix):
        ax.text(j, i, f'{val}', ha='center', va='center',
                color='white' if val > (np.max(matrix) / 2) else 'black',
                fontsize=14, fontweight='bold')
    plt.title(title, pad=20)
    plt.colorbar(cax)
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(['Alarma', 'Seguro'])
    ax.set_yticklabels(['Eve Presente', 'Solo Ruido'])
    plt.xlabel('Predicción (Umbral T)', fontsize=12)
    plt.ylabel('Realidad', fontsize=12)
    return fig_to_base64(fig)


def plot_multiple_roc_curves(dict_of_results, title="Comparativa de Curvas ROC"):
    """
    Versión Web: Dibuja varias curvas ROC y retorna la imagen en Base64.
    """
    fig, ax = plt.subplots(figsize=(9, 7))
    colores = plt.cm.tab10.colors
    
    for idx, (label_name, (y_true, y_scores)) in enumerate(dict_of_results.items()):
        y_true = np.array(y_true)
        y_scores = np.array(y_scores)
        
        P = np.sum(y_true)
        N = len(y_true) - P
        
        if P == 0 or N == 0:
            continue
            
        umbrales = np.sort(np.unique(y_scores))[::-1]
        umbrales = np.concatenate(([max(umbrales) + 0.1], umbrales, [min(umbrales) - 0.1]))
        
        tpr_list, fpr_list = [], []
        for T in umbrales:
            prediccion_ataque = y_scores >= T
            TP = np.sum(prediccion_ataque & y_true)
            FP = np.sum(prediccion_ataque & ~y_true)
            tpr_list.append(TP / P)
            fpr_list.append(FP / N)
            
        indices = np.argsort(fpr_list)
        fpr_sorted = np.array(fpr_list)[indices]
        tpr_sorted = np.array(tpr_list)[indices]
        
        try:
            auc_value = np.trapezoid(tpr_sorted, fpr_sorted)
        except AttributeError:
            auc_value = np.trapz(tpr_sorted, fpr_sorted)
            
        color = colores[idx % len(colores)]
        ax.plot(fpr_sorted, tpr_sorted, lw=2, color=color,
                 label=f'{label_name} (AUC = {auc_value:.3f})')

    ax.plot([0, 1], [0, 1], color='black', lw=2, linestyle='--', label='Azar (AUC = 0.5)')
    
    ax.set_xlim([-0.02, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('Tasa de Falsos Positivos (FPR)', fontsize=12)
    ax.set_ylabel('Tasa de Verdaderos Positivos (TPR)', fontsize=12)
    ax.set_title(title, fontsize=14)
    ax.legend(loc="lower right")
    ax.grid(True, linestyle=':', alpha=0.7)
    fig.tight_layout()
    
    return fig_to_base64(fig)


def plot_static_threshold(s_simulacion=50):
    alphas = np.linspace(0.001, 0.20, 200)
    noise_rates = [0.0, 0.02, 0.05, 0.10]
    colores = ['green', 'blue', 'orange', 'red']
    fig, ax = plt.subplots(figsize=(10, 6))
    for noise, color in zip(noise_rates, colores):
        Ts = [int(binom.ppf(1 - a, s_simulacion, noise)) for a in alphas]
        ax.step(alphas, Ts, where='post', color=color, linewidth=2, label=f'Ruido: {noise*100}%')
    ax.set_title(f'Umbral T vs Tolerancia a Falsos Positivos α (s={s_simulacion})')
    ax.set_xlabel('Tolerancia α')
    ax.set_ylabel('Umbral T')
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.legend()
    fig.tight_layout()
    return fig_to_base64(fig)


def plot_error_distributions(s_simulacion, noise_rate, intercept_prob, alpha):
    p_err_eve = 0.25 * intercept_prob
    p_err_total = noise_rate * (1 - p_err_eve) + (1 - noise_rate) * p_err_eve
    k_values = np.arange(0, s_simulacion + 1)
    pmf_solo_ruido = binom.pmf(k_values, s_simulacion, noise_rate)
    pmf_con_eve = binom.pmf(k_values, s_simulacion, p_err_total)
    T = compute_threshold(s_simulacion, noise_rate, alpha)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.fill_between(k_values, pmf_solo_ruido, color='blue', alpha=0.3, label='Solo Ruido')
    ax.fill_between(k_values, pmf_con_eve, color='red', alpha=0.3, label='Ruido + Eve')
    ax.plot(k_values, pmf_solo_ruido, color='blue', lw=2)
    ax.plot(k_values, pmf_con_eve, color='red', lw=2)
    ax.axvline(x=T, color='black', linestyle='--', lw=2, label=f'Umbral T={T}')
    ax.set_title(f'Distribución de Errores (s={s_simulacion}, ruido={noise_rate}, p_Eve={intercept_prob})')
    ax.set_xlabel('Errores observados (k)')
    ax.set_ylabel('Probabilidad P(X=k)')
    ax.set_xlim(0, max(20, T * 2.5))
    ax.legend()
    ax.grid(True, linestyle=':', alpha=0.6)
    fig.tight_layout()
    return fig_to_base64(fig)
