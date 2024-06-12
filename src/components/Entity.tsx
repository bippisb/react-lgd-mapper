import { DirectedGraph } from "graphology";
import { FC, useMemo } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch";
import { getParentNodeId, remapEntities } from "../services/lgd";
import MatchListItem from "./MatchListItem";
import { AddVariation } from "./AddVariation";

interface EntityViewProps {
  setGraph: (g: DirectedGraph) => void;
  graph: DirectedGraph;
  node: string;
}

export const EntityView: FC<EntityViewProps> = ({ node, graph, setGraph }) => {
  const attrs = useMemo(() => graph.getNodeAttributes(node), [graph, node]);
  const parent_id = useMemo(() => getParentNodeId(node, graph), [graph, node]);

  const setMatch = async (match: ILGDMatch | undefined) => {
    graph.mergeNodeAttributes(node, {
      match,
    });

    graph = await remapEntities(graph, node);

    // update unmatched entities count
    let parent = graph.inNeighbors(node)[0]
    do {
      if (parent) {
        let unmatchedChildren = graph.getNodeAttribute(parent, "unmatchedChildren");
        graph.mergeNodeAttributes(parent, {
          unmatchedChildren: unmatchedChildren - 1,
        });
        parent = graph.inNeighbors(parent)[0];
      }
    } while (parent);

    setGraph(graph.copy());
  };


  return (
    <div className="p-2 h-[95vh] overflow-auto">
      <h4 className="flex items-center gap-2 mb-1">
        <span className="italic text-gray-600">{attrs.level_name}</span>
        <span className="font-bold text-gray-800">{attrs.title}</span>
      </h4>

      <GetLGDMatchComponent
        title={attrs.title}
        level={attrs.level_name}
        parent_id={parent_id}
        onSelect={setMatch}
        match={attrs?.match}
        matches={attrs?.matches}
      />
      {attrs?.match && (
        <div className="bg-gray-800 rounded-md shadow-md p-2 mt-1">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-xs text-gray-400">Final Match</h5>
            <button
              className="px-3 py-1 bg-amaranth-stronger text-white font-semibold rounded-sm shadow-md hover:bg-amaranth-strongest transition-colors duration-200"
              onClick={() => setMatch(undefined)}
            >
              x
            </button>
          </div>
          <div className="">
            <MatchListItem match={attrs.match} />
            <div className="p-1"></div>
            <AddVariation
              node={node}
              entity_id={attrs.match.id}
              variation={attrs.title}
            />
          </div>
        </div>
      )}
    </div>
  );
};
