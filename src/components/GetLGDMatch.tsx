import { FC, FormEvent, useEffect, useState } from "react";
import { getMatches, getLevels } from "../api";
import { ILGDLevel, ILGDMatch } from "../types";
import { MatchesTableView } from "./Entity";

interface GetLGDMatchComponentProps {
    parent_id: number; // parent's entity id
    level: string; // level name
    title: string;
}

export const GetLGDMatchComponent: FC<GetLGDMatchComponentProps> = ({title, level, parent_id }) => {
    const [show, setShow] = useState(false);
    const [results, setResults] = useState<null | ILGDMatch[]>(null);
    const [levels, setLevels] = useState<ILGDLevel[]>([]);

    const fetchMatches = async (e: FormEvent<HTMLFormElement>) => {
        e.currentTarget.preventDefault();
        console.log(e.currentTarget.elements);
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
                <form onSubmit={fetchMatches}>
                    <input type="text" defaultValue={title} name="title" />
                    <input type="checkbox" defaultValue={parent_id} name="parent_id" />
                    <select defaultValue={level} name="level">
                        <option>Without Level</option>
                        {
                            levels.map(l => (
                                <option value={l.name} key={l.id}>{l.name}</option>
                            ))
                        }
                    </select>
                    <button type="submit">Fetch</button>
                </form>
                {results !== null && results.length && <MatchesTableView matches={results} node="get_matches" />}
            </dialog>
        </div>

    )
}