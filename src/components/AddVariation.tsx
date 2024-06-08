import { ChangeEvent, FC, useEffect, useState } from "react";
import { addVariation } from "../api";

interface AddVariationProps {
    entity_id: number;
    variation: string;
    node: string;
}


export const AddVariation: FC<AddVariationProps> = ({ entity_id, variation }) => {
    const [state, setState] = useState<{ variation: string; proposer_email: string; }>({
        variation,
        proposer_email: ""
    });

    useEffect(() => {
        setState(v => ({
            ...v,
            variation,
        }))
    }, [entity_id])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const key = e.currentTarget.name;
        setState(state => ({ ...state, [key]: value }))
    };
    const handleSubmit = async () => {
        const res = await addVariation(state.variation, String(entity_id), state.proposer_email)
        if (res.data?.status_code != 200) {
            alert("Couldn't add variation.")
            console.log(res)
        } else {
            alert("Added Variation")
        }
    }
    return (
        <div className="p-2 bg-gray-800 rounded-md shadow-md">
            <input
                className="w-full mb-4 px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name Variation"
                name="variation"
                value={state.variation}
                autoComplete="new-password"
                onChange={handleChange}
                type="text"
            />
            <input
                className="w-full mb-4 px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email address"
                name="proposer_email"
                value={state.proposer_email}
                onChange={handleChange}
                type="email"
            />
            <button
                className="w-full py-2 px-4 bg-amaranth text-white font-semibold rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200"
                onClick={handleSubmit}
            >
                Suggest Variation
            </button>
        </div>
    )
}