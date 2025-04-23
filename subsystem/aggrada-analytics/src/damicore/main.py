#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline otimizado DAMICORE, Redes Bayesianas e Medidas Cofenéticas.

Este script executa as seguintes etapas:
  1. Configuração do ambiente e acesso aos dados.
  2. Seleção, leitura e preparação dos dados.
     - Inclui variações para diferentes conjuntos de dados (via dbnames) e diferentes formatos (xlsx, csv, dbf).
     - Renomeia as colunas para evitar problemas com nomes longos ou caracteres especiais.
  3. Pré-processamento dos dados:
     - Normalização (opcionalmente com centralização) para padronizar as escalas.
     - Discretização (via pd.cut) para gerar dados categóricos.
     - A escolha do modo (normalized ou discretized) é configurável.
  4. Resampling (bootstrap) do conjunto de dados para avaliar a robustez dos agrupamentos.
  5. Cálculo e salvamento de matrizes de distância (usando métricas do scikit‑learn, por exemplo, Euclidiana).
  6. Execução do DAMICORE para construir árvores filogenéticas a partir dos dados resampleados.
  7. Coleta e visualização das árvores (usando toytree/toyplot), com troca dos rótulos numéricos para os nomes originais.
  8. Análise de Rede Bayesiana (usando pyAgrum) – discretiza os dados, aprende a estrutura (por exemplo, com o método de Chow‑Liu) e gera inferência.
  9. Cálculo de medidas cophenéticas e clustering (usando ete3) para extrair a estrutura evolutiva e comparar com os agrupamentos.
 10. Organização dos resultados em diretórios estruturados para reprodutibilidade.
