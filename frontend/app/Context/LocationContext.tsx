"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationContextType {
    userLoc: [number, number] | null;
    loading: boolean;
    error: string | null;
    permissionDenied: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLoc([position.coords.latitude, position.coords.longitude]);
                setLoading(false);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setPermissionDenied(true);
                } else {
                    setError("Failed to get location");
                }
                setLoading(false);
            }
        );
    }, []);

    return (
        <LocationContext.Provider value={{ userLoc, loading, error, permissionDenied }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}
