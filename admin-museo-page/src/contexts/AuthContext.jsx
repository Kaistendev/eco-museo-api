import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

const API_URL = 'http://localhost:3000';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await AuthService.login(credentials);            
            const currentUser = AuthService.getCurrentUser();
            setUser(currentUser);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            if (!userData || !userData.username || !userData.password) {
                throw new Error('Datos de usuario incompletos');
            }
            
            const response = await AuthService.register(userData);
            
            // Obtener el usuario actualizado
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                console.warn('No se pudo obtener el usuario después del registro, pero el registro fue exitoso');
            }
            
            setUser(currentUser);
            return response;
        } catch (error) {
            console.error('Error en el registro:', error);
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
};

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};