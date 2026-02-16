import { useTheme } from '../context/ThemeContext.jsx';

const AdminChartTooltip = ({ active, payload, label }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!active || !payload || !payload.length) {
        return null;
    }

    const data = payload[0];
    const value = data.value;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div
            style={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                opacity: 1,
                transform: 'scale(1)',
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
                animation: 'tooltipFadeIn 150ms ease-out',
            }}
        >
            <style>
                {`
          @keyframes tooltipFadeIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
            </style>
            <p
                style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    marginBottom: '4px',
                }}
            >
                {label}
            </p>
            <p
                style={{
                    margin: 0,
                    fontSize: '13px',
                    color: isDark ? '#e5e7eb' : '#475569',
                }}
            >
                Total Spent: <span style={{ fontWeight: 600 }}>{formatCurrency(value)}</span>
            </p>
        </div>
    );
};

export default AdminChartTooltip;
