import { ChangeEvent, FC, useState } from "react";
import { addVariation } from "../api";

interface AddVariationProps {
    entity_id: number;
    variation: string;
    node: string;
}


export const AddVariation: FC<AddVariationProps> = ({ entity_id, variation, node }) => {
    const [state, setState] = useState<{ variation: string; email: string; }>({
        variation,
        email: ""
    });
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const key = e.currentTarget.name;
        setState(state => ({ ...state, [key]: value }))
    };

    return (
        <div className="p-2 ">
            <input
                className="w-full block mb-2 pl-2 px-[4px]"
                placeholder="Name variation"
                name={"variation"}
                value={state.variation}
                onChange={handleChange}
                type="text"
            />
            <input
                className="w-full block pl-2 px-[4px]"
                placeholder="Your email address"
                name={"email"}
                value={state.email}
                onChange={handleChange}
                type="email"
            />
            <button
                className="m-1 py-1 px-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm hover:text-gray-700 hover:bg-gray-100"
                onClick={() => addVariation(variation, entity_id)}
            >
                Suggest Variation
            </button>
        </div>
    )
}