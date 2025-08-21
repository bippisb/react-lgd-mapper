import { FC, useMemo, useState } from "react";
import { getRootNodes } from "../services/graph-builder.ts";
import type { DirectedGraph } from "graphology";
import { ILGDMatch } from "../types";

interface ExplorerProps {
    graph: DirectedGraph;
    setActiveNode: (node: string) => void;
}

export const LazyExplorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
    const rootNodes = useMemo(() => getRootNodes(graph), [graph]);

    return (
        <div className="bg-gray-800 text-gray-100 rounded-md shadow-md h-[90vh] overflow-auto">
            <div className="px-4 py-2">
                {rootNodes.map((node) => (
                    <LazyExplorerItem
                        node={node}
                        setActiveNode={setActiveNode}
                        graph={graph}
                        key={node}
                    />
                ))}
            </div>
        </div>
    );
};

// --- Child Component for a single tree item ---

interface LazyExplorerItemProps extends ExplorerProps {
    node: string;
}

// NEW: Helper function to determine text color based on match confidence
const getConfidenceColor = (match?: ILGDMatch): string => {
    if (!match) return "text-red-400"; // Unmatched
    if (match.confidence_score > 0.9) return "text-green-300"; // High confidence
    if (match.confidence_score > 0.7) return "text-yellow-300"; // Medium confidence
    return "text-orange-400"; // Low confidence
};


export const LazyExplorerItem: FC<LazyExplorerItemProps> = ({
    node,
    graph,
    setActiveNode,
}) => {
    const [open, setOpen] = useState(false);
    const attrs = useMemo(() => graph.getNodeAttributes(node), [node, graph]);
    const neighbors = useMemo(() => graph.outNeighbors(node), [node, graph]);

    const handleClick = () => {
        setActiveNode(node);
    };

    const textColor = getConfidenceColor(attrs?.match);
    const matchTypeText = attrs?.match ? `${(attrs.match.confidence_score * 100).toFixed(0)}%` : "Unmatched";


    return (
        <div className="border-b border-gray-700 last:border-none">
            <div className="flex justify-between items-center py-2">
                <span
                    onClick={handleClick}
                    className={`cursor-pointer font-medium ${textColor}`}
                >
                    {attrs.title || "<NA>"}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono p-1 rounded ${textColor} bg-black bg-opacity-20`}>
                        {matchTypeText}
                    </span>

                    {attrs?.matches?.length > 1 && !attrs.match && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full" title="Multiple possible matches found">
                            {attrs.matches.length}
                        </span>
                    )}

                    {neighbors.length > 0 && (
                        <button
                            onClick={() => setOpen((state) => !state)}
                            className="text-gray-400 hover:text-gray-200"
                        >
                            {open ? "▼" : "▶"}
                        </button>
                    )}
                </div>
            </div>
            {open && neighbors.length > 0 && (
                <div className="pl-4 border-l-2 border-gray-600">
                    {neighbors.map((neighbor) => (
                        <LazyExplorerItem
                            node={neighbor}
                            setActiveNode={setActiveNode}
                            graph={graph}
                            key={neighbor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};