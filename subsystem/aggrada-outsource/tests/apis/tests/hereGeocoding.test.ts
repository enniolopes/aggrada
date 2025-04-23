import { hereLatLongFromAddress } from '../../../src/sources/hereGeocoding'; 
// import axios from 'axios';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('HERE Geocode API', () => {
  it('should return valid data for a given address using hereLatLongFromAddress', async () => {
    const address = 'Rua Doutor Antônio dos Santos Galante, 435, São José do Rio Preto, SP, Brazil';
    
    const result = await hereLatLongFromAddress({ fullAddress: address });
    
    const expected = {
      geoCode: expect.any(String),
      adminLevel: 'latlong',
      source: 'hereapi',
      startDate: expect.any(Date),
      properties: expect.objectContaining({
        apiUrl: expect.any(String),
      }),
      rawGeometry: {
        type: 'Point',
        coordinates: expect.arrayContaining([expect.any(Number), expect.any(Number)]),
      },
      rawSrid: '4326',
    };
    
    expect(result).toMatchObject(expected);
  });
});
