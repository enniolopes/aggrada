from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

Base = declarative_base()

class AggRaDaSpatial(Base):
    __tablename__ = 'AggRaDaSpatial'

    id = Column(Integer, primary_key=True, index=True)
    place_name = Column(String, nullable=True)
    place_code = Column(String, nullable=True)
    geometry = Column(Geometry('MULTIPOLYGON', srid=4326), nullable=False)
    start_date = Column(Date, nullable=False)
    
    # Relationships
    aggRaDaObservation = relationship("AggRaDaObservation", back_populates="aggRaDaSpatial")

# class AggRaDaEntity(Base):
#     __tablename__ = 'aggrada_entities'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     entity_name = Column(String, nullable=False)
#     entity_type = Column(String)
#     metadata = Column(JSONB)

# class AggRaDaObservation(Base):
#     __tablename__ = 'aggrada_observations'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     aggrada_spatial_id = Column(Integer, nullable=False)
#     entity_id = Column(Integer)
#     temporal_range = Column(TSRANGE, nullable=False)
#     data = Column(JSONB, nullable=False)









