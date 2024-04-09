import { create } from "zustand";
import type { Hierarchy } from "../components/SelectColumnHierarchy";
import { DirectedGraph } from "graphology";
import { getRootNodes, prepareMappedDataFrameCSV, prepareUnmappedDataFrameCSV } from "./graph";

interface IAppState {
    columns: string[] | null;
    lgdCols: string[];
    mappingProgress: number | null;
    hierarchy: Hierarchy | null;
    activeNode: string | null;
    setColumns: (columns: string[]) => void;
    setLgdCols: (lgdCols: string[]) => void,
    setMappingProgress: (p: number) => void;
    setHierarchy: (hierarchy: Hierarchy) => void;
    setActiveNode: (activeNode: string) => void;
    resetState: () => void;
}

export const useAppState = create<IAppState>(set => ({
    columns: null,
    lgdCols: [],
    mappingProgress: null,
    hierarchy: null,
    activeNode: null,
    setColumns: (columns: string[] | null) => set({ columns }),
    setLgdCols: (lgdCols: string[]) => set({ lgdCols }),
    setMappingProgress: (p: number | null) => set({ mappingProgress: p }),
    setHierarchy: (hierarchy: Hierarchy | null) => set({ hierarchy }),
    setActiveNode: (activeNode: string | null) => set({ activeNode }),
    resetState: () => set({
        columns: null,
        lgdCols: [],
        mappingProgress: 0,
        hierarchy: null,
        activeNode: null
    })
}))

interface IGraph {
    graph: DirectedGraph | null;
    setGraph: (g: DirectedGraph) => void;
}

export const useGraph = create<IGraph>(set => ({
    graph: null,
    setGraph: (g: DirectedGraph) => set({ graph: g }),
}))

export const serializeState = (appState: IAppState, graphState: IGraph) => ({
    columns: appState.columns,
    lgdCols: appState.lgdCols,
    mappingProgress: appState.mappingProgress,
    hierarchy: appState.hierarchy,
    activeNode: appState.activeNode,
    graph: graphState.graph?.export(),
})

export const downloadText = (text: string, fileName: string, type: string) => {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, 0);
}

export const exportAppState = (appState: IAppState, graphState: IGraph) => {
    const state = serializeState(appState, graphState);
    const replacer = (_, v) => typeof v == "bigint"? v.toString() : v;
    const json = JSON.stringify(state, replacer);
    downloadText(json, "lgd_mapper_app_state.json", "application/json")
}

export const exportMappedDataFrame = (graph: DirectedGraph, hierarchy: Hierarchy) => {
    const csv = prepareMappedDataFrameCSV(graph, hierarchy);
    downloadText(csv, "mapped_dataframe.csv", "text/csv")
}

export const exportUnMappedDataFrame = (graph: DirectedGraph, hierarchy: Hierarchy) => {
    const csv = prepareUnmappedDataFrameCSV(graph, hierarchy);
    downloadText(csv, "unmapped_dataframe.csv", "text/csv")
}

export const loadAppState = async (file: File, appState: IAppState, graphState: IGraphState) => {
    const fileText = await file.text();
    const json = JSON.parse(fileText);
    appState.resetState();
    appState.setColumns(json.columns);
    appState.setLgdCols(json.lgdCols);
    appState.setMappingProgress(json.mappingProgress);
    appState.setActiveNode(json.activeNode);
    appState.setHierarchy(json.hierarchy);
    const graph = new DirectedGraph();
    graph.import(json.graph)
    graphState.setGraph(graph);
}