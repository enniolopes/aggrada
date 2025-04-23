import pandas as pd
import logging
from src.utils.logger import get_logger

logger = get_logger()

def read_csv_to_json(file_path):
    try:
        df = pd.read_csv(file_path)
        return df.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error reading CSV file at {file_path}: {e}")
        raise
