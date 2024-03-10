declare global {
    var dfd: any;
}

export {}

export interface LGDNodeAttributes {
    level_id: number;
    title: string;
    code?: string;
    match?:ILGDMatch;
    matches?: ILGDMatch[];
}

export interface ILGDMatch {
    code: number; // entity's LGD code
    id: number; // entity id
    name: string; // entity name
    level_id: number; // level id
    level: string; // level name
    parents?: ILGDMatch[];
}

export interface ILGDLevel {
    name: string;
    id: number;
}

export type LevelName = "india" | "state" | "district" | "sub_district" | "block" | "panchayat";

export interface MatchItem {
    name: string;
    level?: LevelName;
    parent_id?: number;
}
