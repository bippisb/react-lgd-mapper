/**
 * WHAT THIS FILE DOES:
 * - Renders the expandable tree view of the LGD hierarchy on the left side of the main view.
 * - It uses recursion to render nodes and their children.
 *
 * WHAT CHANGED:
 * - The import for 'getRootNodes' is updated. It no longer points to the deleted 'graph.ts'
 *   but to our new, consolidated 'graph-builder.ts' service file.
 */
import { FC, useMemo, useState } from "react";
// CORRECTED IMPORT PATH
import { getRootNodes } from "../services/graph-builder.ts";
import type { DirectedGraph } from "graphology";

// Defining props locally to make the component self-contained
interface ExplorerProps {
    graph: DirectedGraph;
    setActiveNode: (node: string) => void;
}

export const LazyExplorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
    // Memoize the root nodes so this isn't recalculated on every render
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

    return (
        <div className="border-b border-gray-700 last:border-none">
            <div className="flex justify-between items-center py-2">
                <span
                    onClick={handleClick}
                    className={`cursor-pointer ${
                        attrs?.match ? "text-green-300" : "text-amber-400"
                    }`}
                >
                    {attrs.title || "<NA>"}
                </span>
                <div className="flex items-center">
                    {attrs?.matches?.length > 1 && !attrs.match && (
                        <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full" title="Multiple possible matches found">
                            {attrs.matches.length}
                        </span>
                    )}
                    
                    {/* This can be uncommented once child-counting logic is re-implemented */}
                    {/* {attrs?.unmatchedChildren > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-rose-600 bg-rose-100 rounded-full">
                            {String(attrs?.unmatchedChildren).padStart(2, "0")}
                        </span>
                    )} */}

                    {neighbors.length > 0 && (
                        <button
                            onClick={() => setOpen((state) => !state)}
                            className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
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