import { DirectedGraph } from "graphology";
import { FC } from "react";
import { ILGDMatch } from "../types";
import { GetLGDMatchComponent } from "./GetLGDMatch";
import { getParentNodeId } from "../services/lgd";

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
            <h4>{attrs.title} <strong>{attrs.level_name}</strong></h4>
            <h5>Matches</h5>
            <MatchesTableView matches={attrs.matches} node={node} onSelect={setMatch} />
            <GetLGDMatchComponent title={attrs.title} level={attrs.level_name} parent_id={parent_id} onSelect={setMatch}/>
            <h5>Final Match</h5>
            <pre>
                {JSON.stringify(attrs?.match, null, 2)}
            </pre>
        </div>
    )
}

interface MatchesTableViewProps {
    matches: ILGDMatch[];
    node: string;
    onSelect: (m: ILGDMatch) => void;
}

export const MatchesTableView: FC<MatchesTableViewProps> = ({ matches, node, onSelect }) => (
    <div className="flex flex-col border border-slate-400">
        <div className="grid grid-cols-6 bg-gray-300">
            <span></span>
            <span>Enitity Name</span>
            <span>Enitity Id</span>
            <span>LGD Code</span>
            <span>Level Name</span>
            <span>Level Id</span>
        </div>
        {
            matches.map(m => (
                <div key={m.id} className="grid grid-cols-6 broder-slate-200 border p-1" onClick={() => onSelect(m)}>
                    <input type="radio" name={node} value={m.id}></input>
                    <div>{m.name}</div>
                    <div>{m.id}</div>
                    <div>{m.code}</div>
                    <div>{m.level}</div>
                    <div>{m.level_id}</div>
                </div>

            ))
        }
    </div>
)