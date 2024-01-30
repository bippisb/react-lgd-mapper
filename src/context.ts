import { createContext, useContext } from 'react';

export const GlobalContext = createContext({
    alpha: 1,
});

export const useGlobalContext = () => useContext(GlobalContext);
