import requests

IBGE_API_MUNICIPIOS_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"

def get_cities_metadata():
    response = requests.get(IBGE_API_MUNICIPIOS_URL)
    if response.status_code == 200:
        response_data = response.json()
        transformed_data = [transform_city_metadata(data) for data in response_data]
        return transformed_data
    else:
        raise Exception("Failed to fetch municipalities from IBGE API.")

def transform_city_metadata(data):
    return {
        "id": data["id"],
        "nome": data["nome"],
        "microrregiao_id": data["microrregiao"]["id"],
        "microrregiao_nome": data["microrregiao"]["nome"],
        "mesorregiao_id": data["microrregiao"]["mesorregiao"]["id"],
        "mesorregiao_nome": data["microrregiao"]["mesorregiao"]["nome"],
        "uf_id": data["microrregiao"]["mesorregiao"]["UF"]["id"],
        "uf_sigla": data["microrregiao"]["mesorregiao"]["UF"]["sigla"],
        "uf_nome": data["microrregiao"]["mesorregiao"]["UF"]["nome"],
        "regiao_id": data["microrregiao"]["mesorregiao"]["UF"]["regiao"]["id"],
        "regiao_sigla": data["microrregiao"]["mesorregiao"]["UF"]["regiao"]["sigla"],
        "regiao_nome": data["microrregiao"]["mesorregiao"]["UF"]["regiao"]["nome"],
        "regiao_imediata_id": data["regiao-imediata"]["id"],
        "regiao_imediata_nome": data["regiao-imediata"]["nome"],
        "regiao_intermediaria_id": data["regiao-imediata"]["regiao-intermediaria"]["id"],
        "regiao_intermediaria_nome": data["regiao-imediata"]["regiao-intermediaria"]["nome"],
    }
