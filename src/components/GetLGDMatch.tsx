/**
 * WHAT THIS FILE DOES:
 * - Provides a search interface for a user to manually find a match for a single entity.
 */
import { ChangeEvent, FC, KeyboardEvent, useEffect, useState } from "react";
import { ILGDLevel, ILGDMatch, MatchRequestItem } from "../types";
import { MatchesTableView } from "./MatchesTableView";
import { getBatchedMatches, getLevels } from "../services/api";
import { toast } from "react-toastify"; // FIXED: Added missing toast import

interface GetLGDMatchComponentProps {
  parent_entity_code: number | undefined;
  level_name: string;
  title: string;
  onSelect: (m: ILGDMatch) => void;
  currentMatch?: ILGDMatch;
  initialMatches?: ILGDMatch[];
}

interface ComponentFormState {
  useParent: boolean;
  level_id: string;
  title: string;
}

export const GetLGDMatchComponent: FC<GetLGDMatchComponentProps> = ({
  title,
  level_name,
  parent_entity_code,
  onSelect,
  currentMatch,
  initialMatches = [],
}) => {
  const [results, setResults] = useState<ILGDMatch[]>(initialMatches);
  const [levels, setLevels] = useState<ILGDLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialLevelId = levels.find(l => l.name === level_name)?.id.toString() || '';

  const [state, setState] = useState<ComponentFormState>({
    title: title,
    level_id: initialLevelId,
    useParent: !!parent_entity_code,
  });

  useEffect(() => {
    getLevels().then(setLevels);
  }, []);
  
  useEffect(() => {
    setState({
      title,
      level_id: levels.find(l => l.name === level_name)?.id.toString() || '',
      useParent: !!parent_entity_code,
    });
    setResults(initialMatches);
  }, [title, level_name, parent_entity_code, initialMatches, levels]);

  const fetchMatches = async () => {
    setIsLoading(true);
    
    const requestItem: MatchRequestItem = {
      name: state.title,
      level_id: state.level_id ? parseInt(state.level_id) : undefined,
      parent_entity_code: state.useParent ? parent_entity_code : undefined,
    };
    
    try {
      const response = await getBatchedMatches([requestItem]);
      setResults(response[0] || []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      toast.error("Failed to fetch matches.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const key = e.currentTarget.name;
    const value = e.currentTarget.type === 'checkbox'
      ? (e.currentTarget as HTMLInputElement).checked
      : e.currentTarget.value;

    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleEnterPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchMatches();
    }
  };

  return (
    <div className="p-2 bg-gray-800 rounded-md shadow-md">
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            onChange={handleChange}
            onKeyDown={handleEnterPress}
            value={state.title}
            name="title"
            placeholder="Search..."
          />
          <select
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            value={state.level_id}
            name="level_id"
          >
            <option value="">Any Level</option>
            {levels.map((l) => (
              <option value={l.id.toString()} key={l.id}>
                {l.name.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center mt-2">
          {parent_entity_code !== undefined && (
            <div className="flex items-center">
              <input
                type="checkbox"
                onChange={handleChange}
                checked={state.useParent}
                name="useParent"
                id="useParent"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-amaranth focus:ring-amaranth-lighter"
              />
              <label htmlFor="useParent" className="text-xs text-gray-400">
                Search within parent
              </label>
            </div>
          )}
          <button
            className="px-4 py-2 bg-amaranth text-white font-semibold rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200 disabled:bg-gray-500"
            type="button"
            onClick={fetchMatches}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Find"}
          </button>
        </div>
      </div>
      
      {results.length === 0 && !isLoading ? (
        <p className="text-sm text-center text-gray-400 p-4">
          No matches found for '{state.title}'.
        </p>
      ) : (
        <MatchesTableView
          matches={results}
          match={currentMatch} // FIXED: Renamed prop from 'currentMatch' to 'match'
          onSelect={onSelect}
        />
      )}
    </div>
  );
};
