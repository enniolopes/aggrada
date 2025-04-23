
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
