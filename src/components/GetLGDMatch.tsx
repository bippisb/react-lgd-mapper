import { ChangeEvent, FC, useEffect, useState } from "react";
import { getMatches, getLevels } from "../api";
import { ILGDLevel, ILGDMatch, LevelName } from "../types";
import { MatchesTableView } from "./MatchesTableView";

interface GetLGDMatchComponentProps {
  node?: string;
  parent_id: number; // parent's entity id
  level: string; // level name
  title: string;
  onSelect: (m: ILGDMatch) => void;
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
  node = "",
  onSelect,
}) => {
  const [show, setShow] = useState(false);
  const [results, setResults] = useState<null | ILGDMatch[]>(null);
  const [levels, setLevels] = useState<ILGDLevel[]>([]);
  const [state, setState] = useState<ComponentFormState>({
    title,
    level_id: level,
    useParent: !!parent_id,
  });

  const fetchMatches = async () => {
    const {
      title,
      level_id,
      useParent
    } = state;
    const lvl = levels.find(v => v.name === level_id);
    console.log(lvl, level_id)
    const level_name = lvl?.name as LevelName;
    const parentArg = useParent ? parent_id : null;
    const results = await getMatches(
      title,
      level_name,
      parentArg,
    );
    setResults(results);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
    const key = e.currentTarget.name;
    let value: string | boolean = e.currentTarget.value;
    if (key === "useParent") {
      value = value === "on";
    }
    console.log(key, value);
    setState(state => ({
      ...state,
      [key]: value,
    }))
  }


  useEffect(() => {
    (async () => {
      const res = await getLevels();
      setLevels(res);
    })();
  }, []);

  return (
    <div className="border rounded-md mb-1">
      <button
        className="w-full p-4 text-left bg-gray-200 hover:bg-gray-300 transition duration-300"
        onClick={() => setShow(state => !state)}
      >
        Get Matches
        <span className={`float-right transform ${show ?
          'rotate-180' : 'rotate-0'}  
                                 transition-transform duration-300`}>
          &#9660;
        </span>
      </button>
      {
        show && (
          <div>
            <div>
              <input type="text" id={node + "title"} onChange={handleChange} value={state.title} name="title" />
              {!!parent_id && (
                <div>
                  <input type="checkbox" id={node + "useparent"} onChange={handleChange} checked={state.useParent} name="useParent" />
                  <label htmlFor="useParent">Parent Id ({parent_id})</label>
                </div>
              )}
              <select onChange={handleChange} id={node + "level"} value={state.level_id} name="level_id">
                <option>Without Level</option>
                {
                  levels.map(l => (
                    <option value={l.name} key={l.id}>{l.name}</option>
                  ))
                }
              </select>
              <button type="button" onClick={fetchMatches}>Fetch</button>
            </div>
            {results !== null && results.length && <MatchesTableView matches={results} node="get_matches" onSelect={onSelect} />}
          </div>
        )
      }
    </div>
  );
};
