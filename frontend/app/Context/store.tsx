'use client';
import { createContext, useContext, useState } from "react";

interface User {
    id: string;
    email: string;
    role: "Creator" | "Participator";
}

interface AppContextType {
    value: { user: User | null };
    setValue: (state: { user: User | null }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppWrapper({ children }: {
    children: React.ReactNode;
}) {
    let [state, setState] = useState<{ user: User | null }>({ user: null });
    return (
        <AppContext.Provider value={{ value: state, setValue: setState }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppWrapper");
    }
    return context;
}