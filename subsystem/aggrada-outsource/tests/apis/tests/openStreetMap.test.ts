import axios from 'axios';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('openStreetMap API', () => {
  it('should return valid data for a given address using latlong API', async () => {
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const params = {
      q: 'Rua Doutor Antônio dos Santos Galante, 435, São José do Rio Preto, SP, Brazil',
      format: 'json',
      limit: '1',
      addressdetails: '1',
    };

    const response = await axios.get(baseUrl, {
      params,
      headers: {
        'User-Agent': 'aggrada-outsource/1.0 (aggrada@gmail.com)',
      },
      timeout: 10000,
    });

    const expected = {
      place_id: expect.any(Number),
      osm_type: expect.any(String),
      osm_id: expect.any(Number),
      lat: expect.any(String),
      lon: expect.any(String),
      display_name: expect.any(String),
      address: expect.any(Object),
      boundingbox: expect.any(Array),
    };

    expect(response.status).toBe(200);
    expect(response.data[0]).toMatchObject(expected);

    // Wait for 1.1 seconds before making the next API call
    await sleep(1100);
  });
});