"""

data_file = "/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-analytics/.local/aggrada-cadunico-ibge-municipios.csv"


import os
import logging
from typing import List, Dict, Any

import pandas as pd
import numpy as np
from sklearn.metrics import pairwise_distances

# =============================================================================
# 1. CONFIGURAÇÃO DO AMBIENTE
# =============================================================================
def setup_logging(level: int = logging.INFO) -> None:
    """Configura o logging do script."""
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )

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

# Implementar a NCD (Normalized Compression Distance) para a matriz de distância


# =============================================================================
# 6. EXECUÇÃO DO DAMICORE PARA ÁRVORES FILOGENÉTICAS
# =============================================================================
def run_damicore_on_resampled(resampled_source: str, results_dir: str) -> None:
    """
    Executa o DAMICORE em cada subpasta de resampled_source, utilizando parâmetros de normalização de pesos
    e compressor (gzip), salvando os resultados em results_dir.
    """
    import damicore as dm
    for folder in os.listdir(resampled_source):
        folder_path = os.path.join(resampled_source, folder)
        argv = ["damicore.py", "--normalize-weights", "--compressor", "gzip", "--results-dir", results_dir, folder_path]
        dm.main(argv[1:])  # Exclui o nome do script
    logging.info("Execução do DAMICORE concluída.")

def collect_newick_trees(results_dir: str) -> List[str]:
    """
    Coleta as árvores geradas (arquivos '001-tree.newick') em results_dir.
    """
    newick_trees = []
    for subdir in os.listdir(results_dir):
        tree_file = os.path.join(results_dir, subdir, "001-tree.newick")
        if os.path.exists(tree_file):
            with open(tree_file, "r") as f:
                newick_trees.append(f.read())
    return newick_trees

# =============================================================================
# 7. VISUALIZAÇÃO DAS ÁRVORES (TOYTREE/TOYPLOT)
# =============================================================================
def visualize_tree(newick_str: str, df_columns: List[Any], original_labels: Dict[str, str], output_pdf: str) -> None:
    """
    Gera visualizações da árvore de consenso a partir do Newick usando toytree/toyplot.
    Troca os rótulos numéricos pelos nomes originais.
    """
    import toytree
    import toyplot
    tree_obj = toytree.mtree(newick_str, tree_format=0)
    consensus_tree = tree_obj.get_consensus_tree().root()
    new_tip_labels = []
    for tip in consensus_tree.get_tip_labels():
        num = tip.strip("''")
        new_tip_labels.append(original_labels.get(num, num))
    canvas, _, _ = consensus_tree.draw(tip_labels=new_tip_labels,
                                        node_labels="support",
                                        use_edge_lengths=False,
                                        node_sizes=16)
    toyplot.pdf.render(canvas, output_pdf)
    logging.info(f"Árvore de consenso salva em: {output_pdf}")

# =============================================================================
# 8. ANÁLISE DE REDE BAYESIANA (PYAGRUM)
# =============================================================================

# Selecionar variáveis a partir do DAMICORE, usar o DAMICORE como a priori da BN
# Deixar a discretização como parâmetro de entrada
# # Ajustar o método de aprendizagem da rede bayesiana (Hill-Climbing)

def run_bayesian_network_analysis(file_csv: str, target_name: str, output_img: str) -> None:
    """
    Realiza a aprendizagem e inferência de uma rede bayesiana a partir de file_csv,
    utilizando o método de Chow-Liu com discretização por quantile.
    """
    import pyAgrum as gum
    import pyAgrum.lib.notebook as gnb
    import pyAgrum.skbn as skbn
    import pyAgrum.lib.image as gumimage
    import matplotlib.pyplot as plt

    data = pd.read_csv(file_csv)
    discretizer = skbn.BNDiscretizer(defaultDiscretizationMethod='quantile',
                                     defaultNumberOfBins=10,
                                     discretizationThreshold=25)
    template = discretizer.discretizedBN(data)
    learner = gum.BNLearner(file_csv, template)
    learner.useMIIC()
    learner.useNMLCorrection()
    bn = learner.learnBN()
    gnb.showInference(bn, size="17!")
    
    plt.figure(figsize=(30,30))
    plt.imshow(gumimage.exportInference(bn, size="20!"))
    plt.title("Rede Bayesiana - Inferência")
    plt.savefig(output_img)
    plt.show()
    logging.info(f"Rede Bayesiana salva em: {output_img}")

# =============================================================================
# 9. CÁLCULO DE MEDIDAS COPHENÉTICAS E CLUSTERING
# =============================================================================
def compute_cophenetic_measures(consensus_newick: str, output_csv: str) -> None:
    """
    A partir da árvore de consenso (Newick), calcula:
      - a matriz cophenética (tempo evolutivo) usando ete3;
      - uma matriz topológica (usando apenas a topologia).
    Salva a matriz topológica normalizada em output_csv.
    """
    from ete3 import Tree
    tree = Tree(consensus_newick)
    
    # Matriz cophenética (tempo evolutivo)
    evtime_matrix, labels = tree.cophenetic_matrix()
    evtime_dist = {l: m for l, m in zip(labels, evtime_matrix)}
    
    # Cálculo de distâncias topológicas (apenas topologia)
    from itertools import combinations_with_replacement
    topology_dist = {}
    leaves = tree.get_leaves()
    for t1, t2 in combinations_with_replacement(leaves, 2):
        d = 0 if t1 == t2 else tree.get_distance(t1, t2, topology_only=True)
        topology_dist.setdefault(t1.name, []).append(d)
        if t1 != t2:
            topology_dist.setdefault(t2.name, []).append(d)
    
    np_topo = np.array(list(topology_dist.values()))
    max_val = np.max(np_topo)
    np_topo_norm = np_topo / max_val if max_val != 0 else np_topo
    np_topo_norm = np.round(np_topo_norm, 2)
    df_topo = pd.DataFrame(np_topo_norm, index=list(topology_dist.keys()), columns=list(topology_dist.keys()))
    df_topo.to_csv(output_csv, header=None, index=None, sep=',', mode='w', decimal=".")
    logging.info(f"Matriz topológica cophenética salva em: {output_csv}")

# =============================================================================
# 10. FUNÇÃO PRINCIPAL DO PIPELINE
# =============================================================================
def main():
    setup_logging()
    
    # --- CONFIGURAÇÕES INICIAIS ---
    # Ajuste o caminho base e os nomes dos conjuntos de dados desejados.
    path_f = "/gdrive/MyDrive/Siflor_DAMICORE"  # Exemplo de caminho
    dbnames = ["Siflor_Cerrado"]                # Exemplo: escolha do conjunto; outras opções podem ser configuradas
    
    # --- ETAPA 2: SELEÇÃO, LEITURA E PREPARAÇÃO ---
    logging.info("Listando arquivos de dados...")
    filenames = list_data_files(path_f, dbnames)
    logging.info(f"Arquivos encontrados: {filenames}")
    
    logging.info("Carregando dados...")
    dfs = load_data(path_f, filenames)
    
    # Seleciona o primeiro DataFrame e renomeia as colunas.
    df = dfs[0].copy()
    original_labels = rename_columns_numeric(df)
    logging.info(f"Mapeamento de colunas: {original_labels}")
    
    # --- ETAPA 3: PRÉ-PROCESSAMENTO ---
    logging.info("Aplicando pré-processamento...")
    # Escolha entre normalização (com ou sem centralização) e discretização.
    df_norm = normalize_dataframe(df, noise=1e-6, centralize=False)
    df_discr = discretize_dataframe(df)
    preprocessing_mode = "normalized"  # ou "discretized"
    df_processed = df_norm if preprocessing_mode == "normalized" else df_discr
    
    # --- ETAPA 4: RESAMPLING (BOOTSTRAP) ---
    logging.info("Realizando resampling (bootstrap)...")
    resampled_list = resample_data(df_processed, n_samples=22)
    sheetname = os.path.splitext(filenames[0])[0]
    base_output_dir = "/content"  # Ajuste conforme necessário
    save_resampled_data(resampled_list, base_output_dir, sheetname)
    
    # --- ETAPA 5: CÁLCULO DAS MATRIZES DE DISTÂNCIA ---
    distance_output_dir = os.path.join("output", "distance_matrices")
    os.makedirs(distance_output_dir, exist_ok=True)
    process_distance_matrices(resampled_list, distance_output_dir, list(df_processed.columns))
    
    # --- ETAPA 6: EXECUÇÃO DO DAMICORE ---
    resampled_source = os.path.join("/content", sheetname)
    results_dir = os.path.join("output", "results")
    from distutils.dir_util import mkpath
    mkpath(results_dir)
    run_damicore_on_resampled(resampled_source, results_dir)
    
    # --- ETAPA 7: COLETA E VISUALIZAÇÃO DAS ÁRVORES ---
    newick_trees = collect_newick_trees(results_dir)
    if newick_trees:
        consensus_newick = newick_trees[0]  # Utiliza a primeira árvore de consenso
        consensus_pdf = os.path.join("output", "consensus_tree.pdf")
        visualize_tree(consensus_newick, list(df_processed.columns), original_labels, consensus_pdf)
    else:
        logging.error("Nenhuma árvore Newick encontrada nos resultados do DAMICORE.")
    
    # --- ETAPA 8: ANÁLISE DE REDE BAYESIANA ---
    # Aqui é utilizada uma opção de entrada para BN; ajuste o caminho conforme necessário.
    bn_csv_file = "/gdrive/MyDrive/INCT_Combate_Fome/InA_CadUnico/Estratos/pro_cad_N/InA/Macro_InA_procad_Brasil.csv"
    bn_output_img = os.path.join("output", "BN_inference.png")
    run_bayesian_network_analysis(bn_csv_file, target_name="InA_Grave", output_img=bn_output_img)
    
    # --- ETAPA 9: CÁLCULO DE MEDIDAS COPHENÉTICAS E CLUSTERING ---
    cophenetic_output_csv = os.path.join("output", "np_topology_dist_norm2objectives.csv")
    if newick_trees:
        compute_cophenetic_measures(consensus_newick, cophenetic_output_csv)
    else:
        logging.error("Não foi possível calcular medidas cophenéticas sem árvore de consenso.")
    
    logging.info("Pipeline concluído com sucesso.")

if __name__ == "__main__":
    main()
