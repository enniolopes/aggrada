
# =============================================================================
# 3. PRÉ-PROCESSAMENTO: NORMALIZAÇÃO E DISCRETIZAÇÃO
# =============================================================================
def normalize_dataframe(df: pd.DataFrame, noise: float = 1e-6, centralize: bool = False) -> pd.DataFrame:
    """
    Normaliza cada coluna dividindo pelo seu valor máximo e adiciona um pequeno ruído para evitar zeros.
    Se centralize=True, subtrai a média de cada coluna (opcional).
    """
    df_norm = df.copy().astype(float)
    for col in df_norm.columns:
        max_val = df_norm[col].max()
        df_norm[col] = df_norm[col].apply(lambda x: x/max_val + noise if max_val != 0 else noise)
        if centralize:
            df_norm[col] = df_norm[col] - df_norm[col].mean()
    return df_norm

def discretize_dataframe(df: pd.DataFrame, bins: int = 10) -> pd.DataFrame:
    """
    Discretiza cada coluna em 'bins' intervalos usando pd.cut.
    """
    df_discr = df.copy()
    for col in df.columns:
        df_discr[col] = pd.cut(df_discr[col], bins, labels=list(range(bins)))
    return df_discr
