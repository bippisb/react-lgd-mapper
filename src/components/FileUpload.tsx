import { ChangeEvent, FC } from "react"

interface IFileUpload {
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    subtext?: string;
    accept?: string;
}

export const FileUpload: FC<IFileUpload> = ({ handleChange, subtext, accept = ".csv" }) => {
    return (
        <>
            <input
                className="block w-full mb-1 text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 file:bg-gray-800 file:text-white"
                type="file"
                accept={accept}
                onChange={handleChange}
            />
            {subtext && (
                <p className="ml-2 text-xs text-gray-600">{subtext}</p>
            )}
        </>
    )
}