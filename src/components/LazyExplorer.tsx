import { FC, useMemo, useState } from "react";
import { getRootNodes } from "../services/graph";
import type { ExplorerProps } from "./Explorer";

export const LazyExplorer: FC<ExplorerProps> = ({ graph, setActiveNode }) => {
    const rootNodes = useMemo(() => getRootNodes(graph), [graph]);
    return (
        <div>
            <hr className="border-gray-600 border-1 my-1" />
            <div className="">
                {
                    rootNodes.map(node => (
                        <LazyExplorerItem
                            node={node}
                            setActiveNode={setActiveNode}
                            graph={graph}
                            key={node}
                        />
                    ))
                }
            </div>
        </div>
    )
}


interface LazyExplorerItemProps extends ExplorerProps {
    node: string;
}

export const LazyExplorerItem: FC<LazyExplorerItemProps> = ({
    node,
    graph,
    setActiveNode
}) => {
    const [open, setOpen] = useState(false);
    const attrs = useMemo(() => graph.getNodeAttributes(node), [node, graph]);
    const neighbors = useMemo(() => graph.outNeighbors(node), [node, graph]);

    const handleClick = () => {
        console.log(attrs);
        setActiveNode(node);
    }

    return (
        <div className="px-2 border-b-2 border-l-2 border-r-2 border-gray-500 border-dotted border-opacity-50">
            <div className="flex justify-between">
                <span onClick={handleClick} className={attrs?.match ? "" : "text-rose-500"}>
                    {Boolean(attrs.title) ? attrs.title : "<NA>"}
                </span>
                <div>
                    {attrs?.matches?.length > 1 &&
                        (
                            <span className="align middle border-[1px] border-blue-400 bg-blue-100 rounded-lg text-xs p-[2px] text-blue-600">{attrs.matches.length}</span>
                        )
                    }
                    {attrs?.unmatchedChildren > 0 &&
                        (
                            <span className="align-middle border-[1px] rounded-lg bg-rose-100 border-rose-400 text-xs p-[2px] text-rose-600">{String(attrs?.unmatchedChildren).padStart(2, "0")}</span>
                        )
                    }

                    {neighbors.length > 0 && (
                        <button onClick={() => setOpen(state => !state)}>
                            {open ? "^" : ">"}
                        </button>
                    )}
                </div>
            </div>
            {
                open && neighbors.length > 0 && (
                    neighbors.map(neighbor => (
                        <LazyExplorerItem
                            node={neighbor}
                            setActiveNode={setActiveNode}
                            graph={graph}
                            key={neighbor}
                        />
                    ))
                )
            }
        </div>
    )
}