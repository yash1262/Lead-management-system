import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import LeadFilters from './LeadFilters';
import LoadingSpinner from '../ui/LoadingSpinner';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';
import './Leads.css';

const LeadsGrid = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('LeadsGrid component rendered');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadsAPI.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const payload = response.data;
      setLeads(payload.data);
      setPagination(prev => ({
        ...prev,
        total: payload.total,
        totalPages: payload.totalPages
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    
    const sortedLeads = [...leads].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
    setLeads(sortedLeads);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead._id || lead.id)));
    }
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.deleteLead(leadId);
        fetchLeads();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      new: 'status-badge status-new',
      contacted: 'status-badge status-contacted',
      qualified: 'status-badge status-qualified',
      lost: 'status-badge status-lost',
      won: 'status-badge status-won'
    };
    return statusClasses[status] || 'status-badge';
  };

  const getSourceBadge = (source) => {
    const sourceClasses = {
      website: 'source-badge source-website',
      facebook_ads: 'source-badge source-facebook',
      google_ads: 'source-badge source-google',
      referral: 'source-badge source-referral',
      events: 'source-badge source-events',
      other: 'source-badge source-other'
    };
    return sourceClasses[source] || 'source-badge';
  };

  if (loading && leads.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="leads-grid-container">
      <div className="leads-header">
        <h1>Leads Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/leads/new')}
        >
          Add New Lead
        </button>
      </div>

      <LeadFilters onFilterChange={handleFilterChange} />

      {error && <div className="error-message">{error}</div>}

      <div className="grid-controls">
        <div className="selected-count">
          {selectedLeads.size > 0 && (
            <span>{selectedLeads.size} lead(s) selected</span>
          )}
        </div>
        
        <div className="per-page-selector">
          <label>Show: </label>
          <select 
            value={pagination.limit} 
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span> per page</span>
        </div>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selectedLeads.size === leads.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('firstName')} className="sortable">
                Name {sortConfig.key === 'first_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Phone</th>
              <th>Company</th>
              <th>Location</th>
              <th onClick={() => handleSort('source')} className="sortable">
                Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('score')} className="sortable">
                Score {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('leadValue')} className="sortable">
                Value {sortConfig.key === 'lead_value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id || lead.id} className={selectedLeads.has(lead._id || lead.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead._id || lead.id)}
                    onChange={() => handleSelectLead(lead._id || lead.id)}
                  />
                </td>
                <td className="name-cell">
                  <strong>{lead.firstName} {lead.lastName}</strong>
                  {lead.isQualified && <span className="qualified-badge">Q</span>}
                </td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.company}</td>
                <td>{lead.city}, {lead.state}</td>
                <td>
                  <span className={getSourceBadge(lead.source)}>
                    {LEAD_SOURCES.find(s => s.value === lead.source)?.label || lead.source}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadge(lead.status)}>
                    {LEAD_STATUSES.find(s => s.value === lead.status)?.label || lead.status}
                  </span>
                </td>
                <td>
                  <div className="score-cell">
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                    <span>{lead.score}</span>
                  </div>
                </td>
                <td>{formatCurrency(lead.leadValue)}</td>
                <td>{formatDate(lead.createdAt)}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => navigate(`/leads/${lead._id || lead.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => navigate(`/leads/${lead._id || lead.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(lead._id || lead.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && !loading && (
          <div className="empty-state">
            <h3>No leads found</h3>
            <p>Get started by creating your first lead.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/leads/new')}
            >
              Add New Lead
            </button>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
          >
            First
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(
                pagination.totalPages - 4, 
                pagination.page - 2
              )) + i;
              
              if (page > pagination.totalPages) return null;
              
              return (
                <button
                  key={page}
                  className={`btn btn-outline ${page === pagination.page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
          >
            Last
          </button>
        </div>
      )}

      <div className="pagination-info">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
      </div>

      {loading && leads.length > 0 && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default LeadsGrid;