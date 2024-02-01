import { DirectedGraph } from "graphology";
import type { Hierarchy } from "../components/SelectColumnHierarchy";

export const compareNodesByLevel = (a: any, b: any) => {
    // the second item in the node is level id
    if (a[1] < b[1]) {
        return -1
    }
    if (a[1] > b[1]) {
        return 1
    }
    return 0
}

export const buildLGDGraph = (df: any, hierarchy: Hierarchy) => {
    const lgdColumns = Object.keys(hierarchy);
    const uniqueRows = df.groupby(lgdColumns).count().loc({ columns: lgdColumns });
    const records = dfd.toJSON(uniqueRows);

    const graph = new DirectedGraph();
    for (const record of records) {
        let nodes = [];
        for (const col of lgdColumns) {
            const lvl = hierarchy[col]
            const node = [record[col], lvl["id"]]

            nodes.push(node)
            graph.mergeNode(node)
        }
        nodes = nodes.sort(compareNodesByLevel)
        for (let i = 0; i < nodes.length - 1; i++) {
            const parent = nodes[i];
            const child = nodes[i + 1];

            graph.mergeEdge(parent, child)
        }
    }

    return graph
}

export const getRootNodes = (graph: DirectedGraph) => {
    return graph.filterNodes(node => graph.inDegree(node) === 0);
}