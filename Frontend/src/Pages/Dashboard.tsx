import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  MoreHorizontal,
  Layers,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Typography, Box, Card, IconButton } from '@mui/material';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>({
    totalTeams: 0,
    totalMembers: 0,
    totalTarget: 0,
    deptTargetData: [],
    teamMemberDistribution: []
  });

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardMetrics();
    fetchTeamAnalytics();
  }, []);

  /* ================= DASHBOARD DATA ================= */
  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setDashboardData(result);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  /* ================= SALES TEAM ANALYTICS ================= */
  const fetchTeamAnalytics = async () => {
    try {
      const res = await fetch(`${API}/api/sales-teams/dashboard`);
      const result = await res.json();

      if (res.ok) {
        // Department wise target
        const deptMap: any = {};
        const memberPie: any[] = [];

        result.teams.forEach((team: any) => {
          const dept = team.department || "Other";
          if (!deptMap[dept]) deptMap[dept] = 0;

          deptMap[dept] += team.members.reduce(
            (sum: number, m: any) => sum + (m.target || 0),
            0
          );

          memberPie.push({
            name: team.teamName,
            value: team.members.length
          });
        });

        setTeamStats({
          totalTeams: result.totalTeams,
          totalMembers: result.totalMembers,
          totalTarget: result.totalTarget,
          deptTargetData: Object.keys(deptMap).map(d => ({
            dept: d,
            target: deptMap[d]
          })),
          teamMemberDistribution: memberPie
        });
      }
    } catch (err) {
      console.error("Team stats error:", err);
    }
  };

  /* ================= TOP METRICS ================= */
  const stats = [
    {
      label: 'Total Leads',
      val: dashboardData?.totalLeads || 0,
      icon: Users,
      color: '#6366f1',
      trend: '+12%'
    },
    {
      label: 'Total Squads',
      val: teamStats.totalTeams,
      icon: Layers,
      color: '#8b5cf6',
      trend: 'Active'
    },
    {
      label: 'Squad Members',
      val: teamStats.totalMembers,
      icon: Briefcase,
      color: '#f59e0b',
      trend: 'Live'
    }
    // {
    //   label: 'New This Week',
    //   val: dashboardData?.newThisWeek || 0,
    //   icon: Target,
    //   color: '#10b981',
    //   trend: '+5%'
    // }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 }, backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      
      {/* ================= HEADER ================= */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          Squad & Performance <span style={{ color: 'var(--primary)' }}>Overview</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          Real-time insights into teams, members & targets
        </Typography>
      </Box>

      {/* ================= METRIC CARDS ================= */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)',
          lg: 'repeat(3, 1fr)' 
        },
        gap: { xs: 2, sm: 2.5, md: 3 }, 
        mb: { xs: 3, md: 5 } 
      }}>
        {stats.map((stat, i) => (
          <Card key={i} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: { xs: 2, md: 3 }, border: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography fontSize={{ xs: 11, sm: 12 }} fontWeight={700} color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography fontSize={{ xs: 22, sm: 24, md: 26 }} fontWeight={800}>
                  {stat.val}
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 1, md: 1.2 }, borderRadius: 2, backgroundColor: `${stat.color}22` }}>
                <stat.icon size={20} color={stat.color} />
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <TrendingUp size={14} color="#10b981" />
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{stat.trend}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* ================= LEADS TREND ================= */}
      <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 }, mb: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 2, md: 3 }, alignItems: 'center' }}>
          <Typography fontWeight={800} sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>Lead Performance Trend</Typography>
          <IconButton size="small"><MoreHorizontal /></IconButton>
        </Box>

        <Box sx={{ height: { xs: 250, sm: 300, md: 360 }, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData?.trendData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area dataKey="leads" stroke="#6366f1" fill="#6366f144" />
              <Area dataKey="conversions" stroke="#10b981" fill="#10b98144" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      <Box sx={{ 
        mt: { xs: 3, md: 6 }, 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        gap: { xs: 2.5, md: 3 }
      }}>

        {/* BAR CHART */}
        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 }, minHeight: { xs: 350, sm: 400, md: 420 } }}>
          <Typography fontWeight={800} mb={1} sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
            Squad Targets
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Department-wise target distribution
          </Typography>

          <Box sx={{ height: { xs: 250, sm: 280, md: 320 }, mt: { xs: 2, md: 3 }, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamStats.deptTargetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dept" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="target" fill="#8b5cf6" barSize={60} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* PIE CHART */}
        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 }, minHeight: { xs: 350, sm: 400, md: 420 } }}>
          <Typography fontWeight={800} mb={1} sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
            Member Allocation
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Team-wise member strength
          </Typography>

          <Box sx={{ height: { xs: 250, sm: 280, md: 320 }, mt: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamStats.teamMemberDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={6}
                >
                  {teamStats.teamMemberDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>

      </Box>
    </Box>
  );
}