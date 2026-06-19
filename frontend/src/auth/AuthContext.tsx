import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
    username: string;
    groups: string[];
    cn?: string;
    dn?: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (newToken: string, newUser: User) => {
        const allowedGroups = ["APP_DEUDA_ADMIN", "APP_DEUDA_USER", "APP_FINANZAS_ADMIN"];
        const hasPermission = newUser.groups.some(group => allowedGroups.includes(group));

        if (!hasPermission) {
            throw new Error("No tienes los permisos necesarios para acceder a esta aplicación.");
        }

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
