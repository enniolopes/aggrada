## READ CITIES METADATA
# from ibge.get_metadata import get_cities_metadata
# def main():
#     cities_metadata = get_cities_metadata()
#     for city_metadata in cities_metadata[:2]:
#         print(city_metadata)

# if __name__ == "__main__":
#     main()

## READ CITY MAP
from ibge.get_map import get_city_map
sample_input = {
    "city_id": "1100015",
    "year": "2022",
}

def main():
    city_map = get_city_map(sample_input)
    print(city_map)

if __name__ == "__main__":
    main()
