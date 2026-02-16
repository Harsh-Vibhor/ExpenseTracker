import { useTheme } from '../context/ThemeContext.jsx';

/**
 * Hook to get chart theme colors based on current theme
 */
export const useChartTheme = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return {
        gridColor: isDark ? '#334155' : '#e5e7eb',
        axisColor: isDark ? '#e5e7eb' : '#374151',
        tooltipStyle: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: isDark ? '#e5e7eb' : '#374151',
        },
    };
};
