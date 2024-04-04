import { DirectedGraph } from "graphology";
import { FC } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch";
import { getParentNodeId } from "../services/lgd";
import MatchListItem from "./MatchListItem";
import { AddVariation } from "./AddVariation";

interface EntityViewProps {
  setGraph: (g: DirectedGraph) => void;
  graph: DirectedGraph;
  node: string;
}

export const EntityView: FC<EntityViewProps> = ({ node, graph, setGraph }) => {
  const attrs = graph.getNodeAttributes(node);
  const parent_id = getParentNodeId(node, graph);
  
  const isMatched = !!attrs?.match;

  const setMatch = (match: ILGDMatch | undefined) => {
    graph.mergeNodeAttributes(node, {
      match,
    });

    if (!isMatched) {
      // update unmatched entities count
      let parent = graph.inNeighbors(node)[0]
      do {
        let unmatchedChildren = graph.getNodeAttribute(parent, "unmatchedChildren");
        graph.mergeNodeAttributes(parent, {
          unmatchedChildren: unmatchedChildren - 1,
        });

        parent = graph.inNeighbors(parent)[0];
      } while (parent);
    }

    setGraph(graph.copy());
  };


  return (
    <div>
      <h4 className="px-2 flex gap-2">
         <span className="italic">{attrs.level_name}</span>
        <span className="font-bold">{attrs.title}</span>
      </h4>
      <GetLGDMatchComponent
        title={attrs.title}
        level={attrs.level_name}
        parent_id={parent_id}
        onSelect={setMatch}
        match={attrs?.match}
        matches={attrs?.matches}
      />
      {
        attrs?.match && (
          <>
            <hr className="border border-b-2 border-gray-700 my-2" />
            <h5 className="text-xs flex justify-between">
              <span className="pl-1">Final Match</span>
              <button
                className="px-3 font-semibold text-sm bg-red-300 text-red-800 border border-slate-300 shadow-sm align-middle hover:bg-red-400 hover:text-red-900"
                onClick={() => setMatch(undefined)}
              >
                x
              </button>
            </h5>
            <div className="border-2 border-stone-400 border-opacity-40">

              <MatchListItem match={attrs.match} />
              <AddVariation node={node} entity_id={attrs.match.id} variation={attrs.title} />
            </div>
          </>
        )
      }
    </div>
  );
};
