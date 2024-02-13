import { DirectedGraph } from "graphology";
import { FC } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch";
import { getParentNodeId } from "../services/lgd";
import { MatchesTableView } from "./MatchesTableView";
import MatchListItem from "./MatchListItem";

interface EntityViewProps {
  setGraph: (g: DirectedGraph) => void;
  graph: DirectedGraph;
  node: string;
}

export const EntityView: FC<EntityViewProps> = ({ node, graph, setGraph }) => {
  const attrs = graph.getNodeAttributes(node);
  const parent_id = getParentNodeId(node, graph);

  const setMatch = (match: ILGDMatch) => {
    graph.mergeNodeAttributes(node, {
      match,
    });
    setGraph(graph.copy());
  };

  return (
    <div>
      <h4 className="px-2">
        {attrs.title} <strong>{attrs.level_name}</strong>
      </h4>
      <h5 className="p-2">Matches</h5>
      <MatchesTableView
        matches={attrs.matches}
        node={node}
        onSelect={setMatch}
      />
      <GetLGDMatchComponent
        title={attrs.title}
        level={attrs.level_name}
        parent_id={parent_id}
        onSelect={setMatch}
      />
      {/* <hr className="border border-b-2 border-gray-700" /> */}
      <div className="mt-2">
        <h5 className="ml-2 underline">Final Match</h5>
        {attrs?.match && <MatchListItem match={attrs.match} />}
      </div>

      {/* <pre>{JSON.stringify(attrs?.match, null, 2)}</pre> */}
    </div>
  );
};
