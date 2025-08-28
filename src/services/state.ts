import { create } from "zustand";
import { DirectedGraph } from "graphology";
import { Hierarchy } from '../components/SelectColumnHierarchy';
import { getLevels as apiGetLevels } from "./api.ts";
import { ILGDLevel } from "../types";

interface IAppState {
    levels: ILGDLevel[];
    columns: string[] | null;
    rawFileData: any[] | null;
    lgdCols: string[];
    hierarchy: Hierarchy | null;
    activeNode: string | null;
    fetchLevels: () => Promise<void>;
    setColumns: (columns: string[]) => void;
    setRawFileData: (data: any[]) => void;
    setLgdCols: (lgdCols: string[]) => void;
    setHierarchy: (hierarchy: Hierarchy) => void;
    setActiveNode: (activeNode: string) => void;
    resetState: () => void;
}

export const useAppState = create<IAppState>((set, get) => ({
    levels: [],
    columns: null,
    rawFileData: null,
    lgdCols: [],
    hierarchy: null,
    activeNode: null,
    fetchLevels: async () => {
        if (get().levels.length > 0) return;
        try {
            const fetchedLevels = await apiGetLevels();
            set({ levels: fetchedLevels });
        } catch (error) {
            console.error("Failed to fetch administrative levels:", error);
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
    // FIXED: Removed non-existent 'mappingProgress' property
    hierarchy: appState.hierarchy,
    activeNode: appState.activeNode,
    graph: graphState.graph?.export(),
});

export const exportAppState = (appState: IAppState, graphState: IGraphState) => {
    const state = serializeState(appState, graphState);
    const replacer = (_: any, v: any) => typeof v == "bigint" ? v.toString() : v;
    const json = JSON.stringify(state, replacer, 2);
    downloadText(json, "lgd_mapper_app_state.json", "application/json");
};
