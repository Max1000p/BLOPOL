"use client"
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({})
export const ThemeContextProvider = ({children}) => {
    const [workflowStatus, setWorkflowStatus] = useState(1)

    return (
        <ThemeContext.Provider value={{workflowStatus, setWorkflowStatus }}>
            {children}
        </ThemeContext.Provider>
    )
};

export const useThemeContext = () => useContext(ThemeContext);