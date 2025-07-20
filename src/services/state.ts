/**
 * WHAT THIS FILE DOES:
 * - Manages the global state of the application using Zustand.
 *
 * WHAT CHANGED:
 * - Removed imports from the deleted './graph.ts'.
 * - The functions 'exportMappedDataFrame' and 'exportUnMappedDataFrame' are now commented out
 *   because their logic was dependent on the old data structure. They need to be rewritten.
 * - This change is necessary to allow the application to compile and run.
 */
import { create } from "zustand";
import { DirectedGraph } from "graphology";
import { Hierarchy } from '../components/SelectColumnHierarchy';
import { getLevels as apiGetLevels } from "./api.ts"; // Import the API function
import { ILGDLevel } from "../types";

// The main application state interface
interface IAppState {
    // --- App-wide Data ---
    levels: ILGDLevel[]; // <-- NEW: To store the list of all admin levels
    
    // --- User-specific Data & Workflow State ---
    columns: string[] | null;
    rawFileData: any[] | null;
    lgdCols: string[];
    hierarchy: Hierarchy | null;
    activeNode: string | null;

    // --- Actions ---
    fetchLevels: () => Promise<void>; // <-- NEW: Action to populate the levels
    setColumns: (columns: string[]) => void;
    setRawFileData: (data: any[]) => void;
    setLgdCols: (lgdCols: string[]) => void;
    setHierarchy: (hierarchy: Hierarchy) => void;
    setActiveNode: (activeNode: string) => void;
    resetState: () => void;
}

export const useAppState = create<IAppState>((set, get) => ({
    // --- Initial State ---
    levels: [],
    columns: null,
    rawFileData: null,
    lgdCols: [],
    hierarchy: null,
    activeNode: null,

    // --- Actions Implementation ---
    fetchLevels: async () => {
        // Prevent re-fetching if levels are already loaded
        if (get().levels.length > 0) return;
        try {
            const fetchedLevels = await apiGetLevels();
            set({ levels: fetchedLevels });
        } catch (error) {
            console.error("Failed to fetch administrative levels:", error);
            // In a real app, you might want to set an error state here
        }
    },
    
    setColumns: (columns: string[] | null) => set({ columns }),
    setRawFileData: (data: any[] | null) => set({ rawFileData: data }),
    setLgdCols: (lgdCols: string[]) => set({ lgdCols }),
    setHierarchy: (hierarchy: Hierarchy | null) => set({ hierarchy }),
    setActiveNode: (activeNode: string | null) => set({ activeNode }),
    resetState: () => set({
        columns: null,
        rawFileData: null,
        lgdCols: [],
        hierarchy: null,
        activeNode: null,
        // Don't reset levels, as they are static app data
    })
}));

interface IGraphState {
    graph: DirectedGraph | null;
    setGraph: (g: DirectedGraph) => void;
}

export const useGraph = create<IGraphState>(set => ({
    graph: null,
    setGraph: (g: DirectedGraph) => set({ graph: g }),
}));


// --- UTILITY FUNCTIONS ---

export const downloadText = (text: string, fileName: string, type: string) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, 0);
};

export const serializeState = (appState: IAppState, graphState: IGraphState) => ({
    columns: appState.columns,
    lgdCols: appState.lgdCols,
    mappingProgress: appState.mappingProgress,
    hierarchy: appState.hierarchy,
    activeNode: appState.activeNode,
    graph: graphState.graph?.export(),
});

export const exportAppState = (appState: IAppState, graphState: IGraphState) => {
    const state = serializeState(appState, graphState);
    const replacer = (_: any, v: any) => typeof v == "bigint" ? v.toString() : v;
    const json = JSON.stringify(state, replacer, 2); // Added indentation for readability
    downloadText(json, "lgd_mapper_app_state.json", "application/json");
};

/*
// TODO: These functions need to be rewritten based on the new graph structure.
// They are commented out to prevent compilation errors.

export const exportMappedDataFrame = (graph: DirectedGraph, hierarchy: Hierarchy) => {
    // const csv = prepareMappedDataFrameCSV(graph, hierarchy);
    // downloadText(csv, "mapped_dataframe.csv", "text/csv")
    alert("This feature is being rebuilt.");
}

export const exportUnMappedDataFrame = (graph: DirectedGraph, hierarchy: Hierarchy) => {
    // const csv = prepareUnmappedDataFrameCSV(graph, hierarchy);
    // downloadText(csv, "unmapped_dataframe.csv", "text/csv")
    alert("This feature is being rebuilt.");
}
*/