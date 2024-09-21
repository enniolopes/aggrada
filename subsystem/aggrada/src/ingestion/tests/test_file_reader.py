import pytest
from src.ingestion.file_reader import read_csv_to_json

def test_read_csv_to_json_valid_file():
    data = read_csv_to_json("tests/test_data/sample.csv")
    assert len(data) > 0
    assert isinstance(data, list)

def test_read_csv_to_json_invalid_file():
    with pytest.raises(FileNotFoundError):
        read_csv_to_json("tests/test_data/invalid.csv")
