import { DirectedGraph } from "graphology";
import { getMatches } from "../api";


export const lgdMapGraph = async (graph: DirectedGraph) => {
    const promises = graph.mapNodes(async node => {
        const attrs = graph.getNodeAttributes(node);
        if (!!attrs.title) {
            const matches = await getMatches(attrs.title, attrs.level_name);
            graph.mergeNodeAttributes(node, {
                matches,
            })
        }

    })
    await Promise.all(promises);
    return graph
}