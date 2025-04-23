/* eslint-disable no-console */
import 'dotenv/config';

import { Spatial } from '../../Models';
import { Point } from 'geojson';
import { transformer } from '../../../../aggrada-core/src';
import axios from 'axios';

const API_KEY = process.env.API_HERE_APIKEY;

interface HereGeocodeResponse {
  items: GeocodeItem[];
}

interface GeocodeItem {
  title: string;
  id: string;
  resultType: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    stateCode: string;
    state: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
  };
  position: {
    lat: number;
    lng: number;
  };
  mapView: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  scoring: {
    queryScore: number;
    fieldScore: {
      city: number;
      streets: number[];
    };
  };
}

export const hereLatLongFromAddress = async ({
  fullAddress,
  placeNumber,
  street,
  city,
  state,
  country,
  postalcode,
  countrycodes,
}: {
  fullAddress: string; // Free text search query (required)
  placeNumber?: string; // House number
  street?: string; // Street name and house number
  city?: string; // City name
  state?: string; // State name
  country?: string; // Country name
  postalcode?: string;
  countrycodes?: string; // ISO 3166-1 alpha-2 country codes (e.g., BR, US)
}): Promise<Spatial | null> => {
  const endpoint = 'https://geocode.search.hereapi.com/v1/geocode';

  // Monta o valor do parâmetro qq com os dados estruturados, se disponíveis.
  const qqValue = fullAddress;
  // if (placeNumber) qqValue += `houseNumber=${structuredData.houseNumber};`;
  // if (street) qqValue += `street=${structuredData.street};`;
  // if (city) qqValue += `city=${structuredData.city};`;
  // if (state) qqValue += `state=${structuredData.state};`;
  // if (country) qqValue += `country=${structuredData.country};`;

  try {
    const params = {
      q: fullAddress,
      // qq: qqValue, // Dados estruturados
      apiKey: API_KEY,
    };

    const response = await axios.get(endpoint, {
      params,
    });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const result: HereGeocodeResponse = response.data;
      const bestResult = result.items[0];

      const point: Point = {
        type: 'Point',
        coordinates: [bestResult.position.lng, bestResult.position.lat],
        // bbox: result.boundingbox.map(Number),
      };

      return {
        geoCode: `${point.coordinates[0]}#${point.coordinates[1]}`,
        adminLevel: 'latlong',
        source: 'hereapi',
        startDate: new Date(1900, 0, 1),
        properties: {
          apiUrl: `${endpoint}?${new URLSearchParams({q:params.q}).toString()}`,
          ...transformer.flattenObject({ obj: bestResult }),
        },
        rawGeometry: point,
        rawSrid: '4326',
      };
    } else {
      throw new Error('Nenhum resultado de geocodificação foi encontrado.');
    }
  } catch (error) {
    console.error('Erro ao obter coordenadas:', error);
    throw error;
  }
}
