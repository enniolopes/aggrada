
# =============================================================================
# 8. ANÁLISE DE REDE BAYESIANA (PYAGRUM)
# =============================================================================
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
