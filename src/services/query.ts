import Fuse, { IFuseOptions } from "fuse.js";
import { getDuckDB } from "./duckdb"

const runQuery = async (q: string) => {
    const db = await getDuckDB();
    const c = await db.connect();
    const t = await c.query(q);
    c.close();
    return t.toArray().map((a: any) => a.toJSON());
}

export const getExactMatch = async (name: string, levelId: BigInt | null = null, parentId: BigInt | null = null) => {
    name = name.trim().toLowerCase();
    const q = `
    SELECT entity.id, entity.name, entity.code, entity.level_id, 'exact' AS match_type
    FROM entity 
    ${parentId !== null ? "JOIN adminhierarchy ON adminhierarchy.child_id = entity.id" : ""}
    WHERE entity.name = '${name}'
    ${levelId !== null ? `AND entity.level_id = ${levelId.toString()}` : ""}
    ${parentId !== null ? `AND adminhierarchy.entity_id = ${parentId.toString()}` : ""}
    `

    const results = await runQuery(q);
    return results;
}

export const getLevels = async () => {
    const q = `SELECT * FROM level;`
    const results = await runQuery(q);
    return results.filter(l => l.name !== "india");
}

export const getMatchesUsingVariations = async (name: string, levelId: BigInt | null = null, parentId: BigInt | null = null, useCommunityVariations = false) => {
    name = name.trim().toLowerCase();
    const buildQuery = (table: "variation" | "discoveredvariation") => `
    SELECT DISTINCT entity.id, entity.name, entity.code, entity.level_id, '${table}' as match_type
    FROM ${table}
    JOIN entity ON entity.id = ${table}.entity_id
    ${parentId !== null ? "JOIN adminhierarchy ON adminhierarchy.child_id = entity.id" : ""}
    WHERE ${table}.name = '${name}'
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

export const getParents = async (entityId: BigInt) => {
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

export const getImmediateChildren = async (entityId: BigInt) => {
    const q = `
    SELECT DISTINCT e.*
    FROM entity e
    INNER JOIN adminhierarchy ah ON e.id = ah.child_id
    WHERE ah.entity_id = ${entityId.toString()};
    `
    const results = await runQuery(q);
    return results;
}

export const getFuzzyMatches = async (name: string, parentId: BigInt) => {
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

export const getMatches = async (name: string, levelId: BigInt | null = null, parentId: BigInt | null = null, withParents = false, useCommunityVariations = false) => {
    const prepResponse = (matches: any[]) => {
        return matches.map((r) => {
            if (withParents) {
                r["parents"] = getParents(r.id);
            }
            return r
        })
    }

    name = name.trim().toLowerCase();
    let matches = await getExactMatch(name, levelId, parentId);
    if (matches.length > 0) {
        return prepResponse(matches);
    }
    
    matches = await getMatchesUsingVariations(name, levelId, parentId, useCommunityVariations)
    if (matches.length > 0 || parentId === null) {
        return prepResponse(matches);
    }

    matches = await getFuzzyMatches(name, parentId);
    return matches;
}

export const getBatchedMatches = async (payload: any[]) => {
    return await Promise.all(payload.map(v => {
        return getMatches(v.name, v.level_id, v.parent_id)
    }))
}

