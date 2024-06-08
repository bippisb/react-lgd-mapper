import { ChangeEvent, FC, KeyboardEvent, useEffect, useState } from "react";
import { getMatches, getLevels } from "../services/query";
import { ILGDLevel, ILGDMatch } from "../types";
import { MatchesTableView } from "./MatchesTableView";
import { castPossibleBigIntToNumber } from "../services/utils";

interface GetLGDMatchComponentProps {
  node?: string;
  parent_id: number; // parent's entity id
  level: string; // level name
  title: string;
  onSelect: (m: ILGDMatch) => void;
  matches?: ILGDMatch[];
  match?: ILGDMatch
}

interface ComponentFormState {
  useParent: boolean;
  level_id: string;
  title: string;
}

export const GetLGDMatchComponent: FC<GetLGDMatchComponentProps> = ({
  title,
  level,
  parent_id,
  onSelect,
  match,
  matches = null,
}) => {
  const [results, setResults] = useState<null | ILGDMatch[]>(matches);
  const [levels, setLevels] = useState<ILGDLevel[]>([]);
  const [state, setState] = useState<ComponentFormState>({
    title,
    level_id: level,
    useParent: !!parent_id,
  });

  useEffect(() => {
    setState(({
      title,
      level_id: level,
      useParent: !!parent_id,
    }));
    setResults(matches)
  }, [title, level, parent_id])

  const fetchMatches = async () => {
    const {
      title,
      level_id,
      useParent
    } = state;
    const lvl = levels.find(v => v.name === level_id);
    const parentArg = useParent ? parent_id : null;
    const results = await getMatches(title, lvl?.id, castPossibleBigIntToNumber(parentArg), true);
    setResults(results);
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement & HTMLSelectElement>
  ) => {
    const key = e.currentTarget.name;
    let value: string | boolean = e.currentTarget.value;
    if (key === "useParent") {
      value = !state.useParent;
    }

    setState((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const fetchMatchesOnEnterPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code == "Enter") {
      fetchMatches();
    }
  }

  useEffect(() => {
    (async () => {
      const res = await getLevels();
      setLevels(res);
    })();
  }, []);

  return (
    <div className="p-2 bg-gray-800 rounded-md shadow-md">
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            onChange={handleChange}
            onKeyDown={fetchMatchesOnEnterPress}
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
            <option>Without Level</option>
            {levels.map((l) => (
              <option value={l.name} key={l.id.toString()}>
                {l.name.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center mt-2">
          {!!parent_id && (
            <div className="flex items-center">
              <input
                type="checkbox"
                onChange={handleChange}
                checked={state.useParent}
                name="useParent"
                id="useParent"
                className="mr-2 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="useParent" className="text-xs text-gray-400">
                Look for matches within the mapped parent entity
              </label>
            </div>
          )}
          <button
            className="px-4 py-2 bg-amaranth text-white font-semibold rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200"
            type="button"
            onClick={fetchMatches}
          >
            Find
          </button>
        </div>
      </div>
      {results === null ? (
        ""
      ) : results.length === 0 ? (
        <p className="text-sm text-gray-400">
          No matches found for '{state.title}'.
        </p>
      ) : (
        <MatchesTableView
          matches={results}
          match={match}
          node="get_matches"
          onSelect={onSelect}
        />
      )}
    </div>
  );
};
