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
    <div className="p-2">
      <div className="mb-2">
        <div className="flex gap-1">
          <input className="grow" type="text" onChange={handleChange} onKeyDown={fetchMatchesOnEnterPress} value={state.title} name="title" />
          <select onChange={handleChange} value={state.level_id} name="level_id">
            <option>Without Level</option>
            {levels.map((l) => (
              <option value={l.name} key={l.id.toString()}>
                {l.name.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between">
          {!!parent_id && (
            <div>
              <input type="checkbox" onChange={handleChange} checked={state.useParent} name="useParent" />
              <label htmlFor="useParent" className="text-xs">Look for matches within the mapped parent entity</label>
            </div>
          )}
          <button
            className="text-white bg-gray-700 px-2 mt-1"
            type="button"
            onClick={fetchMatches}
          >
            Find
          </button>
        </div>
      </div>
      {results === null ? "" :
        results.length === 0 ?
          (<p className="text-sm text-gray-600 font-medium">No matches found for '{state.title}'.</p>)
          : (
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
