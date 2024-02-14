import { create } from "zustand";
import { ILGDLevel } from "../types";

interface LevelsStore {
  levels: ILGDLevel[];
  setLevels: (levels: ILGDLevel[]) => void;
}

export const useLevelsStore = create<LevelsStore>((set) => ({
  levels: [],
  setLevels: (levels) => set({ levels }),
}));
