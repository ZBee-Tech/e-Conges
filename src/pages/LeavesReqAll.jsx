import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import { CSVLink } from 'react-csv';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase-config';
import DeleteIcon from '@mui/icons-material/Delete';

const LeavesReq = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId } = location.state || {};

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [recordCount, setRecordCount] = useState(10);
  const [exportData, setExportData] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const q = query(collection(db, 'leaveRequests'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
      setFilteredRequests(requests.slice(0, recordCount));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleOrganizationChange = (e) => {
    const selectedOrganization = e.target.value;
    setOrganizationFilter(selectedOrganization);
    filterLeaveRequests(selectedOrganization, recordCount);
  };

  const handleRecordCountChange = (e) => {
    const selectedCount = e.target.value;
    setRecordCount(selectedCount);
    filterLeaveRequests(organizationFilter, selectedCount);
  };

  const filterLeaveRequests = (organization, count) => {
    let filtered = leaveRequests;
    if (organization) {
      filtered = leaveRequests.filter(
        (request) => request.organizationID === organization
      );
    }
    setFilteredRequests(filtered.slice(0, count));
  };

  useEffect(() => {
    const dataToExport = filteredRequests.map((request) => ({
      FullName: request.fullName,
      LeaveType: request.leaveType,
      StartDate: request.startDate?.toDate().toLocaleDateString(),
      EndDate: request.endDate?.toDate().toLocaleDateString(),
      Reason: request.reason,
      Status: request.Status === 1 ? 'Approved' : 'Pending',
      HodStatus: request.HodStatus === 1 ? 'Approved' : 'Pending',
      HrStatus: request.HrStatus === 1 ? 'Approved' : 'Pending',
      CeoStatus: request.CeoStatus === 1 ? 'Approved' : 'Pending',
      Organization: request.organizationID,
      CreatedBy: request.createdBy,
      CreatedAt: request.createdAt?.toDate().toLocaleString(),
    }));
    setExportData(dataToExport);
  }, [filteredRequests]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'leaveRequests', id));
      fetchLeaveRequests();  
    } catch (error) {
      console.error('Error deleting leave request:', error);
    }
  };

  return (
    <Paper style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Leave Requests
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <FormControl style={{ marginRight: '20px', minWidth: '200px' }}>
          <p>Organization</p>
          <Select
            value={organizationFilter}
            onChange={handleOrganizationChange}
            displayEmpty
          >
            <MenuItem value="">All Organizations</MenuItem>
            {[...new Set(leaveRequests.map((req) => req.organizationID))].map(
              (organization, index) => (
                <MenuItem key={index} value={organization}>
                  {organization}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: '20px', minWidth: '100px' }}>
          <p>Records</p>
          <Select
            value={recordCount}
            onChange={handleRecordCountChange}
            displayEmpty
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        <CSVLink data={exportData} filename="leave_requests.csv">
          <Button variant="contained" color="primary">
            Export as CSV
          </Button>
        </CSVLink>
      </div>

      <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Leave Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>HOD Status</TableCell>
            <TableCell>HR Status</TableCell>
            <TableCell>CEO Status</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Organization</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.fullName}</TableCell>
              <TableCell>{request.leaveType}</TableCell>
              <TableCell>{request.startDate?.toDate().toLocaleDateString()}</TableCell>
              <TableCell>{request.endDate?.toDate().toLocaleDateString()}</TableCell>
              <TableCell>{request.reason}</TableCell>
              <TableCell>{request.HodStatus === 1 ? 'Approved' : 'Pending'}</TableCell>
              <TableCell>{request.HrStatus === 1 ? 'Approved' : 'Pending'}</TableCell>
              <TableCell>{request.CeoStatus === 1 ? 'Approved' : 'Pending'}</TableCell>
              <TableCell>{request.Status === 1 ? 'Approved' : 'Pending'}</TableCell>
              <TableCell>{request.organizationID}</TableCell>
              <TableCell>{request.createdAt?.toDate().toLocaleString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(request.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default LeavesReq;
