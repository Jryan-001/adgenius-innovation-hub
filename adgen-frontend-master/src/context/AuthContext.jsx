import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('adgen_darkmode') === 'true';
    });

    // Apply dark mode class to html element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('adgen_darkmode', darkMode.toString());
    }, [darkMode]);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('adgen_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('adgen_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const users = JSON.parse(localStorage.getItem('adgen_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const userData = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                avatar: foundUser.avatar || null,
                createdAt: foundUser.createdAt,
                projects: foundUser.projects || 0,
                exports: foundUser.exports || 0
            };
            setUser(userData);
            localStorage.setItem('adgen_user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const register = async (name, email, password) => {
        const users = JSON.parse(localStorage.getItem('adgen_users') || '[]');

        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            avatar: null,
            createdAt: new Date().toISOString(),
            projects: 0,
            exports: 0
        };

        users.push(newUser);
        localStorage.setItem('adgen_users', JSON.stringify(users));

        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: null,
            createdAt: newUser.createdAt,
            projects: 0,
            exports: 0
        };
        setUser(userData);
        localStorage.setItem('adgen_user', JSON.stringify(userData));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adgen_user');
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('adgen_user', JSON.stringify(updatedUser));

        const users = JSON.parse(localStorage.getItem('adgen_users') || '[]');
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('adgen_users', JSON.stringify(users));
        }
    };

    const incrementStat = (stat) => {
        if (user && (stat === 'projects' || stat === 'exports')) {
            updateProfile({ [stat]: (user[stat] || 0) + 1 });
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            incrementStat,
            isAuthenticated: !!user,
            darkMode,
            toggleDarkMode
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
