'use client';
import { createContext, useContext, useState } from "react";
const AppContext = createContext<any>(undefined);

export async function AppWrapper({children}:{
    children:React.ReactNode;
}) {
    let [value,setValue] = useState("Rishabh")
    return (
        <AppContext.Provider value={{value,setValue}}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext(){
    return useContext(AppContext);
}