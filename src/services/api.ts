import axios from 'axios';
import { ILGDMatch, ILGDLevel, MatchRequestItem } from '../types';

// Use the environment variable for the API base URL.
// Defaults to the local server if the variable is not set.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const api = axios.create({
  baseURL,
});

/**
 * Fetches the list of all administrative levels (State, District, etc.)
 */
export const getLevels = async (): Promise<ILGDLevel[]> => {
  const response = await api.get('/levels');
  return response.data;
};

/**
 * Sends a batch of entities to the backend for matching.
 */
export const getBatchedMatches = async (
  items: MatchRequestItem[],
  asOfDate?: string
): Promise<ILGDMatch[][]> => {
  const payload = {
    items,
    as_of_date: asOfDate,
  };
  const response = await api.post('/match/entity', payload);
  return response.data;
};

/**
 * Submits a new community-suggested name variation for an entity.
 */
export const addVariation = async (
  variation: string,
  entityCode: number,
  email: string
): Promise<any> => {
  const payload = {
    variation,
    entity_code: entityCode,
    email,
  };
  const response = await api.post('/add/variation', payload);
  return response.data;
};

/**
 * NEW: Submits a user's manual correction to the backend.
 * @param originalName - The original, unmapped name from the user's data.
 * @param correctedEntityCode - The LGD code of the entity the user selected as the correct match.
 * @param email - The email of the user providing the correction.
 */
export const addCorrection = async (
    originalName: string,
    correctedEntityCode: number,
    email: string
): Promise<any> => {
    const payload = {
        original_name: originalName,
        corrected_entity_code: correctedEntityCode,
        email,
    };
    const response = await api.post('/correction/add', payload);
    return response.data;
};

/**
 * NEW: Fetches the direct children of a given LGD entity.
 */
export const getChildren = async (entityCode: number): Promise<ILGDMatch[]> => {
    const response = await api.get(`/entity/${entityCode}/children`);
    return response.data;
};

/**
 * NEW: Fetches the siblings of a given LGD entity.
 */
export const getSiblings = async (entityCode: number): Promise<ILGDMatch[]> => {
    const response = await api.get(`/entity/${entityCode}/siblings`);
    return response.data;
};

export default api;