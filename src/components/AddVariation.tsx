/**
 * WHAT THIS FILE DOES:
 * - A simple form for a user to suggest a new name variation for a confirmed match.
 */
import { FC, useEffect, useState } from "react"; // FIXED: Removed unused 'ChangeEvent'
import { addVariation } from "../services/api.ts";
import { toast } from "react-toastify";

interface AddVariationProps {
  entity_code: number;
  current_name: string;
}

export const AddVariation: FC<AddVariationProps> = ({ entity_code, current_name }) => {
    const [variationName, setVariationName] = useState(current_name);
    const [proposerEmail, setProposerEmail] = useState("");

    // If the selected entity changes, update the suggested variation name.
    useEffect(() => {
        setVariationName(current_name);
    }, [current_name]);

    const handleSubmit = async () => {
        if (!proposerEmail) {
            toast.warn("Please enter your email address.");
            return;
        }
        if (!variationName) {
            toast.warn("Variation name cannot be empty.");
            return;
        }

        try {
            const res = await addVariation(variationName, entity_code, proposerEmail);
            toast.success(res.message || "Variation submitted!");
            // Clear fields on success
            setProposerEmail("");
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Could not add variation.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-2 bg-gray-800 rounded-md shadow-md mt-2">
            <h6 className="text-xs text-gray-300 mb-2">Suggest a new name variation</h6>
            <input
                className="w-full mb-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name Variation"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                type="text"
            />
            <input
                className="w-full mb-4 px-4 py-2 bg-gray-700 text-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email address"
                value={proposerEmail}
                onChange={(e) => setProposerEmail(e.target.value)}
                type="email"
            />
            <button
                className="w-full py-2 px-4 bg-amaranth text-white font-semibold rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200"
                onClick={handleSubmit}
            >
                Suggest Variation
            </button>
        </div>
    );
};
