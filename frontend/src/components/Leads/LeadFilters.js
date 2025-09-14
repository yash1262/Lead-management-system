import React, { useState } from 'react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';
import './Leads.css';

const LeadFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    email: '',
    company: '',
    city: '',
    status: '',
    source: '',
    score_min: '',
    score_max: '',
    lead_value_min: '',
    lead_value_max: '',
    created_after: '',
    created_before: '',
    is_qualified: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    
    // Apply filters with debounce
    clearTimeout(window.filterTimeout);
    window.filterTimeout = setTimeout(() => {
      applyFilters(newFilters);
    }, 500);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterValues) => {
    const activeFilters = {};
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== '') {
        // Handle different filter types based on field name
        if (key.includes('_min') || key.includes('_max')) {
          const baseField = key.replace('_min', '').replace('_max', '');
          if (!activeFilters[baseField]) {
            activeFilters[baseField] = {};
          }
          
          if (key.includes('_min')) {
            activeFilters[baseField].gte = Number(value);
          } else {
            activeFilters[baseField].lte = Number(value);
          }
        } else if (key.includes('created_')) {
          if (key === 'created_after') {
            activeFilters.created_at = { ...activeFilters.created_at, gte: value };
          } else if (key === 'created_before') {
            activeFilters.created_at = { ...activeFilters.created_at, lte: value };
          }
        } else if (['email', 'company', 'city'].includes(key)) {
          activeFilters[key] = { contains: value };
        } else if (key === 'is_qualified') {
          activeFilters[key] = { equals: value === 'true' };
        } else {
          activeFilters[key] = { equals: value };
        }
      }
    });

    onFilterChange(activeFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      email: '',
      company: '',
      city: '',
      status: '',
      source: '',
      score_min: '',
      score_max: '',
      lead_value_min: '',
      lead_value_max: '',
      created_after: '',
      created_before: '',
      is_qualified: ''
    };
    setFilters(clearedFilters);
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="lead-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <div className="filter-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={clearFilters}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="filters-content">
        {/* Basic Filters */}
        <div className="filter-row">
          <div className="filter-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              placeholder="Search by email..."
              value={filters.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="filter-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              placeholder="Search by company..."
              value={filters.company}
              onChange={handleInputChange}
            />
          </div>

          <div className="filter-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="Search by city..."
              value={filters.city}
              onChange={handleInputChange}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleSelectChange}
            >
              <option value="">All Status</option>
              {LEAD_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Source</label>
                <select
                  name="source"
                  value={filters.source}
                  onChange={handleSelectChange}
                >
                  <option value="">All Sources</option>
                  {LEAD_SOURCES.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Qualified</label>
                <select
                  name="is_qualified"
                  value={filters.is_qualified}
                  onChange={handleSelectChange}
                >
                  <option value="">All Leads</option>
                  <option value="true">Qualified Only</option>
                  <option value="false">Not Qualified</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Score Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="score_min"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={filters.score_min}
                    onChange={handleInputChange}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="score_max"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={filters.score_max}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Lead Value Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="lead_value_min"
                    placeholder="Min $"
                    min="0"
                    step="0.01"
                    value={filters.lead_value_min}
                    onChange={handleInputChange}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="lead_value_max"
                    placeholder="Max $"
                    min="0"
                    step="0.01"
                    value={filters.lead_value_max}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Created After</label>
                <input
                  type="date"
                  name="created_after"
                  value={filters.created_after}
                  onChange={handleSelectChange}
                />
              </div>

              <div className="filter-group">
                <label>Created Before</label>
                <input
                  type="date"
                  name="created_before"
                  value={filters.created_before}
                  onChange={handleSelectChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            <div className="active-filter-tags">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '') return null;
                
                let displayValue = value;
                if (key === 'status') {
                  displayValue = LEAD_STATUSES.find(s => s.value === value)?.label || value;
                } else if (key === 'source') {
                  displayValue = LEAD_SOURCES.find(s => s.value === value)?.label || value;
                } else if (key === 'is_qualified') {
                  displayValue = value === 'true' ? 'Qualified' : 'Not Qualified';
                }

                return (
                  <span key={key} className="active-filter-tag">
                    {key.replace('_', ' ')}: {displayValue}
                    <button
                      type="button"
                      onClick={() => {
                        const newFilters = { ...filters, [key]: '' };
                        setFilters(newFilters);
                        applyFilters(newFilters);
                      }}
                      aria-label={`Remove ${key} filter`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadFilters;