import { useState, FC } from 'react';

interface IAccordionProps {
    title: string;
    children: any;
}

export const Accordion: FC<IAccordionProps> = ({ title, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-gray-700 last:border-none">
            <div className="flex justify-between items-center py-2">
                <span className="cursor-pointer text-white">{title}</span>
                <button
                    onClick={() => setOpen((state) => !state)}
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                >
                    {open ? "^" : ">"}
                </button>
            </div>
            {open && (
                <div className="pl-4">
                    {children}
                </div>
            )}
        </div>
    );
};