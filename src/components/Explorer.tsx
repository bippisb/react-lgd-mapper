import { DirectedGraph } from "graphology";
import { FC, ReactNode } from "react";
import { getRootNodes } from "../services/graph";
import { LGDNodeAttributes } from "../types";

interface ExplorerProps {
  graph: DirectedGraph;
  setActiveNode: (node: string) => void;
}


export const Explorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
  const renderNodes = (node: string): JSX.Element => {
    let neighbors: any = graph.outNeighbors(node);
    neighbors = neighbors.map((neighbor) => renderNodes(neighbor));

    return (
      <ExplorerItem
        onClick={() => setActiveNode(node)}
        attrs={graph.getNodeAttributes(node)}
        key={node}
      >
        {neighbors}
      </ExplorerItem>
    );
  };
        
  const rootNodes = getRootNodes(graph);
  return (
    <div>
        <div>
            {"(matches) [number of unmatched children]"}
        </div>
        <div>
        {rootNodes.map(root => renderNodes(root))}
        </div>
    </div>
  )
};

interface ExplorerItemProps {
  onClick: () => void;
  attrs: LGDNodeAttributes;
  children?: ReactNode[];
}
export const ExplorerItem: FC<ExplorerItemProps> = ({
  onClick,
  attrs,
  children,
}) => {
  const hasMatches = !!attrs?.matches;
  //   const matches = attrs?.matches;
  const numMatches = hasMatches ? attrs.matches.length : 0;

  const getMatchColor = (numMatches: number): string => {
    if (numMatches === 0) {
      return "blue";
    } else if (numMatches === 1) {
      return "red";
    } else {
      return "green";
    }
  }
  
  const renderText = (
    <span>
      {attrs.title}
      {hasMatches && (
        <span style={{ color: getMatchColor(numMatches) }}>({numMatches})</span>
      )}
      <span>{attrs?.unmatchedChildren ? `[${attrs.unmatchedChildren}]` : "" }</span>
    </span>
  );


  if (children?.length === 0) {
    return (
      <div className="ml-4" onClick={onClick}>
        {renderText}
      </div>
    );
  }

  return (
    <details className="ml-4 border-b-1 border-gray-600">
      <summary onClick={onClick}>{renderText}</summary>
      {children}
    </details>
  );
};
