import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    /**
     * Login with email + password (spec uses email, not username).
     * The form field is named "identifier" (email) to match existing Login.jsx.
     */
    const login = async (identifier, password) => {
        const response = await api.post('/auth/login', { email: identifier, password });
        if (response.data.accessToken) {
            const userData = response.data; // { accessToken, id, name, email, role }
            localStorage.setItem('token', userData.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }
        return null;
    };

    /**
     * Register: maps Signup.jsx form fields → RegisterRequest
     * { name: fullName, email, password, phone }
     */
    const register = async (formData) => {
        return await api.post('/auth/register', {
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
