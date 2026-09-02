import {createContext, useContext, useState, useEffect} from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return null;
}

function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.add('light');
}

export function ThemeProvider({children}) {
    const [theme, setThemeState] = useState(() => {
        return getStoredTheme() || getSystemTheme();
    });

    const setTheme = (t) => {
        const root = document.documentElement;
        root.classList.add('theme-transition');
        localStorage.setItem('theme', t);
        setThemeState(t);
        applyTheme(t);
        setTimeout(() => root.classList.remove('theme-transition'), 350);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        applyTheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (!getStoredTheme()) {
                const sys = getSystemTheme();
                setThemeState(sys);
                applyTheme(sys);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ThemeContext.Provider value={{theme, setTheme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext);
}
