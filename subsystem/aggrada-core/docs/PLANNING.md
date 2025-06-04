
- Definir automático formato do arquivo
- Definir automático delimiter em caso de CSV
- Definir se dado geográfico ou observação
- Transformar em output padrão -> estruturar GeoJSON (Spatial) e JSON (Observation)
- Encontrar automaticamente dados (fields) nas observações para indexação espacial e temporal
- Criar automaticamente indexação temporal
- Criar automaticamente indexação espacial

- Pensar em rotina para criar e definir os vizinhos
- Como tratar dados que não possuem georreferenciamento, como o endereço (seria um ponto ou uma área do imóvel), e locais padrões como municipios e estados
- Como tratar locais personalizados que não são padrões (o endereço, municipio, etc)

## Aggrada Core:
- ler qualquer tipo de arquivo e estruturar em JSON ou GeoJSON
- aceitar entrada de dados em buffer ou cache, como retorno de APIs
- identificar automaticamente campos espaciais e temporais para os arquivos lidos
- indexar por tempo e espaço qualquer tipo de arquivo
- fazer logs das etapas para auditoria