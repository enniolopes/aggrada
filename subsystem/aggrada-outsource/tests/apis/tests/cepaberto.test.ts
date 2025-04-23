import axios from 'axios';

const API_TOKEN = '8cbac120c4ead2039aae60a0f41a8080'; // enniolopes@usp.br
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('cepaberto API', () => {
  it('should return valid data for a given cep', async () => {
    const cepNumber = '13563665';
    const url = `https://www.cepaberto.com/api/v3/cep?cep=${cepNumber}`;
    const headers = { Authorization: `Token token=${API_TOKEN}` };

    const response = await axios.get(url, { headers, timeout: 10000 });
    
    const expected = {
      altitude: expect.any(Number),
      cep: expect.any(String),
      latitude: expect.any(String),
      longitude: expect.any(String),
      logradouro: expect.any(String),
      bairro: expect.any(String),
      cidade: { ddd: expect.any(Number), ibge: expect.any(String), nome: expect.any(String) },
      estado: { sigla: expect.any(String) }
    };

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(expected);

    // Wait 1.1 second before next request
    await sleep(1100);
  });

  it('should return valid data for a given address', async () => {
    const url = 'https://www.cepaberto.com/api/v3/address';
    const headers = { Authorization: `Token token=${API_TOKEN}` };
    const params = {
      estado: 'SP',
      cidade: 'São Carlos',
      bairro: 'Jardim Ipanema',
      logradouro: 'Rua Vereador Lucas Perroni Júnior',
    };

    const response = await axios.get(url, { headers, params, timeout: 10000 });

    const expected = {
      altitude: expect.any(Number),
      cep: expect.any(String),
      latitude: expect.any(String),
      longitude: expect.any(String),
      logradouro: expect.any(String),
      bairro: expect.any(String),
      cidade: { ddd: expect.any(Number), ibge: expect.any(String), nome: expect.any(String) },
      estado: { sigla: expect.any(String) }
    };

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(expected);

    // Wait 1.1 second before next request
    await sleep(1100);
  });
});
