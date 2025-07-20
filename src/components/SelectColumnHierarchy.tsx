/**
 * WHAT THIS FILE DOES:
 * - Allows the user to map the columns from their uploaded file to the official LGD
 *   administrative levels (e.g., map 'My District Column' to the 'district' level).
 *
 * WHAT CHANGED:
 * - The component no longer tries to import `getLevels` from the deleted `query.ts`.
 * - It now correctly imports `getLevels` from our new, central `./services/api.ts`.
 * - It fetches the levels from the backend API when the component loads.
 */
import { FC, useState } from "react";
// import { getLevels } from "../services/api.ts"; // <-- CORRECTED IMPORT
import { useAppState } from "../services/state.ts"; // <-- Import the global state hook
import { ILGDLevel } from "../types";

export type Hierarchy = { [columnName: string]: ILGDLevel };

interface SelectColHierarchyProps {
  columns: string[];
  onHierarchyChange: (hierarchy: Hierarchy) => void;
}

export const SelectColumnHierarchy: FC<SelectColHierarchyProps> = ({
  columns,
  onHierarchyChange,
}) => {
  // Get the levels array directly from the global state.
  const levels = useAppState((state) => state.levels);
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});

  const handleChange = (columnName: string, levelId: string) => {
    const selectedLevel = levels.find((l) => l.id.toString() === levelId);
    if (selectedLevel) {
      setHierarchy((prevState) => ({
        ...prevState,
        [columnName]: selectedLevel,
      }));
    }
  };

  const handleSubmit = () => onHierarchyChange(hierarchy);

  // If levels haven't loaded yet (e.g., on initial render before useEffect in App.tsx completes),
  // show a loading state.
  if (levels.length === 0) {
    return <div className="p-4 text-center text-sm">Loading administrative levels...</div>;
  }

  return (
    <div className="mt-4">
      <hr className="border-gray-600 border-1 my-2" />
      <h3 className="text-lg font-semibold text-white">Define Column Hierarchy</h3>
      <div className="p-2">
        <div className="mb-2 flex justify-between border-b-2 border-dotted border-gray-500 align-bottom text-xs text-gray-300">
          <span>Column Name</span>
          <span>Administrative Level</span>
        </div>
        {columns.map((col) => (
            <div key={col} className="grid grid-cols-2 mb-2 items-center border-b border-gray-500 py-1">
                <label htmlFor={`level-select-${col}`} className="align-middle font-medium text-sm text-gray-200">
                    {col}
                </label>
                <select
                    id={`level-select-${col}`}
                    value={hierarchy[col]?.id || ""}
                    onChange={(e) => handleChange(col, e.target.value)}
                    className="w-full bg-gray-200 border border-gray-400 rounded-md py-1 px-2 text-sm text-black"
                >
                    <option value="" disabled>Select a Level</option>
                    {levels.map((level) => (
                        // Do not show the 'india' level as it's not a mappable column
                        level.name !== 'india' && (
                            <option key={level.id} value={level.id}>
                                {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
                            </option>
                        )
                    ))}
                </select>
            </div>
        ))}
        <div className="flex justify-end mt-4">
          <button
            className="bg-raspberry-rose text-white font-semibold rounded-md py-2 px-4 hover:bg-raspberry-rose-lighter transition-colors"
            onClick={handleSubmit}
          >
            Confirm Hierarchy
          </button>
        </div>
      </div>
    </div>
  );
};