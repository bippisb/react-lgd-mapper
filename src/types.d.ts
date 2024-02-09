declare global {
    var dfd: any;
}

export {}

export interface LGDNodeAttributes {
    level_id: number;
    title: string;
    code?: string;
}

export interface ILGDMatch {
    code: number; // entity's LGD code
    id: number; // entity id
    name: string; // entity name
    level_id: number; // level id
    level: string; // level name
}

export interface ILGDLevel {
    name: string;
    id: number;
}