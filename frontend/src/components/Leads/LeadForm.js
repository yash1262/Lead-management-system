import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { LEAD_SOURCES, LEAD_STATUSES, US_STATES } from '../../utils/constants';
import LoadingSpinner from '../ui/LoadingSpinner';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    source: 'website',
    status: 'new',
    score: 0,
    leadValue: 0,
    isQualified: false,
    lastActivityAt: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getLead(id);
      const leadData = response.data.lead;
      
      // Map backend field names to frontend field names
      const mappedData = {
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company || '',
        city: leadData.city || '',
        state: leadData.state || '',
        source: leadData.source || 'website',
        status: leadData.status || 'new',
        score: leadData.score || 0,
        leadValue: leadData.leadValue || 0,
        isQualified: leadData.isQualified || false,
        lastActivityAt: leadData.lastActivityAt ? new Date(leadData.lastActivityAt).toISOString().slice(0, 16) : ''
      };
      
      setFormData(mappedData);
    } catch (error) {
      setSubmitError('Failed to fetch lead data');
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchLead();
    }
  }, [id, isEditMode, fetchLead]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    // Score validation
    const score = parseInt(formData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      newErrors.score = 'Score must be a number between 0 and 100';
    }

    // Lead value validation
    const leadValue = parseFloat(formData.leadValue);
    if (isNaN(leadValue) || leadValue < 0) {
      newErrors.leadValue = 'Lead value must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for submission - map frontend field names to backend field names
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        city: formData.city,
        state: formData.state,
        source: formData.source,
        status: formData.status,
        score: parseInt(formData.score),
        leadValue: parseFloat(formData.leadValue),
        isQualified: formData.isQualified,
        lastActivityAt: formData.lastActivityAt || null
      };

      if (isEditMode) {
        console.log('Updating lead with data:', submitData);
        await leadsAPI.updateLead(id, submitData);
      } else {
        console.log('Creating lead with data:', submitData);
        await leadsAPI.createLead(submitData);
      }

      // Navigate back to leads list
      navigate('/leads');
    } catch (error) {
      const message = error.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} lead`;
      setSubmitError(message);
      console.error('Error saving lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  if (loading && isEditMode && !formData.email) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lead-form-container">
      <h2>{isEditMode ? 'Edit Lead' : 'Create New Lead'}</h2>
      
      {submitError && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <div className="error-message">{errors.firstName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <div className="error-message">{errors.lastName}</div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <div className="error-message">{errors.phone}</div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="form-group">
          <label htmlFor="company">Company *</label>
          <input
            type="text"
            id="company"
            name="company"
            className="form-control"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter company name"
          />
          {errors.company && (
            <div className="error-message">{errors.company}</div>
          )}
        </div>

        {/* Location */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              className="form-control"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
            {errors.city && (
              <div className="error-message">{errors.city}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <select
              id="state"
              name="state"
              className="form-control"
              value={formData.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <div className="error-message">{errors.state}</div>
            )}
          </div>
        </div>

        {/* Lead Details */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              className="form-control"
              value={formData.source}
              onChange={handleChange}
            >
              {LEAD_SOURCES.map(source => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              {LEAD_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="score">Score (0-100)</label>
            <input
              type="number"
              id="score"
              name="score"
              className="form-control"
              value={formData.score}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="Enter score"
            />
            {errors.score && (
              <div className="error-message">{errors.score}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="leadValue">Lead Value ($)</label>
            <input
              type="number"
              id="leadValue"
              name="leadValue"
              className="form-control"
              value={formData.leadValue}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter lead value"
            />
            {errors.leadValue && (
              <div className="error-message">{errors.leadValue}</div>
            )}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lastActivityAt">Last Activity</label>
            <input
              type="datetime-local"
              id="lastActivityAt"
              name="lastActivityAt"
              className="form-control"
              value={formData.lastActivityAt}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem' }}>
            <input
              type="checkbox"
              id="isQualified"
              name="isQualified"
              checked={formData.isQualified}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="isQualified">Is Qualified</label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Lead' : 'Create Lead')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;