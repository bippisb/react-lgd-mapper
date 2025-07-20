/**
 * WHAT THIS FILE DOES:
 * - Contains the core business logic for the entire hierarchical mapping process.
 * - It orchestrates multiple API calls in the correct sequence.
 * - This keeps the main App.tsx component clean and focused on UI state.
 */
import { toast } from "react-toastify";
import { Hierarchy } from "../components/SelectColumnHierarchy";
import { getBatchedMatches } from "./api.ts";
import { ILGDMatch, MatchRequestItem } from "../types";

/**
 * The main function to run the entire mapping process.
 * @param rawData The user's original data from the uploaded file.
 * @param hierarchy The hierarchy defined by the user.
 * @returns A promise that resolves to the consolidated data ready for graph building.
 */
export const runHierarchicalMapping = async (rawData: any[], hierarchy: Hierarchy) => {
    // Step 1: Get a unique list of entities to map.
    // This prevents sending the same state/district combination to the API hundreds of times.
    const uniqueEntities = new Map<string, any>();
    const hierarchyColumns = Object.keys(hierarchy);
    rawData.forEach(row => {
        const key = hierarchyColumns.map(col => row[col]).join('|');
        if (!uniqueEntities.has(key)) {
            uniqueEntities.set(key, row);
        }
    });
    const uniqueData = Array.from(uniqueEntities.values());

    // Step 2: Match level by level, starting from the top.
    const orderedLevels = Object.entries(hierarchy).sort(([, a], [, b]) => a.code - b.code);
    let levelMatchResults = new Map<string, ILGDMatch[]>();
    const parentCodeCache = new Map<string, number>();

    for (const [colName, levelInfo] of orderedLevels) {
        toast.info(`Matching ${levelInfo.name}s...`);

        const requestItems: MatchRequestItem[] = uniqueData.map(row => {
            const entityName = row[colName];
            let parentCode: number | undefined = undefined;

            // Find the parent's LGD code from the previous level's results.
            if (levelInfo.code > 1) { // Not a state
                const parentLevel = orderedLevels[levelInfo.code - 2];
                if (parentLevel) {
                    const parentColName = parentLevel[0];
                    const parentEntityName = row[parentColName];
                    parentCode = parentCodeCache.get(parentEntityName);
                }
            }

            return {
                name: entityName,
                level_id: levelInfo.id,
                parent_entity_code: parentCode,
            };
        });

        const results = await getBatchedMatches(requestItems);

        // Cache the results for the next level to use.
        results.forEach((matchList, index) => {
            const entityName = uniqueData[index][colName];
            levelMatchResults.set(`${levelInfo.name}|${entityName}`, matchList);
            if (matchList.length > 0) {
                // Cache the best match's code for child lookups.
                parentCodeCache.set(entityName, matchList[0].entity_code);
            }
        });
    }

    return { uniqueData, levelMatchResults };
};