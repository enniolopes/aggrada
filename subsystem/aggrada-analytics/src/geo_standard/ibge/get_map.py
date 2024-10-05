# IBGE API documentation: https://servicodados.ibge.gov.br/api/docs/malhas?versao=3#api-_
from typing import TypedDict
import requests

# Function to make a request to the IBGE API and obtain the polygons in GeoJSON format for a given year
class CityMapInput(TypedDict):
    city_id: str
    year: str

def get_city_map(input: CityMapInput):
    url = f"https://servicodados.ibge.gov.br/api/v3/malhas/municipios/{input['city_id']}"
    params = {
        "periodo": input['year'],
        "formato": "application/vnd.geo+json",
        "qualidade": "maxima",
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro ao acessar a API do IBGE: {response.status_code}")

