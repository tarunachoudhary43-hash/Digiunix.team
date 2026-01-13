import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users, Layers, CheckCircle, ChevronDown, ChevronUp,
  Target, TrendingUp, Check, X
} from "lucide-react";
import { Typography, useMediaQuery, useTheme, Button, Box, Chip } from "@mui/material";
import { useProfile } from "../Components/ProfileContext";

interface Member { _id: string; name: string; role: string; target: number; }
interface Team { _id: string; teamName: string; department: string; members: Member[]; }
interface Lead { _id: string; name: string; email: string; status: string; assignedTo: string; }

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
      console.error(err);
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
    fetchLeads();
  }, []);

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalTargetValue = teams.reduce((acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.target, 0), 0);

  const getAssignedLeads = (memberId: string) => {
    return leads.filter(lead => lead.assignedTo === memberId);
  };

  const getCompletedLeads = (memberId: string) => {
    return leads.filter(lead => lead.assignedTo === memberId && lead.status === "Converted");
  };

  const getCompletionPercentage = (memberId: string, target: number) => {
    const completed = getCompletedLeads(memberId).length;
    return target > 0 ? Math.round((completed / target) * 100) : 0;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage < 50) return "#dc2626"; // Red
    if (percentage < 100) return "#ea580c"; // Orange
    return "#059669"; // Green
  };

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

  const tableContainerStyle: React.CSSProperties = {
    padding: isMobile ? "12px" : "20px",
    borderTop: "1px solid var(--border)",
    overflowX: "auto"
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
            View your teams and members managed by admins.
          </p>
        </div>
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
            </div>

            {expandedTeams[team._id] && (
              <div style={tableContainerStyle}>
                {isMobile ? (
                  // Mobile Card View
                  <div>
                    {/* Members List */}
                    {team.members.map(m => {
                      const assignedLeads = getAssignedLeads(m._id);
                      const completedCount = getCompletedLeads(m._id).length;
                      const percentage = getCompletionPercentage(m._id, m.target);
                      const performanceColor = getPerformanceColor(percentage);

                      return (
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
                          <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "14px" }}>{m.name}</strong>
                            <Chip
                              label={`${percentage}%`}
                              size="small"
                              sx={{
                                backgroundColor: performanceColor,
                                color: "white",
                                fontWeight: 700,
                                fontSize: "12px"
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                            Role: {m.role}
                          </div>
                          <div style={{ marginBottom: "8px" }}>
                            <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "14px" }}>
                              Target: {m.target} | Completed: {completedCount}/{assignedLeads.length}
                            </span>
                          </div>

                          {/* Assigned Leads */}
                          {assignedLeads.length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                              <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--primary)" }}>
                                Assigned Leads ({assignedLeads.length}):
                              </div>
                              {assignedLeads.map(lead => (
                                <div
                                  key={lead._id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "6px",
                                    background: "#f9f9f9",
                                    borderRadius: "4px",
                                    marginBottom: "4px",
                                    fontSize: "12px"
                                  }}
                                >
                                  <span>{lead.name} - {lead.status}</span>
                                  {lead.status !== "Converted" && isTeamMember && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => completeLead(lead._id)}
                                      sx={{
                                        minWidth: "auto",
                                        padding: "2px 8px",
                                        fontSize: "10px",
                                        backgroundColor: "#059669",
                                        "&:hover": { backgroundColor: "#047857" }
                                      }}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Desktop Table View
                  <div>
                    <table style={{ width: "100%", minWidth: "600px", marginBottom: "20px" }}>
                      <thead>
                        <tr>
                          <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Name</th>
                          <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Role</th>
                          <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Target</th>
                          <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Progress</th>
                          <th style={{ fontSize: isTablet ? "13px" : "14px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.members.map(m => {
                          const assignedLeads = getAssignedLeads(m._id);
                          const completedCount = getCompletedLeads(m._id).length;
                          const percentage = getCompletionPercentage(m._id, m.target);
                          const performanceColor = getPerformanceColor(percentage);

                          return (
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
                              <td style={{ fontSize: isTablet ? "13px" : "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span>{completedCount}/{assignedLeads.length}</span>
                                  <Chip
                                    label={`${percentage}%`}
                                    size="small"
                                    sx={{
                                      backgroundColor: performanceColor,
                                      color: "white",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      height: "20px"
                                    }}
                                  />
                                </div>
                              </td>
                              <td style={{ fontSize: isTablet ? "13px" : "14px" }}>
                                {assignedLeads.length > 0 && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                      // Toggle showing leads for this member
                                      const memberKey = `show-leads-${m._id}`;
                                      const currentValue = (window as any)[memberKey] || false;
                                      (window as any)[memberKey] = !currentValue;
                                      // Force re-render by updating state
                                      setExpandedTeams(prev => ({ ...prev }));
                                    }}
                                    sx={{
                                      fontSize: "11px",
                                      padding: "4px 8px",
                                      minWidth: "auto"
                                    }}
                                  >
                                    View Leads
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Show leads for members when View Leads is clicked */}
                    {team.members.map(m => {
                      const assignedLeads = getAssignedLeads(m._id);
                      const memberKey = `show-leads-${m._id}`;
                      const showLeads = (window as any)[memberKey] || false;

                      if (!showLeads || assignedLeads.length === 0) return null;

                      return (
                        <div key={`leads-${m._id}`} style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "16px",
                          marginBottom: "16px"
                        }}>
                          <h4 style={{
                            margin: "0 0 12px 0",
                            fontSize: "14px",
                            color: "var(--primary)"
                          }}>
                            {m.name}'s Assigned Leads:
                          </h4>
                          <div style={{ display: "grid", gap: "8px" }}>
                            {assignedLeads.map(lead => (
                              <div
                                key={lead._id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 12px",
                                  background: lead.status === "Converted" ? "#f0fdf4" : "#fef3c7",
                                  border: `1px solid ${lead.status === "Converted" ? "#bbf7d0" : "#fde68a"}`,
                                  borderRadius: "6px",
                                  fontSize: "13px"
                                }}
                              >
                                <div>
                                  <strong>{lead.name}</strong> - {lead.status}
                                  {lead.status === "Converted" && (
                                    <span style={{ color: "var(--success)", marginLeft: "8px", fontSize: "11px" }}>
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                                {lead.status !== "Converted" && isTeamMember && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => completeLead(lead._id)}
                                    sx={{
                                      fontSize: "11px",
                                      padding: "4px 12px",
                                      backgroundColor: "#059669",
                                      "&:hover": { backgroundColor: "#047857" }
                                    }}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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