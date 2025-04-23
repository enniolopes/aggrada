
# =============================================================================
# 5. CÁLCULO E SALVAMENTO DAS MATRIZES DE DISTÂNCIA
# =============================================================================
def compute_distance_matrix(df: pd.DataFrame, metric: str = "euclidean") -> np.ndarray:
    """
    Calcula a matriz de distância entre as colunas (após transpor o DataFrame) usando a métrica especificada.
    Retorna a matriz normalizada.
    """
    data = df.values.T
    dm = pairwise_distances(data, metric=metric)
    max_val = np.max(dm)
    return dm / max_val if max_val != 0 else dm

def save_distance_matrix(dm: np.ndarray, filepath: str, columns: List[Any]) -> None:
    """
    Salva a parte triangular superior da matriz de distância em um arquivo CSV com cabeçalho fixo.
    """
    with open(filepath, "w") as f:
        f.write("x,y,zx,zy,zxy,ncd")
        for i, label_i in enumerate(columns):
            for j in range(i+1, len(columns)):
                f.write(f"\n{label_i},{columns[j]},0,0,0,{dm[i, j]}")
    logging.info(f"Matriz de distância salva em: {filepath}")

def process_distance_matrices(resampled: List[pd.DataFrame], output_dir: str, df_columns: List[Any]) -> None:
    """
    Para cada DataFrame resampleado, calcula e salva a matriz de distância.
    """
    for idx, sample in enumerate(resampled):
        dm = compute_distance_matrix(sample)
        out_file = os.path.join(output_dir, f"dm-sklearn-{idx}.csv")
        save_distance_matrix(dm, out_file, df_columns)
