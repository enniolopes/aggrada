from sqlalchemy.orm import Session
from src.models.aggrada_models import AggRaDaSpatial, AggRaDaEntity, AggRaDaObservation
import json
import logging
from src.utils.logger import get_logger

logger = get_logger()

def create_spatial(session: Session, fixed_space: dict):
    try:
        spatial_entry = AggRaDaSpatial(
            place_name=fixed_space['place_name'],
            place_code=fixed_space['place_code'],
            geometry=fixed_space['geometry'],
            start_date=fixed_space['start_date']
        )
        session.add(spatial_entry)
        session.commit()
        return spatial_entry.id
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating spatial entry: {e}")
        raise

def create_entity(session: Session, fixed_entity: dict):
    try:
        entity_entry = AggRaDaEntity(
            entity_name=fixed_entity['entity_name'], 
            entity_type=fixed_entity['entity_type']
        )
        session.add(entity_entry)
        session.commit()
        return entity_entry.id
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating entity: {e}")
        raise

def create_temporal_range(fixed_time_range: dict):
    return f"[{fixed_time_range['start']}, {fixed_time_range['end']}]"

def create_observations(data, session: Session, entity_id: int, spatial_id: int, fixed_time_range: dict):
    temporal_range = create_temporal_range(fixed_time_range)
    
    try:
        for observation in data:
            observation_entry = AggRaDaObservation(
                aggrada_spatial_id=spatial_id,
                entity_id=entity_id,
                temporal_range=temporal_range,
                data=json.dumps(observation)
            )
            session.add(observation_entry)
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Error saving observations: {e}")
        raise
