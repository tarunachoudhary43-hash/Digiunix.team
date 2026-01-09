import { useEffect, useState } from 'react';
import { Users, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsPage() {
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "royal-indigo";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (primary) setThemeColor(primary);

    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Dashboard Data:', data);
        console.log('Weekly Data:', data.weeklyData);
        console.log('Yearly Data:', data.yearlyData);
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Leads', val: analyticsData?.totalLeads || '0', icon: Users, color: 'var(--primary)', bg: 'var(--primary-bg)' },
    { label: 'New This Week', val: analyticsData?.newThisWeek || '0', icon: Target, color: 'var(--warning)', bg: '#FEF3C7' },
  ];

  const COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--purple)', '#f43f5e'];

  // Get the appropriate data based on selected time period
  const getTrendData = () => {
    if (!analyticsData) return [];
    
    switch(timePeriod) {
      case 'weekly':
        return analyticsData.weeklyData || [];
      case 'yearly':
        return analyticsData.yearlyData || [];
      default:
        return analyticsData.trendData || [];
    }
  };

  // Get the appropriate dataKey for X-axis
  const getXAxisKey = () => {
    switch(timePeriod) {
      case 'weekly':
        return 'week';
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
  };

  const currentData = getTrendData();
  const hasData = currentData && currentData.length > 0;
  const hasLeads = hasData && currentData.some((item: any) => item.leads > 0);

  return (
    <>
      <style>{`
        .container { 
          min-height: 100vh; 
          background-color: #ffffff; 
          padding: 2rem; 
          font-family: 'Inter', sans-serif; 
        }
        
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2rem; 
        }
        
        .header-title {
          font-size: 2.125rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
        }
        
        .metrics-grid { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 1rem; 
          margin-bottom: 2rem; 
        }
        
        .metric-card { 
          background: white; 
          padding: 1.5rem; 
          border-radius: var(--radius); 
          border: 1px solid var(--border); 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          box-shadow: var(--shadow-sm); 
        }
        
        .metric-info p:first-child { 
          font-size: 0.75rem; 
          font-weight: 700; 
          color: var(--text-muted); 
          text-transform: uppercase; 
          margin: 0 0 0.5rem 0; 
        }
        
        .metric-info p:last-child { 
          font-size: 1.75rem; 
          font-weight: 800; 
          color: var(--text-base); 
          margin: 0; 
        }
        
        .metric-icon { 
          padding: 0.75rem; 
          border-radius: 0.75rem;
          display: flex;
        }
        
        .charts-row { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 1.5rem; 
          margin-bottom: 1.5rem; 
        }
        
        .chart-card { 
          background: white; 
          padding: 1.5rem; 
          border-radius: var(--radius); 
          border: 1px solid var(--border); 
          min-height: 400px; 
          display: flex; 
          flex-direction: column; 
          box-shadow: var(--shadow-sm); 
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .chart-title { 
          font-size: 1.125rem; 
          font-weight: 700; 
          color: var(--text-base); 
          margin: 0;
        }

        .tab-group {
          display: flex;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .tab-button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .tab-button:hover {
          background: #e5e7eb;
        }

        .tab-button.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-content {
          flex: 1;
          min-height: 300px;
          position: relative;
        }

        .no-data-message {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: var(--text-muted);
          gap: 0.5rem;
        }

        .no-data-message svg {
          width: 48px;
          height: 48px;
          opacity: 0.3;
        }

        /* Tablet Responsive (768px - 1024px) */
        @media (max-width: 1024px) {
          .container {
            padding: 1.5rem;
          }
          
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-row {
            grid-template-columns: 1fr;
          }
          
          .chart-card {
            min-height: 350px;
          }
        }

        /* Mobile Responsive (below 768px) */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .header-title {
            font-size: 1.75rem;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .metric-card {
            padding: 1rem;
          }
          
          .metric-info p:last-child {
            font-size: 1.5rem;
          }
          
          .charts-row {
            gap: 1rem;
          }
          
          .chart-card {
            padding: 1rem;
            min-height: 300px;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .tab-group {
            width: 100%;
          }

          .tab-button {
            flex: 1;
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
          }
        }

        /* Small Mobile (below 480px) */
        @media (max-width: 480px) {
          .container {
            padding: 0.75rem;
          }
          
          .header-title {
            font-size: 1.5rem;
          }
          
          .metric-card {
            padding: 0.875rem;
          }
          
          .metric-info p:first-child {
            font-size: 0.625rem;
          }
          
          .metric-info p:last-child {
            font-size: 1.25rem;
          }
          
          .metric-icon {
            padding: 0.5rem;
          }
          
          .chart-card {
            padding: 0.875rem;
            min-height: 280px;
          }
          
          .chart-title {
            font-size: 1rem;
          }

          .tab-button {
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div>
            <h1 className="header-title">
              Analytics & <span style={{color: 'var(--primary)'}}>Reports</span>
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Real-time performance metrics</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="metrics-grid">
          {stats.map((stat, i) => (
            <div key={i} className="metric-card">
              <div className="metric-info">
                <p>{stat.label}</p>
                <p>{stat.val}</p>
              </div>
              <div className="metric-icon" style={{ backgroundColor: stat.bg }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="charts-row">
          {/* Lead Acquisition Trend Chart with Time Period Tabs */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Lead Acquisition Trend</h3>
              <div className="tab-group">
                <button 
                  className={`tab-button ${timePeriod === 'weekly' ? 'active' : ''}`}
                  onClick={() => setTimePeriod('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`tab-button ${timePeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => setTimePeriod('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`tab-button ${timePeriod === 'yearly' ? 'active' : ''}`}
                  onClick={() => setTimePeriod('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="no-data-message">
                  <p>Loading...</p>
                </div>
              ) : hasData && hasLeads ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData}>
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey={getXAxisKey()} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="leads" stroke={themeColor} strokeWidth={3} fill="url(#areaFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>No data available for this period</p>
                  <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.7 }}>
                    {timePeriod === 'weekly' && 'Add leads to see weekly trends'}
                    {timePeriod === 'monthly' && 'Add leads to see monthly trends'}
                    {timePeriod === 'yearly' && 'Add leads to see yearly trends'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Source Pie Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Leads by Source</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={analyticsData?.sourceData || []} 
                    innerRadius="65%" 
                    outerRadius="85%" 
                    dataKey="value" 
                    paddingAngle={5}
                  >
                    {(analyticsData?.sourceData || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}