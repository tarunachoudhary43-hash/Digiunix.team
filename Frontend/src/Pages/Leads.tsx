import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Select, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Modal, InputLabel,
  FormControl, Chip, IconButton, InputAdornment, Stack, Divider, TableContainer, Avatar,
  useMediaQuery, useTheme, Card, CardContent
} from "@mui/material";
import {
  FileSpreadsheet, Plus, Search, Trash2, X, Edit3, Eye, Phone, Archive, Copy, RotateCcw
} from "lucide-react";
import * as XLSX from "xlsx";

const LeadsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); 
  const [showEmailView, setShowEmailView] = useState(false); 
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://digiunix-ai-crm-model.onrender.com";

  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", source: "Website", status: "New"
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.leads) setLeads(data.leads);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleArchiveToggle = async (id: string, currentStatus: string) => {
    const isArchived = currentStatus === "Archived";
    const confirmMsg = isArchived 
      ? "Do you want to restore this lead to the active list?" 
      : "Are you sure you want to archive this lead?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: isArchived ? "New" : "Archived" })
      });

      if (res.ok) {
        fetchLeads();
        setShowViewModal(false);
        alert(isArchived ? "Lead restored successfully." : "Lead moved to archive.");
      }
    } catch (err) { console.error("Archive error:", err); }
  };

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      alert("Please fill in the required fields");
      return;
    }
    try {
      const url = editingLead ? `${API_URL}/api/leads/${editingLead._id}` : `${API_URL}/api/leads`;
      const method = editingLead ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        fetchLeads();
        handleCloseAddModal();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/leads/${id}`, { 
        method: "DELETE", headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        setLeads(leads.filter(l => l._id !== id));
        setShowViewModal(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingLead(null);
    setNewLead({ name: "", email: "", phone: "", source: "Website", status: "New" });
  };

  const handleEditFromView = () => {
    setEditingLead(selectedLead);
    setNewLead(selectedLead);
    setShowViewModal(false);
    setShowAddModal(true);
  };

  const exportToExcel = () => {
    if (!leads.length) return alert("No data");
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "Leads_Report.xlsx");
  };

  const getStatusStyle = (status: string) => {
    const map: any = {
      New: { backgroundColor: "#e0f2fe", color: "#0369a1" },
      Contacted: { backgroundColor: "#f3e8ff", color: "#7e22ce" },
      Qualified: { backgroundColor: "#fffbeb", color: "#ca8a04" },
      Converted: { backgroundColor: "#ecfdf5", color: "#059669" },
      Lost: { backgroundColor: "#fef2f2", color: "#dc2626" },
      Archived: { backgroundColor: "#f3f4f6", color: "#4b5563" }
    };
    return map[status] || {};
  };

  const filteredLeads = leads
    .filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            l.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "all") {
        return matchesSearch && l.status !== "Archived";
      }
      return matchesSearch && l.status === filterStatus;
    })
    .sort((a, b) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  const handleCopy = () => {
    const emailText = `Lead ID: ${selectedLead?._id}\nName: ${selectedLead?.name}\nEmail: ${selectedLead?.email}\nPhone: ${selectedLead?.phone}\nSource: ${selectedLead?.source}\nStatus: ${selectedLead?.status}`;
    navigator.clipboard.writeText(emailText);
    alert("Copied to clipboard!");
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 6, md: 0 }, minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        mb={3}
        spacing={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          fontWeight={800}
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
        >
          Leads <span style={{color: 'var(--primary)'}}>Management</span>
        </Typography>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap">
          <Button 
            variant="text" 
            onClick={exportToExcel} 
            startIcon={<FileSpreadsheet size={18} />} 
            sx={{ 
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            {isMobile ? "Export" : "Export"}
          </Button>
          {/* <Button 
            variant="contained" 
            startIcon={<Plus size={18} />} 
            onClick={() => setShowAddModal(true)} 
            sx={{ 
              textTransform: 'none', 
              borderRadius: '8px',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {isMobile ? "New" : "New Lead"}
          </Button> */}
        </Stack>
      </Stack>

      {/* Filters */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        mb={3} 
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          size="small" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ 
            bgcolor: 'white', 
            borderRadius: '8px', 
            minWidth: { xs: '100%', sm: '250px', md: '300px' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Search size={18} /></InputAdornment>
            ),
            sx: { borderRadius: '8px' }
          }}
        />
        <Select
          size="small" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          sx={{ 
            bgcolor: 'white', 
            borderRadius: '8px', 
            minWidth: { xs: '100%', sm: '150px' }
          }}
        >
          <MenuItem value="all">Active Leads</MenuItem>
          {["New", "Contacted", "Qualified", "Converted", "Lost", "Archived"].map(s => (
            <MenuItem key={s} value={s}>{s === "Archived" ? "Archived Leads" : s}</MenuItem>
          ))}
        </Select>
        <IconButton 
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          <Typography variant="body2" sx={{ mr: 0.5, fontWeight: 'bold' }}>Sort</Typography>
          {sortOrder === "asc" ? "↑" : "↓"}
        </IconButton>
      </Stack>

      {/* Table for Desktop/Tablet */}
      {!isMobile && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: "12px", 
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)", 
            border: "1px solid #eee",
            overflow: 'auto'
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Lead</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map(lead => (
                <TableRow key={lead._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                      {lead.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                      {lead.source}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                      {lead.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                      {lead.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={lead.status} 
                      size="small" 
                      sx={{ 
                        ...getStatusStyle(lead.status), 
                        fontWeight: 600, 
                        borderRadius: "4px",
                        fontSize: { xs: '0.7rem', md: '0.75rem' }
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} justifyContent="flex-end">
                      <IconButton 
                        size="small" 
                        onClick={() => { setSelectedLead(lead); setShowEmailView(false); setShowViewModal(true); }}
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => { setEditingLead(lead); setNewLead(lead); setShowAddModal(true); }}
                      >
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => window.open(`tel:${lead.phone}`)}>
                        <Phone size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(lead._id)} color="error">
                        <Trash2 size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleArchiveToggle(lead._id, lead.status)}>
                        {lead.status === "Archived" ? <RotateCcw size={16} color="#059669" /> : <Archive size={16} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View for Mobile */}
      {isMobile && (
        <Stack spacing={2}>
          {filteredLeads.map(lead => (
            <Card key={lead._id} sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight={700}>{lead.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{lead.source}</Typography>
                    </Box>
                    <Chip 
                      label={lead.status} 
                      size="small" 
                      sx={{ ...getStatusStyle(lead.status), fontWeight: 600, fontSize: '0.7rem' }} 
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{lead.email}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>{lead.phone}</Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }}
                      onClick={() => { setSelectedLead(lead); setShowEmailView(false); setShowViewModal(true); }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }}
                      onClick={() => { setEditingLead(lead); setNewLead(lead); setShowAddModal(true); }}
                    >
                      <Edit3 size={16} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }}
                      onClick={() => window.open(`tel:${lead.phone}`)}
                    >
                      <Phone size={16} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: '#ffebee' }}
                      onClick={() => handleDelete(lead._id)}
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }}
                      onClick={() => handleArchiveToggle(lead._id, lead.status)}
                    >
                      {lead.status === "Archived" ? <RotateCcw size={16} color="#059669" /> : <Archive size={16} />}
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* --- LEAD DETAILS MODAL --- */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: 700 }, 
          maxWidth: '700px',
          bgcolor: 'background.paper', 
          borderRadius: '12px', 
          boxShadow: 24, 
          overflow: 'hidden',
          maxHeight: { xs: '90vh', sm: '85vh' },
          overflowY: 'auto'
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1
          }}>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {showEmailView ? "Lead Details - Email Format" : "Lead Details"}
            </Typography>
            <IconButton onClick={() => setShowViewModal(false)}><X size={20} /></IconButton>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {!showEmailView ? (
              <>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                  mb={4}
                >
                  <Avatar sx={{ 
                    width: { xs: 56, sm: 64 }, 
                    height: { xs: 56, sm: 64 }, 
                    bgcolor: '#4285f4', 
                    fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                  }}>
                    {selectedLead?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography 
                      variant="h5" 
                      fontWeight={700}
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                      {selectedLead?.name}
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {selectedLead?.email}
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {selectedLead?.phone}
                    </Typography>
                  </Box>
                </Stack>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={3} 
                  mb={6}
                >
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">SOURCE</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {selectedLead?.source || "Website"}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                    <Box mt={0.5}>
                      <Chip 
                        label={selectedLead?.status} 
                        size="small" 
                        sx={{ 
                          ...getStatusStyle(selectedLead?.status), 
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }} 
                      />
                    </Box>
                  </Box>
                </Stack>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={1.5}
                  flexWrap="wrap"
                >
                  <Button 
                    variant="contained" 
                    fullWidth={isMobile}
                    onClick={() => setShowEmailView(true)} 
                    sx={{ 
                      textTransform: 'none', 
                      bgcolor: '#4285f4',
                      flex: { xs: 'none', sm: 1 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    View More
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth={isMobile}
                    onClick={handleEditFromView} 
                    sx={{ 
                      textTransform: 'none', 
                      bgcolor: '#94a3b8',
                      flex: { xs: 'none', sm: 1 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Edit Lead
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth={isMobile}
                    onClick={() => handleDelete(selectedLead?._id)} 
                    sx={{ 
                      textTransform: 'none', 
                      bgcolor: '#94a3b8',
                      flex: { xs: 'none', sm: 1 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Delete Lead
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    fullWidth={isMobile}
                    onClick={() => handleArchiveToggle(selectedLead?._id, selectedLead?.status)} 
                    sx={{ 
                      textTransform: 'none', 
                      bgcolor: selectedLead?.status === "Archived" ? '#059669' : '#f97316',
                      flex: { xs: 'none', sm: 1 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {selectedLead?.status === "Archived" ? "Restore Lead" : "Archive Lead"}
                  </Button>
                </Stack>
              </>
            ) : (
              <Box>
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: '8px', 
                  mb: 3, 
                  border: '1px solid #ddd',
                  overflowX: 'auto'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      whiteSpace: 'pre-line',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {`Lead ID: ${selectedLead?._id}\nName: ${selectedLead?.name}\nEmail: ${selectedLead?.email}\nPhone: ${selectedLead?.phone}\nSource: ${selectedLead?.source}\nStatus: ${selectedLead?.status}`}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Copy size={18}/>} 
                    onClick={handleCopy} 
                    sx={{ 
                      bgcolor: '#4caf50', 
                      textTransform: 'none',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowEmailView(false)} 
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Back to Details
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal open={showAddModal} onClose={handleCloseAddModal}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          p: { xs: 2.5, sm: 3, md: 4 }, 
          bgcolor: "background.paper", 
          width: { xs: '90%', sm: '80%', md: 450 }, 
          maxWidth: '450px',
          borderRadius: '16px', 
          boxShadow: 24,
          maxHeight: { xs: '90vh', sm: '85vh' },
          overflowY: 'auto'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {editingLead ? "Edit Lead" : "Create Lead"}
            </Typography>
            <IconButton onClick={handleCloseAddModal} size="small"><X size={20} /></IconButton>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={2.5}>
            <TextField 
              fullWidth 
              label="Name" 
              size="small" 
              value={newLead.name} 
              onChange={e => setNewLead({ ...newLead, name: e.target.value })}
              sx={{ '& input': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
            />
            <TextField 
              fullWidth 
              label="Email" 
              size="small" 
              value={newLead.email} 
              onChange={e => setNewLead({ ...newLead, email: e.target.value })}
              sx={{ '& input': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
            />
            <TextField 
              fullWidth 
              label="Phone" 
              size="small" 
              value={newLead.phone} 
              onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
              sx={{ '& input': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select 
                label="Source" 
                value={newLead.source} 
                onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Social Media">Social Media</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select 
                label="Status" 
                value={newLead.status} 
                onChange={e => setNewLead({ ...newLead, status: e.target.value })}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                {["New", "Contacted", "Qualified", "Converted", "Lost", "Archived"].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleCreateLead} 
              sx={{ 
                py: 1, 
                borderRadius: '8px', 
                textTransform: 'none', 
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {editingLead ? "Update Lead" : "Create Lead"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeadsPage;