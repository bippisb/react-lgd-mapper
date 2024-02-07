import { DirectedGraph } from "graphology";
import { getMatches } from "../api";


const getParentNode = (node: string, graph: DirectedGraph) => {
    const parentNodes = graph.inNeighbors(node);
    if (parentNodes.length === 0) {
        return null;
    }
    if (parentNodes.length > 1) {
        throw Error("Nodes are only allowed to have a single parent");
    }
    const parent = parentNodes[0];
    return parent;
}

const getParentNodeId = (node: string, graph: DirectedGraph) => {
    const parent = getParentNode(node, graph);
    if (parent === null) {
        return null;
    }
    const attrs = graph.getNodeAttributes(parent);
    if (attrs?.match) {
        return attrs.match.id;
    }
    return null;
}

export const lgdMapGraph = async (graph: DirectedGraph) => {
    for (const node of graph.nodes()) {
        const attrs = graph.getNodeAttributes(node);
        if (!!attrs.title) {
            const parent_id = getParentNodeId(node, graph);
            console.log(node, parent_id)
            const matches = await getMatches(attrs.title, attrs.level_name, parent_id);
            graph.mergeNodeAttributes(node, {
                matches,
                // Matched if only a single match is found,
                match: matches.length === 1 ? matches[0] : undefined,
            });
        }
    }
    return graph
}