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
    code: BigInt; // entity's LGD code
    id: BigInt; // entity id
    name: string; // entity name
    level_id: BigInt; // level id
    level: string; // level name
    parents?: ILGDMatch[];
    match_type?: string;
}

export interface ILGDLevel {
    name: string;
    id: BigInt;
}

export type LevelName = "india" | "state" | "district" | "sub_district" | "block" | "panchayat";

export interface MatchItem {
    name: string;
    level?: LevelName;
    parent_id?: number;
}
