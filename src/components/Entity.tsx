import { DirectedGraph } from "graphology";
import { FC } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch";
import { getParentNodeId } from "../services/lgd";
import { List, ListItem, Radio, Typography } from "@material-tailwind/react";

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
        match
    })
    setGraph(graph.copy())
  }

  return (
    <div>
      <h4 className="px-2">
        {attrs.title} <strong>{attrs.level_name}</strong>
      </h4>
      <h5 className="p-2">Matches</h5>
      <MatchesTableView matches={attrs.matches} node={node}  onSelect={setMatch}/>
      <GetLGDMatchComponent
        title={attrs.title}
        level={attrs.level_name}
        parent_id={parent_id}
        onSelect={setMatch}
      />
      <h5>Final Match</h5>
      <pre>{JSON.stringify(attrs?.match, null, 2)}</pre>
    </div>
  );
};


interface MatchesTableViewProps {
    matches: ILGDMatch[];
    node: string;
    onSelect: (m: ILGDMatch) => void;
}


export const MatchesTableView: FC<MatchesTableViewProps> = ({ matches, node, onSelect }) => (
    <div className="flex flex-col border border-slate-400">
        {
            matches.map(m => (
              <div key={m.id} className="border-gray-300 border-2 p-1 rounded-lg" onClick={() => onSelect(m)}>
                <Radio
                  label={
                    <Typography
                      className="uppercase font-extrabold ml-3 "
                      placeholder={undefined}
                    >
                      {" "}
                      {m.name}
                    </Typography>
                  }
                  crossOrigin={undefined}
                  className="checked:accent-gray-500"
                />
                <div className="ml-6 -mt-2">
                  <List className="block" placeholder={undefined}>
                    <ListItem placeholder={undefined}>Enitity Id - {m.id}</ListItem>
                    <ListItem placeholder={undefined}>LGD Code - {m.code}</ListItem>
                    <ListItem placeholder={undefined}>Level Name - {m.level}</ListItem>
                    <ListItem placeholder={undefined}>Level Id - {m.level_id}</ListItem>
                  </List>
                </div>

              </div>
            )
          )
      }
  </div>
);
