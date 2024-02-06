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
    const lgdColumns = Object.entries(hierarchy)
        .map(([col, lvl]) => ([col, lvl.id]))
        .sort(compareNodesByLevel)
        .map(([c]) => c);
    const uniqueRows = df.groupby(lgdColumns).count().loc({ columns: lgdColumns });
    const records = dfd.toJSON(uniqueRows);

    const graph = new DirectedGraph();

    for (const record of records) {
        let nodes = [];
        for (let i = 0; i < lgdColumns.length; i++) {
            const col = lgdColumns[i];
            const lvl = hierarchy[col];
            const title = record[col];
            const node = Array.from({ length: i + 1 }, (_, i) => i)
                .reduce((level, i) => {
                    const col: string = lgdColumns[i];
                    const lvl: { id: string } = hierarchy[col];
                    const name: string[] = [record[col], lvl.id];
                    // @ts-ignore
                    level.push(...name)
                    return level
                }, []);
            const attrs = {
                title,
                level_id: lvl.id,
                level_name: lvl["name"]
            };

            nodes.push(node);
            graph.mergeNode(node, attrs);
        }
        nodes = nodes.sort(compareNodesByLevel)
        for (let i = 0; i < nodes.length - 1; i++) {
            const parent = nodes[i];
            const child = nodes[i + 1];

            graph.mergeEdge(parent, child);
        }
    }

    return graph
}

export const getRootNodes = (graph: DirectedGraph) => {
    return graph.filterNodes(node => graph.inDegree(node) === 0);
}