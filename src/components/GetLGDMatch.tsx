import { ChangeEvent, FC, useEffect, useState } from "react";
import { getMatches, getLevels } from "../api";
import { ILGDLevel, ILGDMatch, LevelName } from "../types";
import { MatchesTableView } from "./MatchesTableView";
import { useLevelsStore } from "./store";

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
  const { levels, setLevels } = useLevelsStore((state) => ({
    levels: state.levels,
    setLevels: state.setLevels,
  }));
  const [state, setState] = useState<ComponentFormState>({
    title,
    level_id: level,
    useParent: !!parent_id,
  });

  const fetchMatches = async () => {
    const { title, level_id, useParent } = state;
    const lvl = levels.find((v) => v.name === level_id);
    const level_name = lvl?.name as LevelName;
    const parentArg = useParent ? parent_id : null;
    const results = await getMatches(title, level_name, parentArg);
    setResults(results);
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement & HTMLSelectElement>
  ) => {
    const key = e.currentTarget.name;
    let value: string | boolean = e.currentTarget.value;
    if (key === "useParent") {
      value = value === "on";
    }

    setState((state) => ({
      ...state,
      [key]: value,
    }));
  };

  useEffect(() => {
    (async () => {
      const res = await getLevels();
      setLevels(res);
    })();
  }, []);

  return (
    <div className="my-2">
      <div className="flex justify-center">
        <button
          className=" w-3/4 p-2 text-left text-white bg-gray-700 hover:bg-gray-600 transition duration-300 rounded-full flex justify-between"
          onClick={() => setShow((state) => !state)}
        >
          Get Matches
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            stroke="#FFFFFF"
            className="ml-5"
          >
            <path d="M 10 0.1875 C 4.578125 0.1875 0.1875 4.578125 0.1875 10 C 0.1875 15.421875 4.578125 19.8125 10 19.8125 C 12.289063 19.8125 14.394531 19.003906 16.0625 17.6875 L 16.9375 18.5625 C 16.570313 19.253906 16.699219 20.136719 17.28125 20.71875 L 21.875 25.34375 C 22.589844 26.058594 23.753906 26.058594 24.46875 25.34375 L 25.34375 24.46875 C 26.058594 23.753906 26.058594 22.589844 25.34375 21.875 L 20.71875 17.28125 C 20.132813 16.695313 19.253906 16.59375 18.5625 16.96875 L 17.6875 16.09375 C 19.011719 14.421875 19.8125 12.300781 19.8125 10 C 19.8125 4.578125 15.421875 0.1875 10 0.1875 Z M 10 2 C 14.417969 2 18 5.582031 18 10 C 18 14.417969 14.417969 18 10 18 C 5.582031 18 2 14.417969 2 10 C 2 5.582031 5.582031 2 10 2 Z M 4.9375 7.46875 C 4.421875 8.304688 4.125 9.289063 4.125 10.34375 C 4.125 13.371094 6.566406 15.8125 9.59375 15.8125 C 10.761719 15.8125 11.859375 15.433594 12.75 14.8125 C 12.511719 14.839844 12.246094 14.84375 12 14.84375 C 8.085938 14.84375 4.9375 11.695313 4.9375 7.78125 C 4.9375 7.675781 4.933594 7.574219 4.9375 7.46875 Z"></path>
          </svg>
          <span
            className={`float-right transform ${
              show ? "rotate-180" : "rotate-0"
            }  
                                 transition-transform duration-300`}
          >
            &#9660;
          </span>
        </button>
      </div>
      {show && (
        <div className="p-2">
          <div>
            <div className="grid grid-cols-3 gap-1">
              <input
                type="text"
                id={node + "title"}
                onChange={handleChange}
                value={state.title}
                name="title"
              />
              {!!parent_id && (
                <div>
                  <input
                    type="checkbox"
                    id={node + "useparent"}
                    onChange={handleChange}
                    checked={state.useParent}
                    name="useParent"
                  />
                  <label htmlFor="useParent">Parent Id ({parent_id})</label>
                </div>
              )}
              <select
                onChange={handleChange}
                id={node + "level"}
                value={state.level_id}
                name="level_id"
              >
                <option>Without Level</option>
                {levels.map((l) => (
                  <option value={l.name} key={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                className="text-white bg-gray-700 rounded-md px-2 py-1 hover:bg-gray-600"
                type="button"
                onClick={fetchMatches}
              >
                Fetch
              </button>
            </div>
          </div>
          {results !== null && results.length && (
            <MatchesTableView
              matches={results}
              node="get_matches"
              onSelect={onSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};
