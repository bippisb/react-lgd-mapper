import { DirectedGraph } from "graphology";
import { FC, ReactNode } from "react";
import { getRootNodes } from "../services/graph";

interface ExplorerProps {
    graph: DirectedGraph;
}

export const Explorer: FC<ExplorerProps> = ({ graph }) => {
    const renderNodes = (node: string): JSX.Element => {
        let neighbors: any = graph.outNeighbors(node);
        neighbors = neighbors.map((neighbor) => renderNodes(neighbor));

        return (
            <ExplorerItem title={node} key={node}>
                {neighbors}
            </ExplorerItem>
        );
    };

    const rootNodes = getRootNodes(graph);
    return (
        <div>
            {rootNodes.map(root => renderNodes(root))}
        </div>
    )
}


interface ExplorerItemProps {
    title: string;
    children?: ReactNode[];
}
export const ExplorerItem: FC<ExplorerItemProps> = ({ title, children }) => {
    if (children?.length === 0) {
        return <div>{title}</div>
    }

    return (
        <details>
            <summary>{title}</summary>
            {children}
        </details>
    )
}