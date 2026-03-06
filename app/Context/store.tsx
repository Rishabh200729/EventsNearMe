'use client';
import { createContext, useContext, useState } from "react";
const AppContext = createContext<any>(undefined);

export function AppWrapper({ children }: {
    children: React.ReactNode;
}) {
    let [state, setState] = useState<any>({ user: null });
    return (
        <AppContext.Provider value={{ value: state, setValue: setState }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext);
}