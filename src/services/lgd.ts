import { DirectedGraph } from "graphology";
import { getBatchedMatches, getMatches } from "../api";
import { LevelName } from "../types";


export const getParentNode = (node: string, graph: DirectedGraph) => {
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

export const getParentNodeId = (node: string, graph: DirectedGraph) => {
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

const countUnmatchedChildren = (node: string, graph: DirectedGraph): number => {
    const children = graph.outNeighbors(node);
    const count = children.reduce((acc, child) => {
        const nodeHasAMatch = !!graph.getNodeAttribute(child, "match")
        if (nodeHasAMatch) {
            return acc + countUnmatchedChildren(child, graph)
        }
        return acc + 1 + countUnmatchedChildren(child, graph)
    }, 0)
    return count
}

export const computeUnmatchedChildren = (graph: DirectedGraph) => {
    for (const node of graph.nodes()) {
        const unmatchedChildren = countUnmatchedChildren(node, graph);
        graph.mergeNodeAttributes(node, { unmatchedChildren });
    }
    return graph
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

export const lgdMapInBatches = async (
    graph: DirectedGraph,
    levelNames: LevelName[],
    batchSize = 100,
    onProgress: (percentage: number) => void = () => { }
) => {
    const nodeIsOfLevel = (l: LevelName) => (n: string) => {
        const attrs = graph.getNodeAttributes(n);
        return attrs.level_name === l && !attrs?.matches;
    }
    console.log("inbaches")
    let nFetched = 0;
    for (const levelName of levelNames) {
        console.log(levelName)
        const nodes = graph.filterNodes(nodeIsOfLevel(levelName));
        for (let i = 0; i < nodes.length; i += batchSize) {
            const batch = nodes.slice(i, i + batchSize);
            const payload = batch.map(node => {
                const { title, level_name } = graph.getNodeAttributes(node);
                const parent_id = getParentNodeId(node, graph);

                return {
                    name: Boolean(title) ? title : "",
                    level: level_name,
                    parent_id,
                }
            })
            const matches = await getBatchedMatches(payload);
            for (let j = 0; j < batch.length; j++) {
                const n = batch[j];
                const m = matches[j];
                graph.mergeNodeAttributes(n, {
                    matches: m,
                    match: m?.length === 1 ? m[0] : undefined,
                });
            }
            nFetched = i + batch.length;
            onProgress(nFetched / graph.order);
        }
    }

    return graph;
}