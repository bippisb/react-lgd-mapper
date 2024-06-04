import { FC, useEffect, useState } from 'react';

const Sidebar: FC<{ children: any, open: boolean }> = ({ children, open }) => {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex">
            {/* Toggle Button */}
            <button
                className={`fixed top-4 ${isOpen ? "left-72" : "left-4"} z-50 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white focus:outline-none transition-transform duration-300 transform ${isOpen ? 'translate-x-2' : 'translate-x-0'}`}
                onClick={toggleSidebar}
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 min-w-64 max-w-80  bg-gray-600 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}

            >
                
                {children}

            </div>

        </div>
    );
};

const MenuIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
        />
    </svg>
);

const CloseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
        />
    </svg>
);
export default Sidebar;