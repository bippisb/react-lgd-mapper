import { FC, useMemo, useState } from "react";
import { getRootNodes } from "../services/graph";
import type { ExplorerProps } from "./Explorer";

export const LazyExplorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
    const rootNodes = useMemo(() => getRootNodes(graph), [graph]);
    return (
        <div className="bg-gray-800 text-gray-100 rounded-md shadow-md  h-[90vh] overflow-auto">
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
        console.log(attrs);
        // @ts-ignore
        window.sg = graph.subgraph;
        setActiveNode(node);
    };

    return (
        <div className="border-b border-gray-700 last:border-none ">
            <div className="flex justify-between items-center py-2">
                <span
                    onClick={handleClick}
                    className={`cursor-pointer ${
                        attrs?.match ? "" : "text-rose-500"
                    }`}
                >
                    {Boolean(attrs.title) ? attrs.title : "<NA>"}
                </span>
                <div className="flex items-center">
                    {attrs?.matches?.length > 1 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full">
                            {attrs.matches.length}
                        </span>
                    )}
                    {attrs?.unmatchedChildren > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-rose-600 bg-rose-100 rounded-full">
                            {String(attrs?.unmatchedChildren).padStart(2, "0")}
                        </span>
                    )}

                    {neighbors.length > 0 && (
                        <button
                            onClick={() => setOpen((state) => !state)}
                            className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                        >
                            {open ? "^" : ">"}
                        </button>
                    )}
                </div>
            </div>
            {open && neighbors.length > 0 && (
                <div className="pl-4">
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