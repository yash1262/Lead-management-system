import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <h2>LeadManager</h2>
          </div>
          
          {user && (
            <nav className="main-nav">
              <button 
                className={`nav-link ${isActive('/leads') ? 'active' : ''}`}
                onClick={() => navigate('/leads')}
              >
                Leads
              </button>
            </nav>
          )}
        </div>

        {user && (
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
              </div>
              <div className="user-details">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            
            <div className="user-menu">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;