O fluxo geral do pipeline:

1. Configuração do Ambiente e Acesso aos Dados  

2. Seleção, Leitura e Preparação dos Dados:  
– Os arquivos são localizados e lidos (xlsx, csv ou dbf).  
– As colunas são renomeadas para índices numéricos, gerando um dicionário de mapeamento para uso posterior na visualização.  

3. Pré-processamento dos Dados:  
– Normalização: Cada coluna é convertida para float, dividida pelo seu valor máximo e um ruído (10⁻⁶) é adicionado para evitar zeros.  
– Centralização (opcional): Existe a possibilidade de traduzir os dados para o centro de cada faixa (subtraindo a média)  
– opção que pode ser ativada conforme a análise desejada.  
– Discretização: Como alternativa, os dados podem ser discretizados em 10 categorias (0 a 9) usando pd.cut.  
– Um parâmetro permite escolher se a análise subsequente usará a versão normalizada (possivelmente centralizada) ou a discretizada.  

4. Resampling (Bootstrap):  
– Realiza a geração de múltiplas amostras (bootstrap) do DataFrame processado (o original mais 22 amostras) para avaliar a estabilidade dos agrupamentos.  

5. Armazenamento dos Dados Resampleados:  
– Cada amostra é salva em uma estrutura de pastas organizada (nomeada de acordo com o conjunto escolhido), possibilitando rastreabilidade e reprodutibilidade.  

6. Cálculo e Salvamento das Matrizes de Distância:  
– Para cada amostra, as distâncias (por exemplo, Euclidianas) são calculadas entre as colunas (após transposição) e normalizadas, sendo somente a parte triangular superior salva em arquivos CSV.  
– Essa matriz servirá de base para a construção de árvores filogenéticas.  

7. Execução do DAMICORE para Construção de Árvores Filogenéticas:  
– O pipeline invoca o DAMICORE (após instalar e localizar o pacote e suas dependências) para gerar árvores filogenéticas a partir dos dados resampleados.  
– Os parâmetros passados (por exemplo, “--normalize-weights” e “--compressor gzip”) são configuráveis e refletem as variações comentadas no script original.  

8. Coleta e Visualização das Árvores:  
– Os arquivos Newick gerados são coletados e, com o uso de toytree e toyplot, o pipeline gera visualizações (como árvores de consenso e “cloud trees”).  
– Nessa etapa, os rótulos numéricos são convertidos de volta para os nomes originais (usando o dicionário criado anteriormente), facilitando a interpretação.  

9. Análise de Redes Bayesianas:  
– O pipeline executa uma análise de rede bayesiana a partir de um arquivo CSV (cujo caminho é configurável), utilizando o pyAgrum com discretização por quantile e o método de Chow‑Liu (com correções MIIC e NML).  
– Essa análise serve para modelar as dependências condicionais entre as variáveis e pode, inclusive, ser usada para validar os agrupamentos identificados na etapa de árvore filogenética.  

10. Cálculo de Medidas Cophenéticas e Clustering:  
– Usando o pacote ete3, o pipeline calcula duas matrizes a partir da árvore de consenso:  
• Uma matriz cophenética (que reflete o tempo evolutivo dos ramos)  
• Uma matriz topológica (usando apenas a estrutura da árvore)  
– Essas medidas, além de validar a qualidade da árvore, podem ser utilizadas para detectar clades e comparar os agrupamentos com os resultados da rede bayesiana.  
– É possível escolher (por parâmetro) se a análise usará a abordagem topológica ou a evolutiva.  

11. Organização e Limpeza:  
– Embora comandos de limpeza estejam comentados, o pipeline está organizado para que os resultados (matrizes de distância, árvores, imagens da BN, arquivos CSV de medidas cophenéticas, etc.) sejam salvos em diretórios estruturados, garantindo reprodutibilidade e rastreabilidade.  

