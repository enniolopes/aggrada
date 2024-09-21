from sqlalchemy.orm import Session
from src.core.db_setup import get_db
from src.core.aggrada_models import AggRaDaSpatial
from .ibge_api import get_city_map

def save_city_map_to_db(city_id: str, year: str, db: Session):
    # Fetch the GeoJSON from IBGE API
    geojson_data = get_city_map(city_id, year)
    
    # Extract geometry and place_code
    for feature in geojson_data['features']:
        geometry = feature['geometry']
        place_code = feature['properties']['codarea']
        
        # Create new spatial data
        spatial_data = AggRaDaSpatial(
            place_name="",
            place_code=place_code,
            geometry=geometry,  # This will be inserted as GeoJSON
            start_date=f"{year}-01-01"  # Example start date based on year
        )
        
        db.add(spatial_data)
    db.commit()

# Example usage
def main():
    city_id = "3304557"  # Example: Rio de Janeiro
    year = "2022"
    
    # Get DB session and save map
    with next(get_db()) as db:
        save_city_map_to_db(city_id, year, db)

if __name__ == "__main__":
    main()
