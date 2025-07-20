/**
 * WHAT THIS FILE DOES:
 * - Renders the detailed view for a single, selected node from the explorer tree.
 * - Displays the list of potential matches for that entity.
 * - Allows the user to confirm a final match, which updates the graph's state.
 * - Allows the user to clear a confirmed match.
 * - Provides the interface to suggest a new name variation for a matched entity.
 *
 * WHAT CHANGED:
 * - Completely rewritten to remove all dependencies on the deleted 'query.ts' and 'lgd.ts' files.
 * - The logic to get children and siblings of a matched entity is currently commented out,
 *   as this would require new, specific endpoints on our backend. This can be a future enhancement.
 * - The 'setMatch' function is updated to handle the new `ILGDMatch` structure. It no longer
 *   needs to perform complex remapping, as the core matching is done. It simply updates the
 *   node's attributes in the graph.
 * - The props are updated to align with the new data structures (e.g., using 'parent_entity_code').
 */

import { DirectedGraph } from "graphology";
import { FC, useMemo } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch.tsx";
import MatchListItem from "./MatchListItem.tsx";
import { AddVariation } from "./AddVariation.tsx";
// import { Accordion } from "./Accordion.tsx"; // Keep if you plan to re-add children/siblings
// import { MatchesTableView } from "./MatchesTableView.tsx"; // Keep for Accordion

interface EntityViewProps {
  setGraph: (g: DirectedGraph) => void;
  graph: DirectedGraph;
  node: string;
}

export const EntityView: FC<EntityViewProps> = ({ node, graph, setGraph }) => {
  // Memoize attributes for performance. This recalculates only when the node or graph changes.
  const attrs = useMemo(() => graph.getNodeAttributes(node), [graph, node]);
  
  // Find the parent node in the graph to get its code for context-based searches
  const parentNodeId = graph.inNeighbors(node)[0];
  const parentAttrs = parentNodeId ? graph.getNodeAttributes(parentNodeId) : undefined;
  const parent_entity_code = parentAttrs?.match?.entity_code;

  /**
   * This function is called when a user selects a match from the list.
   * It updates the graph state with the chosen match.
   */
  const setMatch = (match: ILGDMatch | undefined) => {
    // Merge the new match information into the node's attributes.
    // If 'match' is undefined, it effectively clears the current match.
    graph.mergeNodeAttributes(node, {
      match,
      // If a match is selected, also update the 'matches' list to reflect this choice.
      // This is useful for highlighting the selected item in the UI.
      matches: match ? [match, ...(attrs.matches || []).filter(m => m.entity_code !== match.entity_code)] : attrs.matches
    });

    // We create a copy of the graph to trigger React's change detection,
    // which causes the UI to re-render with the new data.
    setGraph(graph.copy());
  };

  return (
    <div className="p-2 h-[95vh] overflow-auto">
      {/* Display the title and level of the selected entity */}
      <h4 className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
        <span className="italic text-gray-600 capitalize">{attrs.level_name.replace("_", " ")}</span>
        <span className="font-bold text-lg text-gray-800">{attrs.title}</span>
      </h4>

      {/* The component for manually searching for a match */}
      <GetLGDMatchComponent
        title={attrs.title}
        level_name={attrs.level_name}
        parent_entity_code={parent_entity_code}
        onSelect={setMatch}
        currentMatch={attrs?.match}
        initialMatches={attrs?.matches}
      />

      {/* If a final match has been selected, display it clearly */}
      {attrs?.match && (
        <div className="bg-green-100 border border-green-400 rounded-md shadow-md p-2 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-sm font-bold text-green-800">Confirmed Match</h5>
            {/* "Clear" button to un-match the entity */}
            <button
              className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-sm shadow-md hover:bg-red-700 transition-colors duration-200"
              onClick={() => setMatch(undefined)}
              title="Clear this match"
            >
              Clear
            </button>
          </div>
          <div className="">
            {/* Display the confirmed match details */}
            <MatchListItem match={attrs.match} />
            <div className="p-1"></div>
            {/* Show the component for adding a community variation */}
            <AddVariation
              entity_code={attrs.match.entity_code}
              current_name={attrs.title}
            />
          </div>
        </div>
      )}

      {/* 
        NOTE: The logic for displaying children and siblings from an external API
        has been commented out as it requires new backend endpoints. This can be
        added back as a future feature.
      */}
      
    </div>
  );
};