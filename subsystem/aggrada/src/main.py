import json
from src.core.db_setup import SessionLocal
from src.core.logger import get_logger
from src.ingestion.file_reader import read_csv_to_json
from src.ingestion.indexer import create_spatial, create_entity, create_observations
from subsystem.aggrada.src.ingestion.handle_payload import process_payload
from src.GeoStandard.polygon_loader import ingest_standard_polygons

# logger = get_logger()

def main(payload):
    # 1. Process the input payload
    # logger.info("Processing payload...")
    file_path, entity_attr, time_range_attr, space_attr, fixed_entity, fixed_time_range, fixed_space = process_payload(payload)

    # 2. Read the file (e.g., CSV)
    # logger.info(f"Reading file: {file_path}")
    data = read_csv_to_json(file_path)
    
    # 3. Get the database session
    db_session = SessionLocal()

    try:
        # 4. Ingest standard polygons (optional, if provided in payload)
        if 'use_standard_polygons' in payload and payload['use_standard_polygons']:
            # logger.info("Ingesting standard polygons...")
            ingest_standard_polygons(db_session)
        
        # 5. Create spatial index if necessary
        # logger.info("Creating spatial index...")
        spatial_id = create_spatial(db_session, fixed_space)
        
        # 6. Create entity index if necessary
        # logger.info("Creating entity index...")
        entity_id = create_entity(db_session, fixed_entity)
        
        # 7. Process and save the observations
        # logger.info("Saving observations...")
        create_observations(data, db_session, entity_id, spatial_id, fixed_time_range)

    except Exception as e:
        # logger.error(f"Error processing data: {e}")
        db_session.rollback()
    finally:
        db_session.close()

if __name__ == "__main__":
    # Sample payload for testing
    sample_payload = {
        "file_path": "/path/to/data.csv",
        "entity_attr": "entity_column",
        "time_range_attr": ["start_time", "end_time"],
        "space_attr": "spatial_column",
        "fixed_entity": {"entity_name": "Example Entity", "entity_type": "Organization"},
        "fixed_time_range": {"start": "2022-01-01", "end": "2022-12-31"},
        "fixed_space": {"place_name": "São José do Rio Preto", "place_code": "3549805", "geometry": "POLYGON(...)"},
        "use_standard_polygons": True  # Optional flag to ingest standard polygons
    }

    # Run the main function
    main(sample_payload)
