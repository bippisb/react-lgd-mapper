/**
 * WHAT CHANGED:
 * - This file is simplified to align with the new backend API response.
 * - ILGDMatch now includes the crucial 'confidence_score' and 'match_type'.
 * - It expects 'entity_code' as the stable identifier from the backend.
 * - Removed obsolete interfaces related to the old client-side graph.
 */

export interface ILGDLevel {
    id: number;
    name: string;
    code: number;
}

export interface ILGDMatch {
    entity_code: number;
    name: string;
    level_id: number;
    level?: string; // Sometimes provided for convenience
    parents?: ILGDMatch[]; // The backend can still provide parent context if needed
    
    // Core new fields from the backend's matching engine
    confidence_score: number;
    match_type: 'exact' | 'fuzzy' | 'variation';
}

// Defines the shape of an item sent to the backend for matching
export interface MatchRequestItem {
    name: string;
    level_id?: number;
    parent_entity_code?: number;
}