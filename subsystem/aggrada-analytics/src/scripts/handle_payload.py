from typing import TypedDict, Optional, Dict

class TimeRange(TypedDict):
    start: str
    end: str

class SpaceStandard(TypedDict):
    label: str
    value: str

class Payload(TypedDict):
    file_path: str
    entity_attr: Optional[str]
    time_attr: Optional[TimeRange]
    space_attr: Optional[str]
    fixed_entity: Optional[str]
    fixed_time_range: Optional[TimeRange]
    fixed_space: Optional[SpaceStandard]

def process_payload(payload: Payload) -> Payload:
    return {
        'file_path': payload['file_path'],
        'entity_attr': payload.get('entity_attr'),
        'time_start_attr': payload.get('time_start_attr'),
        'time_end_attr': payload.get('time_end_attr'),
        'space_attr': payload.get('space_attr'),
        'fixed_entity': payload.get('fixed_entity'),
        'fixed_time_range': payload.get('fixed_time_range'),
        'fixed_space': payload.get('fixed_space'),
    }
