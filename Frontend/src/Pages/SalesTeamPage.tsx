import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, Trash2, Plus, Layers, CheckCircle, ChevronDown, ChevronUp, 
  Target, TrendingUp, X, Settings
} from "lucide-react";
import { Typography, useMediaQuery, useTheme } from "@mui/material";

interface Member { _id: string; name: string; role: string; target: number; }
interface Team { _id: string; teamName: string; department: string; members: Member[]; }

const API_BASE = `${import.meta.env.VITE_API_URL}/api/sales-teams`;

const SalesTeamPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<string[]>(["Direct Sales", "Lead Generation", "Enterprise B2B"]);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptName, setCustomDeptName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({ name: "", dept: "" });
  const [memberInputs, setMemberInputs] = useState<{ [key: string]: { name?: string; role?: string; target?: string } }>({});

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
      console.error(err);
      showToast("Error fetching teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

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
      if (isCustomDept && !departments.includes(customDeptName)) {
        setDepartments([...departments, customDeptName]);
      }
      setNewTeam({ name: "", dept: "" });
      setIsCustomDept(false);
      setShowCreateForm(false);
      showToast("Team created successfully!");
    } catch (err) {
      console.error(err);
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
      showToast("Member added successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error adding member");
    }
  };

  const handleDeleteMember = async (teamId: string, memberId: string) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${teamId}/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(teams.map(t => t._id === teamId ? { ...t, members: t.members.filter(m => m._id !== memberId) } : t));
      showToast("Member removed.");
    } catch (err) {
      console.error(err);
      showToast("Error deleting member");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Delete this team?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(teams.filter(t => t._id !== teamId));
      showToast("Team deleted successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error deleting team");
    }
  };

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalTargetValue = teams.reduce((acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.target, 0), 0);

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    padding: isMobile ? "20px 12px" : isTablet ? "30px 16px" : "40px 20px",
    background: "#FFFFFF",
    minHeight: "100vh",
    marginTop: isMobile ? "60px" : "0"
  };

  const headerContainerStyle: React.CSSProperties = {
    maxWidth: "1100px",
    margin: "0 auto 30px auto",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "15px" : "0"
  };

  const statsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
    gap: isMobile ? "12px" : "20px",
    maxWidth: "1100px",
    margin: "0 auto 40px auto"
  };

  const createBtnMain: React.CSSProperties = {
    border: "none",
    padding: isMobile ? "8px 16px" : "10px 24px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: isMobile ? "14px" : "16px",
    width: isMobile ? "100%" : "auto",
    justifyContent: "center"
  };

  const topCardStyle: React.CSSProperties = {
    maxWidth: "1100px",
    margin: "0 auto 25px auto",
    padding: isMobile ? "16px" : "25px"
  };

  const topInputContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "12px" : "15px"
  };

  const topInput: React.CSSProperties = {
    flex: 1,
    padding: isMobile ? "10px" : "12px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    color: "var(--text-base)",
    fontSize: isMobile ? "14px" : "16px"
  };

  const teamCard: React.CSSProperties = {
    marginBottom: "15px",
    overflow: "hidden",
    padding: 0
  };

  const teamHeader: React.CSSProperties = {
    padding: isMobile ? "14px 16px" : "18px 25px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    cursor: "pointer",
    gap: isMobile ? "12px" : "0"
  };

  const teamInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: isMobile ? "100%" : "auto"
  };

  const delTeamBtn: React.CSSProperties = {
    background: "var(--primary-bg)",
    border: "1px solid var(--border)",
    color: "var(--danger)",
    padding: isMobile ? "6px 12px" : "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    width: isMobile ? "100%" : "auto"
  };

  const tableContainerStyle: React.CSSProperties = {
    padding: isMobile ? "12px" : "20px",
    borderTop: "1px solid var(--border)",
    overflowX: "auto"
  };

  const inlineInput: React.CSSProperties = {
    width: isMobile ? "100%" : "90%",
    padding: isMobile ? "6px" : "8px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    fontSize: isMobile ? "13px" : "14px"
  };

  return (
    <div style={containerStyle}>
      {notification && (
        <div style={{
          ...toastStyle,
          right: isMobile ? "10px" : "20px",
          left: isMobile ? "10px" : "auto",
          fontSize: isMobile ? "13px" : "14px"
        }}>
          <CheckCircle size={18} /> {notification}
        </div>
      )}

      {/* HEADER */}
      <div style={headerContainerStyle}>
        <div>
          <Typography 
            variant="h4" 
            fontWeight={800}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
          >
            Sales Squad <span style={{ color: 'var(--primary)' }}>Commander</span>
          </Typography>
          <p className="text-muted" style={{ fontSize: isMobile ? "13px" : "14px" }}>
            Manage your teams and custom departments.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="primary" 
          style={showCreateForm ? { ...createBtnMain, backgroundColor: "var(--danger)" } : createBtnMain}
        >
          {showCreateForm ? <X size={18}/> : <Plus size={18}/>}
          {showCreateForm ? "Cancel" : "Create Squad"}
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={statsGrid}>
        <StatCard 
          title="Total Teams" 
          value={teams.length} 
          icon={<Layers size={20} color="var(--primary)"/>}
          isMobile={isMobile}
        />
        <StatCard 
          title="Total Members" 
          value={totalMembers} 
          icon={<Users size={20} color="var(--success)"/>}
          isMobile={isMobile}
        />
        <StatCard 
          title="Total Target" 
          value={`$${totalTargetValue.toLocaleString()}`} 
          icon={<Target size={20} color="var(--warning)"/>}
          isMobile={isMobile}
        />
      </div>

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="card shadow-md" style={topCardStyle}>
          <h2 style={{ 
            fontSize: isMobile ? "16px" : "18px", 
            marginBottom: "15px", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px" 
          }}>
            <Settings size={18} /> Initialize New Team
          </h2>
          <div style={topInputContainerStyle}>
            <input 
              style={topInput} 
              placeholder="Team Name..." 
              value={newTeam.name} 
              onChange={e => setNewTeam({...newTeam, name: e.target.value})} 
            />
            
            {!isCustomDept ? (
              <select 
                style={topInput} 
                onChange={e => e.target.value === "ADD_NEW" ? setIsCustomDept(true) : setNewTeam({ ...newTeam, dept: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Add Custom Dept</option>
              </select>
            ) : (
              <input 
                style={topInput} 
                placeholder="Type Dept Name..." 
                autoFocus 
                onChange={e => setCustomDeptName(e.target.value)} 
              />
            )}

            <button 
              onClick={handleCreateTeam} 
              className="primary" 
              style={{ 
                padding: isMobile ? "10px 16px" : "10px 24px",
                fontSize: isMobile ? "14px" : "16px",
                width: isMobile ? "100%" : "auto"
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* TEAMS LIST */}
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {teams.map(team => (
          <div key={team._id} className="card shadow-sm" style={teamCard}>
            <div 
              style={teamHeader} 
              onClick={() => setExpandedTeams(prev => ({ ...prev, [team._id]: !prev[team._id] }))}
            >
              <div style={teamInfoStyle}>
                <div style={{
                  ...teamAvatar,
                  width: isMobile ? "36px" : "40px",
                  height: isMobile ? "36px" : "40px",
                  fontSize: isMobile ? "14px" : "16px"
                }}>
                  {team.teamName ? team.teamName.charAt(0).toUpperCase() : 'T'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: isMobile ? "15px" : "16px" 
                  }}>
                    {team.teamName}
                  </h3>
                  <span style={{ 
                    fontSize: isMobile ? "11px" : "12px", 
                    color: "var(--primary)", 
                    fontWeight: 700 
                  }}>
                    {team.department}
                  </span>
                </div>
                {!isMobile && (expandedTeams[team._id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/> )}
              </div>
              <button 
                onClick={(e) => {e.stopPropagation(); handleDeleteTeam(team._id)}} 
                style={delTeamBtn}
              >
                Delete
              </button>
            </div>

            {expandedTeams[team._id] && (
              <div style={tableContainerStyle}>
                {isMobile ? (
                  // Mobile Card View
                  <div>
                    {/* Add Member Form */}
                    <div style={{
                      background: "var(--primary-bg)",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "12px"
                    }}>
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Add New Member</h4>
                      <input 
                        style={{ ...inlineInput, marginBottom: "8px" }} 
                        placeholder="Name"
                        value={memberInputs[team._id]?.name || ""} 
                        onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], name: e.target.value}})} 
                      />
                      <input 
                        style={{ ...inlineInput, marginBottom: "8px" }} 
                        placeholder="Role"
                        value={memberInputs[team._id]?.role || ""} 
                        onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], role: e.target.value}})} 
                      />
                      <input 
                        style={{ ...inlineInput, marginBottom: "8px" }} 
                        placeholder="Target"
                        value={memberInputs[team._id]?.target || ""} 
                        onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], target: e.target.value}})} 
                      />
                      <button 
                        onClick={() => handleAddMember(team._id)} 
                        className="primary" 
                        style={{ padding: "8px 16px", width: "100%", fontSize: "14px" }}
                      >
                        Add Member
                      </button>
                    </div>

                    {/* Members List */}
                    {team.members.map(m => (
                      <div 
                        key={m._id} 
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "12px",
                          marginBottom: "8px"
                        }}
                      >
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ fontSize: "14px" }}>{m.name}</strong>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                          Role: {m.role}
                        </div>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          marginTop: "8px"
                        }}>
                          <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "14px" }}>
                            Target: {m.target}
                          </span>
                          <Trash2 
                            size={18} 
                            color="var(--danger)" 
                            onClick={() => handleDeleteMember(team._id, m._id)} 
                            style={{cursor:'pointer'}}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop Table View
                  <table style={{ width: "100%", minWidth: "600px" }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Name</th>
                        <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Role</th>
                        <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Target</th>
                        <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: "var(--primary-bg)" }}>
                        <td>
                          <input 
                            style={inlineInput} 
                            placeholder="Name"
                            value={memberInputs[team._id]?.name || ""} 
                            onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], name: e.target.value}})} 
                          />
                        </td>
                        <td>
                          <input 
                            style={inlineInput} 
                            placeholder="Role"
                            value={memberInputs[team._id]?.role || ""} 
                            onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], role: e.target.value}})} 
                          />
                        </td>
                        <td>
                          <input 
                            style={inlineInput} 
                            placeholder="Target"
                            value={memberInputs[team._id]?.target || ""} 
                            onChange={e => setMemberInputs({...memberInputs, [team._id]: {...memberInputs[team._id], target: e.target.value}})} 
                          />
                        </td>
                        <td>
                          <button 
                            onClick={() => handleAddMember(team._id)} 
                            className="primary" 
                            style={{ padding: "6px 12px", fontSize: isTablet ? "13px" : "14px" }}
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                      {team.members.map(m => (
                        <tr key={m._id}>
                          <td style={{ fontSize: isTablet ? "13px" : "14px" }}>{m.name}</td>
                          <td style={{ fontSize: isTablet ? "13px" : "14px" }}>{m.role}</td>
                          <td style={{ 
                            color: "var(--success)", 
                            fontWeight: 700,
                            fontSize: isTablet ? "13px" : "14px"
                          }}>
                            {m.target}
                          </td>
                          <td>
                            <Trash2 
                              size={16} 
                              color="var(--danger)" 
                              onClick={() => handleDeleteMember(team._id, m._id)} 
                              style={{cursor:'pointer'}}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS & STYLES ---
const StatCard = ({ 
  title, 
  value, 
  icon, 
  isMobile 
}: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode,
  isMobile: boolean 
}) => (
  <div className="card shadow-sm" style={{
    padding: isMobile ? "16px" : "24px"
  }}>
    <div 
      className="text-muted" 
      style={{ 
        fontSize: isMobile ? "12px" : "14px", 
        fontWeight: 600, 
        marginBottom: "8px" 
      }}
    >
      {title}
    </div>
    <div style={{ 
      fontSize: isMobile ? "22px" : "28px", 
      fontWeight: 800, 
      marginBottom: "15px" 
    }}>
      {value}
    </div>
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "10px",
      flexWrap: "wrap"
    }}>
      <div style={{
        width: isMobile ? "32px" : "36px",
        height: isMobile ? "32px" : "36px",
        borderRadius: "10px",
        background: "var(--primary-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {icon}
      </div>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "4px", 
        color: "var(--success)", 
        fontSize: isMobile ? "11px" : "13px", 
        fontWeight: 600 
      }}>
        <TrendingUp size={isMobile ? 12 : 14} /> 0% 
        <span className="text-muted" style={{ fontWeight: 400 }}>vs last month</span>
      </div>
    </div>
  </div>
);

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: 'var(--success)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  zIndex: 1000,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const teamAvatar: React.CSSProperties = {
  width: "40px",
  height: "40px",
  background: "var(--primary)",
  color: "white",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  flexShrink: 0
};

export default SalesTeamPage;