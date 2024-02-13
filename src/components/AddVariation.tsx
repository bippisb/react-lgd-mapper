import { ChangeEvent, FC, useState } from "react";
import { addVariation } from "../api";

interface AddVariationProps {
    entity_id: number;
    variation: string;
    node: string;
}

export const AddVariation: FC = ({ entity_id, variation, node }) => {
    const [state, setState] = useState<AddVariationProps>({
        entity_id,
        variation,
        node
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const key = e.currentTarget.name;
        const value = e.currentTarget.value;
        setState(state => ({
            ...state,
            [key]: value,
        }))
    };


    return (
        <div>
            <label htmlFor={node + "add_var"} className="text-xl">Add Variation</label>
            <input name={node + "add_var"} value={state.variation} onChange={handleChange} type="text" />
            <button onClick={() => addVariation(state.variation, entity_id)}>Submit</button>
        </div>
    )
}