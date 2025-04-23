
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
