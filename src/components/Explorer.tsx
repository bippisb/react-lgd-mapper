import { DirectedGraph } from "graphology";
import { FC, ReactNode, useEffect } from "react";
import { getRootNodes } from "../services/graph";
import { LGDNodeAttributes } from "../types";

export interface ExplorerProps {
  graph: DirectedGraph;
  setActiveNode: (node: string) => void;
}

export const Explorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
  const renderNodes = (node: string): JSX.Element => {
    let neighbors: any = graph.outNeighbors(node);
    neighbors = neighbors.map((neighbor: string) => renderNodes(neighbor));

    return (
      <ExplorerItem
        onClick={() => setActiveNode(node)}
        attrs={graph.getNodeAttributes(node) as LGDNodeAttributes}
        key={node}
      >
        {neighbors}
      </ExplorerItem>
    );
  };

  const rootNodes = getRootNodes(graph);

  useEffect(() => {
    console.log("rendering graph")
  }, [graph])
  return (
    <div>
      <div>{"(matches) [number of unmatched children]"}</div>
      <div>{rootNodes.map((root) => renderNodes(root))}</div>
    </div>
  );
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
  const numMatches = !!attrs?.matches ? attrs?.matches?.length : 0;

  const getMatchColor = (numMatches: number): string => {
    if (numMatches === 0) {
      return "inline-flex items-center justify-center w-5 h-5 text-sm text-blue-500 bg-blue-100 border border-blue-500 rounded-full mx-1";
    } else if (numMatches === 1) {
      return "inline-flex items-center justify-center w-5 h-5 text-sm text-red-500 bg-red-100 border border-red-500 rounded-full mx-1";
    } else {
      return "inline-flex items-center justify-center w-5 h-5 text-sm text-green-500 bg-green-100 border border-green-500 rounded-full mx-1";
    }
  };

  const renderText = (
    <span>
      {attrs.title}
      {!!attrs?.matches && attrs.matches.length > 1 && (
        <span className={getMatchColor(numMatches)}>{numMatches}</span>
      )}
      {attrs?.unmatchedChildren && attrs.unmatchedChildren > 0 && (
        <span className={getMatchColor(attrs?.unmatchedChildren || 0)}>
          {attrs.unmatchedChildren}
        </span>
      )
      }
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
    <details className="ml-4 border-b-[1px] border-gray-500">
      <summary className="" onClick={onClick}>
        {renderText}
      </summary>
      {children}
    </details>
  );
};
