import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, Trash2, Plus, Layers, CheckCircle, ChevronDown, ChevronUp, 
  Target, TrendingUp, X, Settings, Trophy
} from "lucide-react";
import { Typography, useMediaQuery, useTheme, LinearProgress, Box, Stack, IconButton } from "@mui/material";

interface Member { 
  _id: string; 
  name: string; 
  role: string; 
  target: number; 
  leadsCompleted: number; // Added field
}

interface Team { 
  _id: string; 
  teamName: string; 
  department: string; 
  members: Member[]; 
}

const API_BASE = `${import.meta.env.VITE_API_URL}/api/sales-teams`;

const SalesTeamPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useProfile();

  const [teams, setTeams] = useState<Team[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<string | null>(null);

  // Check if user is not an admin (show complete buttons for all non-admin users)
  const isTeamMember = user?.role !== 'admin';

  // Debug logging
  console.log('User role:', user?.role);
  console.log('isTeamMember:', isTeamMember);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(res.data);
    } catch (err) {
      showToast("Error fetching teams");
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads?all=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.leads) setLeads(res.data.leads);
    } catch (err) {
      console.error(err);
      showToast("Error fetching leads");
    }
  };

  const completeLead = async (leadId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/leads/${leadId}`, {
        status: "Converted"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        showToast("Lead completed successfully!");
        fetchLeads(); // Refresh leads
      }
    } catch (err) {
      console.error(err);
      showToast("Error completing lead");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // NEW: Handle Lead Completion
  const handleCompleteLead = async (teamId: string, memberId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API_BASE}/${teamId}/member/${memberId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state with updated team data
      setTeams(teams.map(t => t._id === teamId ? res.data : t));
      showToast("Lead marked as complete! Performance updated.");
    } catch (err) {
      showToast("Failed to update performance");
    }
  };

  const handleCreateTeam = async () => {
    const finalDept = isCustomDept ? customDeptName : newTeam.dept;
    if (!newTeam.name || !finalDept) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/create`, {
        teamName: newTeam.name,
        department: finalDept,
        members: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams([...teams, res.data]);
      setNewTeam({ name: "", dept: "" });
      setShowCreateForm(false);
      showToast("Team created!");
    } catch (err) {
      showToast("Error creating team");
    }
  };

  const handleAddMember = async (teamId: string) => {
    const inputs = memberInputs[teamId];
    if (!inputs?.name || !inputs?.role || !inputs?.target) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/${teamId}/member`, {
        name: inputs.name,
        role: inputs.role,
        target: Number(inputs.target)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(teams.map(t => t._id === teamId ? res.data : t));
      setMemberInputs({ ...memberInputs, [teamId]: {} });
      showToast("Member added!");
    } catch (err) {
      showToast("Error adding member");
    }
  };

  // Stats Calculation
  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalCompleted = teams.reduce((acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + (m.leadsCompleted || 0), 0), 0);

  return (
    <div style={{ padding: isMobile ? "20px 12px" : "40px 20px", background: "#f8fafc", minHeight: "100vh" }}>
      {notification && <div style={toastStyle}><CheckCircle size={18} /> {notification}</div>}

      {/* HEADER */}
      <Box sx={{ maxWidth: "1100px", margin: "0 auto 30px auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Sales Team <span style={{ color: '#6366f1' }}>Performance</span></Typography>
          <Typography variant="body2" color="text.secondary">Track squad targets and lead conversions in real-time.</Typography>
        </Box>
        <button onClick={() => setShowCreateForm(!showCreateForm)} style={createBtnStyle}>
          {showCreateForm ? <X size={18}/> : <Plus size={18}/>} {showCreateForm ? "Cancel" : "New Squad"}
        </button>
      </Box>

      {/* STATS */}
      <div style={statsGridStyle(isMobile, isTablet)}>
        <StatCard title="Total Squads" value={teams.length} icon={<Layers size={20} color="#6366f1"/>} />
        <StatCard title="Total Members" value={totalMembers} icon={<Users size={20} color="#10b981"/>} />
        <StatCard title="Total Conversions" value={totalCompleted} icon={<Trophy size={20} color="#f59e0b"/>} />
      </div>

      {/* TEAMS LIST */}
      <Box sx={{ maxWidth: "1100px", margin: "0 auto" }}>
        {teams.map(team => (
          <div key={team._id} style={teamCardStyle}>
            <div style={teamHeaderStyle} onClick={() => setExpandedTeams(prev => ({ ...prev, [team._id]: !prev[team._id] }))}>
              <Stack direction="row" spacing={2} alignItems="center">
                <div style={avatarStyle}>{team.teamName.charAt(0)}</div>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{team.teamName}</Typography>
                  <Typography variant="caption" color="primary" fontWeight={700}>{team.department}</Typography>
                </Box>
              </Stack>
              {expandedTeams[team._id] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </div>

            {expandedTeams[team._id] && (
              <Box sx={{ p: isMobile ? 2 : 3, borderTop: "1px solid #e2e8f0" }}>
                {/* Add Member Row */}
                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                  <input style={inputStyle} placeholder="Name" value={memberInputs[team._id]?.name || ""} onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], name: e.target.value}})} />
                  <input style={inputStyle} placeholder="Role" value={memberInputs[team._id]?.role || ""} onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], role: e.target.value}})} />
                  <input style={inputStyle} type="number" placeholder="Target" value={memberInputs[team._id]?.target || ""} onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], target: e.target.value}})} />
                  <button onClick={() => handleAddMember(team._id)} style={addBtnStyle}>Add</button>
                </Box>

                {/* Performance Table */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#64748b", fontSize: "12px" }}>
                      <th style={{ paddingBottom: "10px" }}>MEMBER</th>
                      <th style={{ paddingBottom: "10px" }}>PROGRESS</th>
                      <th style={{ paddingBottom: "10px" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map(m => {
                      const progress = Math.min(((m.leadsCompleted || 0) / m.target) * 100, 100);
                      return (
                        <tr key={m._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                          </td>
                          <td style={{ width: isMobile ? "100px" : "250px", padding: "10px 0" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: progress >= 100 ? "#10b981" : "#6366f1" } }} />
                              </Box>
                              <Typography variant="caption" fontWeight={700}>{Math.round(progress)}%</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">{m.leadsCompleted || 0} / {m.target} leads</Typography>
                          </td>
                          <td>
                            <button onClick={() => handleCompleteLead(team._id, m._id)} style={completeBtnStyle}>
                              <CheckCircle size={14} /> {isMobile ? "" : "Complete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            )}
          </div>
        ))}
      </Box>
    </div>
  );
};

// --- STYLES ---
const teamCardStyle: React.CSSProperties = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", overflow: "hidden" };
const teamHeaderStyle: React.CSSProperties = { padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" };
const avatarStyle: React.CSSProperties = { width: "40px", height: "40px", background: "#6366f1", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", flex: 1, minWidth: "120px" };
const addBtnStyle: React.CSSProperties = { padding: "8px 20px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" };
const completeBtnStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" };
const createBtnStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" };
const toastStyle: React.CSSProperties = { position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const statsGridStyle = (isMobile: boolean, isTablet: boolean): React.CSSProperties => ({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "20px", maxWidth: "1100px", margin: "0 auto 40px auto" });

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>{title}</Typography>
    <Typography variant="h5" fontWeight={800} sx={{ my: 1 }}>{value}</Typography>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ padding: "8px", background: "#f5f3ff", borderRadius: "8px" }}>{icon}</div>
      <Typography variant="caption" color="success.main" fontWeight={700}><TrendingUp size={12}/> Active</Typography>
    </div>
  </div>
);

export default SalesTeamPage;