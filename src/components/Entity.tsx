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

  return (
    <div>
      <h4 className="px-2">
        {attrs.title} <strong>{attrs.level_name}</strong>
      </h4>
      <h5 className="p-2">Matches</h5>
      <MatchesTableView matches={attrs.matches} node={node} />
      <GetLGDMatchComponent
        title={attrs.title}
        level={attrs.level_name}
        parent_id={parent_id}
      />
      <h5>Final Match</h5>
      <pre>{JSON.stringify(attrs?.match, null, 2)}</pre>
    </div>
  );
};

interface MatchesTableViewProps {
  matches: ILGDMatch[];
  node: string;
}

export const MatchesTableView: FC<MatchesTableViewProps> = ({
  matches,
  node,
}) => (
  <div>
    {/*     <div className="grid grid-cols-6 bg-gray-300">
      <span></span>
      <span>Enitity Name</span>
      <span>Enitity Id</span>
      <span>LGD Code</span>
      <span>Level Name</span>
      <span>Level Id</span>
    </div> */}
    {matches.map((m) => (
      <div key={m.id} className="border-gray-300 border-2 p-1 rounded-lg">
        {/* <input type="radio" name={node} value={m.id}></input>
        <div>{m.name}</div>
        <div>{m.id}</div>
        <div>{m.code}</div>
        <div>{m.level}</div>
        <div>{m.level_id}</div> */}

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
    ))}
  </div>
);
