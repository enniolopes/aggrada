
# =============================================================================
# 2. SELEÇÃO, LEITURA E PREPARAÇÃO DOS DADOS
# =============================================================================
def list_data_files(path: str, dbnames: List[str], exts: List[str] = None) -> List[str]:
    """
    Lista os arquivos em 'path' que contenham algum dos nomes especificados em 'dbnames'
    e possuam as extensões desejadas (padrão: ['xlsx', 'csv', 'dbf']).
    """
    if exts is None:
        exts = ['xlsx', 'csv', 'dbf']
    all_files = os.listdir(path)
    candidate_files = [f for f in all_files if any(ext in f for ext in exts)]
    found_files = []
    for db in dbnames:
        match = next((f for f in candidate_files if db in f), None)
        if not match:
            raise FileNotFoundError(f"Arquivo para '{db}' não encontrado em {path}.")
        found_files.append(match)
    return found_files

def load_data(path: str, filenames: List[str]) -> List[pd.DataFrame]:
    """
    Carrega os arquivos (xlsx, csv ou dbf) e retorna uma lista de DataFrames.
    """
    dataframes = []
    for fname in filenames:
        full_path = os.path.join(path, fname)
        if "csv" in fname.lower():
            df = pd.read_csv(full_path, header=0)
        elif "xlsx" in fname.lower():
            df = pd.read_excel(full_path, header=0)
        elif "dbf" in fname.lower():
            try:
                import geopandas as gpd
            except ImportError:
                raise ImportError("geopandas é necessário para ler arquivos DBF.")
            table = gpd.read_file(full_path)
            df = pd.DataFrame(table)
        else:
            raise ValueError(f"Formato de arquivo não suportado: {fname}")
        dataframes.append(df)
    return dataframes

def rename_columns_numeric(df: pd.DataFrame) -> Dict[str, str]:
    """
    Renomeia as colunas do DataFrame para strings numéricas (0, 1, 2, ...) e retorna o mapeamento original.
    """
    original_cols = list(df.columns)
    new_cols = list(map(str, range(len(original_cols))))
    mapping = dict(zip(original_cols, new_cols))
    df.rename(columns=mapping, inplace=True)
    return mapping
