
# =============================================================================
# 4. RESAMPLING (BOOTSTRAP)
# =============================================================================
def resample_data(df: pd.DataFrame, n_samples: int = 22) -> List[pd.DataFrame]:
    """
    Realiza resampling (bootstrap) do DataFrame; retorna o original e n_samples amostras.
    """
    samples = [df]
    for _ in range(n_samples):
        samples.append(df.sample(n=len(df), replace=True))
    return samples

def save_resampled_data(resampled: List[pd.DataFrame], base_dir: str, sheetname: str) -> None:
    """
    Salva cada DataFrame resampleado em subpastas organizadas em base_dir/sheetname.
    Cada subpasta contém os dados de cada coluna salvos individualmente.
    """
    from distutils.dir_util import mkpath
    resampled_path = os.path.join(base_dir, sheetname)
    mkpath(resampled_path)
    for idx, sample in enumerate(resampled):
        sample_dir = os.path.join(resampled_path, f"{sheetname}{idx}")
        mkpath(sample_dir)
        for col in sample.columns:
            fname = col.replace("/", "-")
            with open(os.path.join(sample_dir, fname), "w") as f:
                f.write(str(sample[col]))
    logging.info(f"Dados resampleados salvos em: {resampled_path}")
