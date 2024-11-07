# Aggrada Outsource Data Ingestion

## Docker Config

Build the image:

```bash
docker build -t aggrada-outsource .
```

Run the container:

```bash
docker run -it aggrada-outsource
```

Run ingestion data from outsources manually: If you want to run the ingestion script, you can do so directly in the container:

```bash
docker exec -it <container-id> pnpm run ingest:ibgeAllCities 2022 2021
```

## Data Outsource References

IBGE API Doc:

- https://servicodados.ibge.gov.br/api/v1/localidades

Setores censitários:

- https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/26565-malhas-de-setores-censitarios-divisoes-intramunicipais.html
