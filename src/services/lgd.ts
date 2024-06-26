import { DirectedGraph } from "graphology";
import { getMatches, getBatchedMatches } from "../services/query";
import { LevelName } from "../types";
import { toast } from "react-toastify";


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

export const countTotalUnmatchedChildren = (graph: DirectedGraph) => {
    let count = 0
    for (const node of graph.nodes()) {
        const unmatchedChildren = countUnmatchedChildren(node, graph);
        count += unmatchedChildren
    }
    return count
}

export const lgdMapGraph = async (graph: DirectedGraph) => {
    for (const node of graph.nodes()) {
        const attrs = graph.getNodeAttributes(node);
        if (!!attrs.title) {
            const parent_id = getParentNodeId(node, graph);
            console.log(node, parent_id)
            const matches = await getMatches(attrs.title, attrs.level_id, parent_id);
            graph.mergeNodeAttributes(node, {
                matches,
                // Matched if only a single match is found,
                match: matches.length === 1 ? matches[0] : undefined,
            });
        }
    }
    return graph
}

export const remapEntities = async (graph: DirectedGraph, node: string) => {
    const children = graph.outNeighbors(node);
    const unmappedChildren = children.filter(child => !graph.getNodeAttribute(child, "match"));
    for (const child of unmappedChildren) {
        const attrs = graph.getNodeAttributes(child);
        const parent_id = getParentNodeId(child, graph);
        const matches = await getMatches(attrs.title, attrs.level_id, parent_id);
        graph.mergeNodeAttributes(child, {
            matches,
            // Matched if only a single match is found,
            match: matches.length === 1 ? matches[0] : undefined,
        });
    }
    for (const child of unmappedChildren) {
        graph = await remapEntities(graph, child);
    }
    return graph
}

export const lgdMapInBatches = async (
    graph: DirectedGraph,
    levelNames: LevelName[],
    batchSize = 100,
) => {
    const nodeIsOfLevel = (l: LevelName) => (n: string) => {
        const attrs = graph.getNodeAttributes(n);
        return attrs.level_name === l && !attrs?.matches;
    }
    console.log("inbaches")
    const tid = toast.loading("Mapping...");
    for (const levelName of levelNames) {
        toast.update(tid, { render: `Mapping ${levelName}...`, type: "info" });
        console.log(levelName)
        const nodes = graph.filterNodes(nodeIsOfLevel(levelName));
        for (let i = 0; i < nodes.length; i += batchSize) {
            const batch = nodes.slice(i, i + batchSize);
            const payload = batch.map(node => {
                const { title, level_id } = graph.getNodeAttributes(node);
                const parent_id = getParentNodeId(node, graph);

                return {
                    name: Boolean(title) ? title : "",
                    level_id: level_id,
                    parent_id,
                }
            })
            const matches = await getBatchedMatches(payload);
            for (let j = 0; j < batch.length; j++) {
                const n = batch[j];
                const m = matches[j];
                graph.mergeNodeAttributes(n, {
                    matches: m,
                    match: m?.filter(i => i?.match_type !== "fuzzy")?.length === 1 ? m[0] : undefined,
                });
            }
        }
    }
    toast.update(tid, { render: `Finished mapping`, type: "success", isLoading: false, autoClose: 2000 });

    return graph;
}