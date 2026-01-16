import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Select, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Modal, InputLabel,
  FormControl, Chip, IconButton, InputAdornment, Stack, Divider, TableContainer, Avatar,
  useMediaQuery, useTheme, Card, CardContent
} from "@mui/material";
import {
  FileSpreadsheet, Search, Trash2, X, Edit3, Eye, Phone, Archive, Copy, RotateCcw
} from "lucide-react";
import * as XLSX from "xlsx";

const LeadsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); 
  const [showEmailView, setShowEmailView] = useState(false); 
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://digiunix-ai-crm-model.onrender.com";

  // State for editing existing leads
  const [editFormData, setEditFormData] = useState({
    name: "", email: "", phone: "", source: "", status: ""
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
      }
    } catch (err) { console.error("Archive error:", err); }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    try {
      const res = await fetch(`${API_URL}/api/leads/${editingLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        fetchLeads();
        handleCloseEditModal();
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingLead(null);
  };

  const openEditModal = (lead: any) => {
    setEditingLead(lead);
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status
    });
    setShowViewModal(false);
    setShowEditModal(true);
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
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
          Leads <span style={{color: 'var(--primary)'}}>Management</span>
        </Typography>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }}>
          <Button 
            variant="outlined" 
            onClick={exportToExcel} 
            startIcon={<FileSpreadsheet size={18} />} 
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Export to Excel
          </Button>
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
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ bgcolor: 'white', borderRadius: '8px', minWidth: { xs: '100%', sm: '300px' } }}
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
          sx={{ bgcolor: 'white', borderRadius: '8px', minWidth: { xs: '100%', sm: '180px' } }}
        >
          <MenuItem value="all">Active Leads</MenuItem>
          {["New", "Contacted", "Qualified", "Converted", "Lost", "Archived"].map(s => (
            <MenuItem key={s} value={s}>{s === "Archived" ? "Archived Leads" : s}</MenuItem>
          ))}
        </Select>
        <IconButton 
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          sx={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}
        >
          <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 'bold' }}>Sort</Typography>
          {sortOrder === "asc" ? "↑" : "↓"}
        </IconButton>
      </Stack>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Lead</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map(lead => (
                <TableRow key={lead._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{lead.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.source}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{lead.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={lead.status} size="small" sx={{ ...getStatusStyle(lead.status), fontWeight: 600, borderRadius: "4px" }} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => { setSelectedLead(lead); setShowEmailView(false); setShowViewModal(true); }}>
                        <Eye size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => openEditModal(lead)}>
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

      {/* Mobile Cards */}
      {isMobile && (
        <Stack spacing={2}>
          {filteredLeads.map(lead => (
            <Card key={lead._id} sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>{lead.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.source}</Typography>
                  </Box>
                  <Chip label={lead.status} size="small" sx={{ ...getStatusStyle(lead.status), fontWeight: 600 }} />
                </Box>
                <Typography variant="body2">{lead.email}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{lead.phone}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => { setSelectedLead(lead); setShowEmailView(false); setShowViewModal(true); }}><Eye size={16} /></IconButton>
                  <IconButton size="small" onClick={() => openEditModal(lead)}><Edit3 size={16} /></IconButton>
                  <IconButton size="small" onClick={() => window.open(`tel:${lead.phone}`)}><Phone size={16} /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(lead._id)}><Trash2 size={16} color="red"/></IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* VIEW MODAL */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', md: 600 }, bgcolor: 'background.paper', borderRadius: '12px', p: 4 }}>
            {!showEmailView ? (
              <>
                <Typography variant="h5" fontWeight={700} mb={1}>{selectedLead?.name}</Typography>
                <Typography color="text.secondary" mb={3}>{selectedLead?.email} • {selectedLead?.phone}</Typography>
                <Stack direction="row" spacing={2} mb={4}>
                  <Box>
                    <Typography variant="caption" fontWeight={700}>SOURCE</Typography>
                    <Typography variant="body1">{selectedLead?.source}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700}>STATUS</Typography>
                    <Box><Chip label={selectedLead?.status} size="small" sx={getStatusStyle(selectedLead?.status)}/></Box>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() => setShowEmailView(true)} sx={{ textTransform: 'none' }}>Copy Data</Button>
                  <Button variant="outlined" onClick={() => openEditModal(selectedLead)} sx={{ textTransform: 'none' }}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => handleDelete(selectedLead?._id)} sx={{ textTransform: 'none' }}>Delete</Button>
                </Stack>
              </>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', p: 2, bgcolor: '#f5f5f5', borderRadius: '8px', mb: 2, whiteSpace: 'pre-line' }}>
                  {`ID: ${selectedLead?._id}\nName: ${selectedLead?.name}\nEmail: ${selectedLead?.email}\nPhone: ${selectedLead?.phone}\nStatus: ${selectedLead?.status}`}
                </Typography>
                <Button fullWidth variant="contained" startIcon={<Copy size={16}/>} onClick={handleCopy} sx={{ mb: 1 }}>Copy</Button>
                <Button fullWidth onClick={() => setShowEmailView(false)}>Back</Button>
              </Box>
            )}
        </Box>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={showEditModal} onClose={handleCloseEditModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, bgcolor: "background.paper", width: { xs: '90%', sm: 400 }, borderRadius: '16px' }}>
          <Typography variant="h6" fontWeight={700} mb={3}>Edit Lead Details</Typography>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Name" size="small" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
            <TextField fullWidth label="Email" size="small" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} />
            <TextField fullWidth label="Phone" size="small" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}>
                {["New", "Contacted", "Qualified", "Converted", "Lost", "Archived"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth onClick={handleUpdateLead} sx={{ py: 1.2, fontWeight: 600 }}>Save Changes</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeadsPage;