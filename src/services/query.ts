import Fuse, { IFuseOptions } from "fuse.js";
import { getDuckDB } from "./duckdb"
import { lookUpCommunityReportedVariation } from "../api";
import { castPossibleBigIntToNumber } from "./utils";
import { toast } from "react-toastify";

const runQuery = async (q: string) => {
    const db = await getDuckDB();
    const c = await db.connect();
    const t = await c.query(q);
    c.close();
    return t.toArray().map((a: any) => a.toJSON());
}

export const getExactMatch = async (name: string, levelId: BigInt | number | null = null, parentId: BigInt | number | null = null) => {
    name = name.trim().toLowerCase();
    const q = `
    SELECT entity.id, entity.name, entity.code, entity.level_id, 'exact' AS match_type
    FROM entity 
    ${parentId !== null ? "JOIN adminhierarchy ON adminhierarchy.child_id = entity.id" : ""}
    WHERE entity.name = $$${name}$$
    ${levelId !== null ? `AND entity.level_id = ${levelId.toString()}` : ""}
    ${parentId !== null ? `AND adminhierarchy.entity_id = ${parentId.toString()}` : ""}
    `
    
    const results = await runQuery(q);
    return results;
}

export const getLevels = async () => {
    const q = `SELECT * FROM level;`
    const results = await runQuery(q);
    return results.filter((l: any) => l.name !== "india");
}

export const getMatchesUsingVariations = async (name: string, levelId: BigInt | number | null = null, parentId: BigInt | number | null = null, useCommunityVariations = false) => {
    name = name.trim().toLowerCase();
    const buildQuery = (table: "variation" | "discoveredvariation") => `
    SELECT DISTINCT entity.id, entity.name, entity.code, entity.level_id, '${table}' as match_type
    FROM ${table}
    JOIN entity ON entity.id = ${table}.entity_id
    ${parentId !== null ? "JOIN adminhierarchy ON adminhierarchy.child_id = entity.id" : ""}
    WHERE ${table}.name = $$${name}$$
    ${levelId !== null ? `AND entity.level_id = ${levelId.toString()}` : ""}
    ${parentId !== null ? `AND adminhierarchy.entity_id = ${parentId.toString()}` : ""}
    `

    let results = await runQuery(buildQuery("variation"));
    if (!useCommunityVariations) {
        return results;
    }

    if (results.length > 0) {
        return results;
    }

    results = await runQuery(buildQuery("discoveredvariation"));
    return results;
}

export const getParents = async (entityId: BigInt | number) => {
    const q = `
    WITH RECURSIVE cte AS (
        SELECT ah.*
        FROM adminhierarchy ah
        WHERE ah.child_id = ${entityId}
        UNION ALL
        SELECT ah.*
        FROM adminhierarchy ah
        INNER JOIN cte ON ah.child_id = cte.entity_id
    )
    SELECT e.*
    FROM entity e
    WHERE e.id IN (SELECT entity_id FROM cte);
    `
    const results = await runQuery(q);
    return results;
}

export const getImmediateChildren = async (entityId: BigInt | number) => {
    const q = `
    SELECT DISTINCT e.*
    FROM entity e
    INNER JOIN adminhierarchy ah ON e.id = ah.child_id
    WHERE ah.entity_id = ${entityId.toString()};
    `
    const results = await runQuery(q);
    return results;
}

export const getEntitySiblings = async (entityId: BigInt | number) => {
    const q = `
    WITH parent AS (
        SELECT entity_id
        FROM adminhierarchy
        WHERE child_id = ${entityId.toString()}
    )
    SELECT DISTINCT e.*
    FROM entity e
    INNER JOIN adminhierarchy ah ON e.id = ah.child_id
    INNER JOIN parent p ON ah.entity_id = p.entity_id
    WHERE e.id != ${entityId.toString()};
    `;
    
    const results = await runQuery(q);
    return results;
}

export const getFuzzyMatches = async (name: string, parentId: BigInt | number) => {
    name = name.trim().toLowerCase().replace("&", "and");
    const children = await getImmediateChildren(parentId);

    const fuse_options: IFuseOptions<any> = {
        includeScore: true,
        keys: ["name"],
        threshold: 0.5,
        ignoreLocation: true,
    }
    const fuse = new Fuse(children, fuse_options);
    let results = fuse.search(name);
    results = results.map(v => ({
        ...v["item"],
        score: v.score,
        refIndex: v.refIndex,
        match_type: "fuzzy",
    }))
    console.log("fuzzy", name, results, children);
    return results;
}

export const getMatches = async (name: string, levelId: BigInt | number | null = null, parentId: BigInt | number | null = null, withParents = false, useCommunityVariations = false) => {
    const prepResponse = async (matches: any[]) => {
        return await Promise.all(matches.map(async (r) => {
            if (withParents) {
                const parents = await getParents(r.id)
                r["parents"] = parents;
            }
            return r
        }))
    }
    try {
        name = name.trim().toLowerCase();
        let matches = await getExactMatch(name, levelId, parentId);
        if (matches.length > 0) {
            return await prepResponse(matches);
        }
    
        matches = await getMatchesUsingVariations(name, levelId, parentId, useCommunityVariations)
        if (matches.length > 0) {
            return await prepResponse(matches);
        }
    
        matches = await lookUpCommunityReportedVariation(name, castPossibleBigIntToNumber(levelId), castPossibleBigIntToNumber(parentId));
        if (matches.length) {
            return await prepResponse(matches);
        }
        if (parentId === null) {
            return [];
        }
    
        matches = await getFuzzyMatches(name, parentId);
        return await prepResponse(matches);        
    } catch (error) {
        toast.error("Error looking up matches for " + name);
        console.error(error);
        return [];
    }
    }

export const getBatchedMatches = async (payload: any[]) => {
    return await Promise.all(payload.map(v => {
        return getMatches(v.name, v.level_id, v.parent_id)
    }))
}

