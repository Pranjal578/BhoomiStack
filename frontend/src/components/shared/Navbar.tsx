import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, ShieldCheck, FileText, LayoutDashboard, UserCheck, LogOut, ChevronDown, Layers, Search } from 'lucide-react';
import { useAuthStore, useParcelStore } from '../../store';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { setActiveUlpin } = useParcelStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    const cleanUlpin = navSearch.trim().toUpperCase();
    setActiveUlpin(cleanUlpin);
    navigate(`/map?ulpin=${cleanUlpin}`);
    setNavSearch('');
  };

  const roleDisplayNames: Record<string, string> = {
    citizen: 'Citizen Portal',
    revenue_officer: 'Revenue Tehsildar',
    planning_officer: 'Town Planner',
    municipal_officer: 'Municipal Officer',
    admin: 'Govt Admin'
  };

  return (
    <header className="navbar" role="banner">
      <Link to="/" className="navbar-brand" id="nav-brand">
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          boxShadow: '0 2px 8px rgba(26,86,219,0.4)'
        }}>
          भू
        </div>
        <div>
          <span className="navbar-logo">Bhoomi<span>Stack</span></span>
          <span className="navbar-tagline">National Land DPI</span>
        </div>
      </Link>

      <nav className="navbar-nav" aria-label="Main Navigation">
        <Link
          to="/map"
          id="nav-map"
          className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
        >
          <Map size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          GIS Parcel Explorer
        </Link>

        <Link
          to="/verify"
          id="nav-verify"
          className={`nav-link ${location.pathname.startsWith('/verify') ? 'active' : ''}`}
        >
          <ShieldCheck size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          Public Verification
        </Link>

        <Link
          to="/documents"
          id="nav-documents"
          className={`nav-link ${location.pathname === '/documents' ? 'active' : ''}`}
        >
          <FileText size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          Doc Intelligence
        </Link>

        {/* Dashboard Dropdown */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setDropdownOpen(false)}>
          <button
            id="nav-dashboards-menu"
            type="button"
            className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <LayoutDashboard size={16} />
            Department Portals
            <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 0',
              minWidth: 220,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 1100
            }}>
              <Link
                to="/dashboard/revenue"
                id="nav-sub-revenue"
                className="nav-link"
                style={{ display: 'block', padding: '8px 16px', borderRadius: 0, textAlign: 'left' }}
                onClick={() => setDropdownOpen(false)}
              >
                🌾 Revenue & Mutation (Bhulekh)
              </Link>
              <Link
                to="/dashboard/planning"
                id="nav-sub-planning"
                className="nav-link"
                style={{ display: 'block', padding: '8px 16px', borderRadius: 0, textAlign: 'left' }}
                onClick={() => setDropdownOpen(false)}
              >
                📐 Planning & Zoning (Development)
              </Link>
              <Link
                to="/dashboard/municipal"
                id="nav-sub-municipal"
                className="nav-link"
                style={{ display: 'block', padding: '8px 16px', borderRadius: 0, textAlign: 'left' }}
                onClick={() => setDropdownOpen(false)}
              >
                🏛️ Municipal & Tax Records
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/admin"
          id="nav-admin"
          className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <Layers size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          Admin & Audit
        </Link>
      </nav>

      {/* Quick search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '4px 12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <Search size={14} color="#94a3b8" />
          <input
            id="nav-quick-search"
            type="text"
            placeholder="Quick ULPIN / Khasra..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 12,
              paddingLeft: 8,
              width: 150
            }}
          />
        </div>
      </form>

      {/* Auth / Persona switch */}
      <div className="navbar-right">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`role-badge ${user.role}`}>
              {roleDisplayNames[user.role] || user.role}
            </span>
            <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
              {user.name}
            </span>
            <button
              id="btn-logout"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearAuth();
                navigate('/');
              }}
              title="Logout"
              style={{ padding: '4px 8px', color: '#cbd5e1' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            id="nav-login-btn"
            className="btn btn-accent btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <UserCheck size={14} />
            Switch Persona
          </Link>
        )}
      </div>
    </header>
  );
}
