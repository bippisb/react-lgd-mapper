import { ChangeEvent, FC, FormEvent, useEffect, useImperativeHandle, useState } from "react";
import { getMatches, getLevels } from "../api";
import { ILGDLevel, ILGDMatch, LevelName } from "../types";
import { MatchesTableView } from "./Entity";

interface GetLGDMatchComponentProps {
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

export const GetLGDMatchComponent: FC<GetLGDMatchComponentProps> = ({ title, level, parent_id, onSelect }) => {
    const [show, setShow] = useState(false);
    const [state, setState] = useState<ComponentFormState>({
        title,
        level_id: level, 
        useParent: !!parent_id,
    });
    const [results, setResults] = useState<null | ILGDMatch[]>(null);
    const [levels, setLevels] = useState<ILGDLevel[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
        const key = e.currentTarget.name;
        let value: string | boolean= e.currentTarget.value;
        if (key ===  "useParent") {
            value = value === "on";
        }
        setState(state => ({
            ...state,
            [key]: value,
        }))
    }

    const fetchMatches = async () => {
        const {
            title,
            level: level_id,
            parent_id,
            useParent
        } = state;
        const lvl = levels.find(v => v.id === Number(level_id));
        console.log(lvl, level_id)
        const level_name = lvl?.name as LevelName;
        const parentArg = useParent ? parent_id : null;
        const results = await getMatches(
            title,
            level_name,
            parentArg,
        );
        setResults(results);
    }

    useEffect(() => {
        (async () => {
            const res = await getLevels();
            setLevels(res);
        })();
    }, [])
    return (
        <div>
            <button onClick={() => setShow(state => !state)}>Get Matches</button>
            <dialog open={show}>
                <button onClick={() => setShow(state => !state)}> Close </button>
                <div>
                    <input type="text" onChange={handleChange} value={state.title} name="title" />
                    {!!parent_id && (
                        <div>
                            <input type="checkbox" onChange={handleChange} checked={state.useParent} name="useParent" />
                            <label htmlFor="useParent">Parent Id ({parent_id})</label>
                        </div>
                    )}
                    <select onChange={handleChange} value={state.level_id} name="level">
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
            </dialog>
        </div>

    )
}