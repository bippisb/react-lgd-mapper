import { toast } from "react-toastify";
import { Hierarchy } from "../components/SelectColumnHierarchy";
import { getBatchedMatches } from "./api.ts";
import { ILGDMatch, MatchRequestItem } from "../types";

/**
 * Orchestrates the entire hierarchical mapping process.
 */
export const runHierarchicalMapping = async (rawData: any[], hierarchy: Hierarchy) => {
    const uniqueEntities = new Map<string, any>();
    const hierarchyColumns = Object.keys(hierarchy);
    rawData.forEach(row => {
        const key = hierarchyColumns.map(col => row[col]).join('|');
        if (!uniqueEntities.has(key)) {
            uniqueEntities.set(key, row);
        }
    });
    const uniqueData = Array.from(uniqueEntities.values());

    const orderedLevels = Object.entries(hierarchy).sort(([, a], [, b]) => a.code - b.code);
    let levelMatchResults = new Map<string, ILGDMatch[]>();
    const parentCodeCache = new Map<string, number>();

    // MODIFIED: Switched to a .forEach loop to get the current index
    for (const [index, [colName, levelInfo]] of orderedLevels.entries()) {
        toast.info(`Matching ${levelInfo.name}s...`);
        const requestItems: MatchRequestItem[] = uniqueData.map(row => {
            const entityName = row[colName];
            let parentCode: number | undefined = undefined;

            // --- CORRECTED LOGIC ---
            // Find the parent's LGD code by looking at the previous level in the sorted array.
            // This is robust and works for any combination of levels.
            if (index > 0) { // If this is not the first (top) level...
                const parentLevel = orderedLevels[index - 1]; // The parent is the previous item.
                if (parentLevel) {
                    const parentColName = parentLevel[0];
                    const parentEntityName = row[parentColName];
                    parentCode = parentCodeCache.get(parentEntityName);
                }
            }
            // --- END OF CORRECTION ---

            return {
                name: entityName,
                level_id: levelInfo.id,
                parent_entity_code: parentCode,
            };
        });

        const results = await getBatchedMatches(requestItems);

        results.forEach((matchList, resultIndex) => {
            const entityName = uniqueData[resultIndex][colName];
            levelMatchResults.set(`${levelInfo.name}|${entityName}`, matchList);
            if (matchList.length > 0) {
                parentCodeCache.set(entityName, matchList[0].entity_code);
            }
        });
    }

    return { uniqueData, levelMatchResults };
};