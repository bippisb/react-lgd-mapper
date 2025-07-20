/**
 * WHAT THIS FILE DOES:
 * - Contains the logic to build the visual 'graphology' graph after the
 *   API call has returned with the match results.
 * - This separates the complex graph logic from the main App component.
 */
import { DirectedGraph } from 'graphology';
import { Hierarchy } from '../components/SelectColumnHierarchy'; // Assuming this type export
import { ILGDMatch } from '../types';

/**
 * Creates a unique node ID for the graph from a row of data and the hierarchy level.
 */
// const createNodeId = (row: any, hierarchy: Hierarchy, levelName: string): string => {
//   const colName = Object.keys(hierarchy).find(k => hierarchy[k].name === levelName);
//   if (!colName) return '';
//   const value = row[colName];
//   // Ensure the value is not null or undefined before creating an ID
//   return value ? `${levelName}|${value}` : '';
// };

export const getRootNodes = (graph: DirectedGraph): string[] => {
    return graph.filterNodes(node => graph.inDegree(node) === 0);
};

/**
 * Builds the visual graph by combining the user's original data with the match results from the API.
 * @param rawData - The user's original data, parsed from the uploaded file.
 * @param matchResults - The 2D array of matches returned from the backend.
 * @param hierarchy - The user-defined hierarchy mapping columns to levels.
 */
export const buildGraphFromMappingResults = (
    uniqueData: any[],
    levelMatchResults: Map<string, ILGDMatch[]>,
    hierarchy: Hierarchy
): DirectedGraph => {
  const graph = new DirectedGraph();
  const orderedLevels = Object.entries(hierarchy).sort(([, a], [, b]) => a.code - b.code);

  uniqueData.forEach(row => {
    let parentNodeId: string | null = null;
    
    orderedLevels.forEach(([colName, levelInfo]) => {
      const entityName = row[colName];
      if (!entityName) return;

      const nodeId = `${levelInfo.name}|${entityName}`;
      
      // If node already exists, just handle the edge creation.
      if (graph.hasNode(nodeId)) {
        if (parentNodeId) graph.mergeEdge(parentNodeId, nodeId);
        parentNodeId = nodeId;
        return;
      }
      
      const matches = levelMatchResults.get(nodeId) || [];
      const bestMatch = matches.find(m => m.match_type === 'exact') || (matches.length > 0 ? matches[0] : undefined);
      
      graph.addNode(nodeId, {
        title: entityName,
        level_name: levelInfo.name,
        matches: matches,
        match: bestMatch,
      });
      
      if (parentNodeId) {
        graph.mergeEdge(parentNodeId, nodeId);
      }
      parentNodeId = nodeId;
    });
  });

  return graph;
};