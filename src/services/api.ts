/**
 * WHAT THIS FILE DOES:
 * - Acts as the sole data layer for the frontend.
 * - All communication with the backend API is defined here.
 * - It uses the VITE_API_BASE_URL from the .env.local file to know where to send requests.
 *
 * WHAT CHANGED:
 * - Completely rewritten to remove all client-side logic (DuckDB, etc.).
 * - Implements functions that directly correspond to our new FastAPI endpoints.
 * - Uses 'axios' for making clean, typed HTTP requests.
 */

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
 * This is the primary workhorse function for the mapping process.
 * @param items - An array of entities to match.
 * @param asOfDate - An optional date for performing a temporal query.
 * @returns A promise that resolves to a 2D array of matches.
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
 * @param variation - The suggested name.
 * @param entityCode - The LGD code of the entity.
 * @param email - The email of the proposer.
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

export default api;