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

export const getLGDColsInHierarchicalOrder = (hierarchy: Hierarchy) => {
    return Object.entries(hierarchy)
        .map(([col, lvl]) => ([col, lvl.id]))
        .sort(compareNodesByLevel)
        .map(([c]) => c);
}

export const buildLGDGraph = (records: any, hierarchy: Hierarchy) => {
    const lgdColumns = getLGDColsInHierarchicalOrder(hierarchy);
    const graph = new DirectedGraph();

    for (const record of records) {
        let nodes = [];
        for (let i = 0; i < lgdColumns.length; i++) {
            const col = lgdColumns[i];
            const lvl = hierarchy[col];
            const title = record[col] as string;
            const node = Array.from({ length: i + 1 }, (_, i) => i)
                .reduce((level, i) => {
                    const col: string = lgdColumns[i];
                    const lvl: { id: string } = hierarchy[col];
                    const name: string[] = [record[col] as string, lvl.id];
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

const prepareHeader = (hierarchy: Hierarchy, prepColumnNames: (lvl: any) => string[]) => {
    const copy = { ...hierarchy }
    for (const key in hierarchy) {
        copy[key]["column"] = key;
    }
    const levels = Object.values(copy);
    levels.sort((a, b) => a.code - b.code);

    const head = [];
    for (const lvl of levels) {
        head.push(
            ...prepColumnNames(lvl)
        );
    }
    return head.join(",");
}

export const prepareMappedDataFrameCSV = (
    graph: DirectedGraph,
    hierarchy: Hierarchy,
) => {
    const prepRow = (node: string, row: string[] = []): string => {
        const attrs = graph.getNodeAttributes(node);
        if (!attrs?.match) {
            return "";
        }
        row.unshift(attrs.title, attrs.match.name, attrs.match.code);
        const parents = graph.inNeighbors(node);
        if (parents.length > 0) {
            const parent = parents[0];
            return prepRow(parent, row);
        }
        return row.join(",");
    };

    const prepColumnNames = (lvl: any) => [
        lvl["column"],
        "lgd_mapped_" + lvl["name"] + "_name",
        lvl["name"] + "_lgd_code",
    ]

    let csv = prepareHeader(hierarchy, prepColumnNames) + "\n";
    const terminalNodes = getTerminalNodes(graph);
    for (const node of terminalNodes) {
        const row = prepRow(node);
        if (row !== '') {
            csv = csv + row + "\n";
        }
    }
    return csv;
};


export const prepareUnmappedDataFrameCSV = (graph: DirectedGraph, hierarchy: Hierarchy) => {
    const prepRow = (node: string): string => {
        const attrs = graph.getNodeAttributes(node);
        if (!!attrs?.match) {
            return "";
        }
        let row = node.split(",").filter(a => isNaN(Number(a)));
        return row.join(",")
    };

    const prepColumnNames = (lvl: any) => [
        lvl["name"]
    ]

    let csv = prepareHeader(hierarchy, prepColumnNames) + "\n";
    const terminalNodes = getTerminalNodes(graph);
    for (const node of terminalNodes) {
        const row = prepRow(node);
        if (row !== '') {
            csv = csv + row + "\n";
        }
    }
    return csv;
};

const isTerminalNode = (graph: DirectedGraph) => (node: string) => {
    return graph.outNeighbors(node).length === 0;
}

export const getTerminalNodes = (graph: DirectedGraph) => {
    return graph.filterNodes(isTerminalNode(graph))
}
