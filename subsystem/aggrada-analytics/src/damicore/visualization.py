
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
