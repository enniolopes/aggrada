#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline otimizado para análise de dados integrando DAMICORE, Redes Bayesianas e Medidas Cophenéticas.

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
  
Cada módulo foi projetado para ser facilmente ajustado e integrado, possibilitando a inclusão de variações (por exemplo, diferentes fontes de dados, modos de pré-processamento e métodos de cálculo de distância) conforme as necessidades da análise.
"""

import os
import logging
from typing import List, Dict, Any

import pandas as pd
import numpy as np
from sklearn.metrics import pairwise_distances

from src.damicore.data_loading import list_data_files, load_data, rename_columns_numeric
from src.damicore.preprocessing import normalize_dataframe, discretize_dataframe
from src.damicore.resampling import resample_data, save_resampled_data
from src.damicore.distance import compute_distance_matrix, save_distance_matrix, process_distance_matrices
from src.damicore.damicore_runner import run_damicore_on_resampled, collect_newick_trees
from src.damicore.visualization import visualize_tree
from src.damicore.bayesian_network import run_bayesian_network_analysis
from src.damicore.cophenetic import compute_cophenetic_measures

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
