# TODO: Implement Lead Assignment and Completion Tracking

## Leads.tsx Updates
- [x] Fetch sales teams and members in useEffect
- [x] Add state for teams and members
- [x] Add "Assigned To" column in the leads table with dropdown for team members
- [x] Add assignedTo field in mobile card view
- [x] Display assignedTo in lead details modal
- [x] Add function to update lead's assignedTo via API
- [x] Update newLead state to include assignedTo
- [x] Add assignedTo dropdown in add/edit modal

## SalesTeamPage.tsx Updates
- [x] Fetch leads and group by assignedTo for each member
- [x] Display assigned leads count for each member
- [x] Add "Add" button for each member (placeholder)
- [x] Show list of assigned leads with "Complete" button
- [x] Implement complete lead functionality (set status to "Converted")
- [x] Calculate completion percentage: (completed leads / target) * 100
- [x] Apply color coding: Red (<50%), Orange (<100%), Green (>=100%)
- [x] Update member display with color based on percentage
