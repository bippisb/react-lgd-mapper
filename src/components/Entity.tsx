import { DirectedGraph } from "graphology";
import { FC, useMemo, useState, useEffect } from "react"; // Import useEffect
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch.tsx";
import MatchListItem from "./MatchListItem.tsx";
import { AddVariation } from "./AddVariation.tsx";
import { addCorrection, getChildren, getSiblings } from "../services/api"; // Import new functions
import { toast } from "react-toastify";
import { Accordion } from "./Accordion.tsx"; // Re-enable Accordion
import { MatchesTableView } from "./MatchesTableView.tsx"; // Re-enable for context view


interface EntityViewProps {
  setGraph: (g: DirectedGraph) => void;
  graph: DirectedGraph;
  node: string;
}

export const EntityView: FC<EntityViewProps> = ({ node, graph, setGraph }) => {
  const attrs = useMemo(() => graph.getNodeAttributes(node), [graph, node]);
  const [proposerEmail, setProposerEmail] = useState("");
  // NEW state for contextual data
  const [children, setChildren] = useState<ILGDMatch[]>([]);
  const [siblings, setSiblings] = useState<ILGDMatch[]>([]);

  const parentNodeId = graph.inNeighbors(node)[0];
  const parentAttrs = parentNodeId ? graph.getNodeAttributes(parentNodeId) : undefined;
  const parent_entity_code = parentAttrs?.match?.entity_code;

  // NEW: Effect to fetch children and siblings when a match is confirmed
  useEffect(() => {
    const fetchContextData = async () => {
      if (attrs?.match?.entity_code) {
        try {
          const childrenData = await getChildren(attrs.match.entity_code);
          const siblingsData = await getSiblings(attrs.match.entity_code);
          setChildren(childrenData);
          setSiblings(siblingsData);
        } catch (error) {
          console.error("Failed to fetch context data:", error);
          toast.error("Could not load children/siblings.");
        }
      } else {
        // Clear data if match is removed
        setChildren([]);
        setSiblings([]);
      }
    };
    fetchContextData();
  }, [attrs?.match]); // Re-run whenever the match object changes

  const setMatch = async (match: ILGDMatch | undefined) => {
    if (match && !attrs.match) {
        if (!proposerEmail) {
            toast.warn("Please provide an email to submit your correction.");
            return;
        }
        try {
            const response = await addCorrection(attrs.title, match.entity_code, proposerEmail);
            toast.success(response.message);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Could not log correction.";
            toast.error(errorMessage);
        }
    }
    graph.mergeNodeAttributes(node, { match });
    setGraph(graph.copy());
  };

  return (
    <div className="p-2 h-[95vh] overflow-auto">
      <h4 className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
        <span className="italic text-gray-600 capitalize">{attrs.level_name.replace("_", " ")}</span>
        <span className="font-bold text-lg text-gray-800">{attrs.title}</span>
      </h4>

      <GetLGDMatchComponent
        title={attrs.title}
        level_name={attrs.level_name}
        parent_entity_code={parent_entity_code}
        onSelect={setMatch}
        currentMatch={attrs?.match}
        initialMatches={attrs?.matches}
      />

      {attrs?.match ? (
        <div className="bg-green-100 border border-green-400 rounded-md shadow-md p-2 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-sm font-bold text-green-800">Confirmed Match</h5>
            <button
              className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-sm hover:bg-red-700"
              onClick={() => setMatch(undefined)}
            >
              Clear
            </button>
          </div>
          <div>
            <MatchListItem match={attrs.match} />
            <div className="p-1"></div>
            <AddVariation
              entity_code={attrs.match.entity_code}
              current_name={attrs.title}
            />
          </div>
          {/* NEW: Display context data */}
          <div className="mt-2">
            {siblings.length > 0 && (
              <Accordion title={`Siblings (${siblings.length})`}>
                <MatchesTableView matches={siblings} className="flex flex-col gap-1 p-1" />
              </Accordion>
            )}
            {children.length > 0 && (
              <Accordion title={`Children (${children.length})`}>
                <MatchesTableView matches={children} className="flex flex-col gap-1 p-1" />
              </Accordion>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2 bg-gray-700 rounded-md shadow-md mt-4">
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-300 mb-1">
                Your Email (for submitting corrections)
            </label>
            <input
                id="email-input"
                className="w-full px-4 py-2 bg-gray-600 text-gray-200 rounded-md"
                placeholder="researcher@example.com"
                value={proposerEmail}
                onChange={(e) => setProposerEmail(e.target.value)}
                type="email"
            />
        </div>
      )}
    </div>
  );
};