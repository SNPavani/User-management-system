import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSessionUser } from '../utils/helpers';
import API from '../config';

function HeaderWrapper() {
  const navigate = useNavigate();
  return <Header navigate={navigate} />;
}

class Header extends Component {
  handleLogout() {
    clearSession();
    this.props.navigate('/login', { replace: true });
  }

  renderAvatar(currentUser) {
    const imageSrc = currentUser?.imageUrl || (currentUser?.image ? `${API}/uploads/${currentUser.image}` : null);
    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt="profile"
          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00CED1' }}
        />
      );
    }
    return (
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0f172a,#1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(0,206,209,0.4)' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#e2e8f0">
          <path d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Zm0 2c-3.033 0-6 1.54-6 3.5 0 .552.448 1 1 1h10c.552 0 1-.448 1-1 0-1.96-2.967-3.5-6-3.5Z" />
        </svg>
      </div>
    );
  }

  renderNavButton(label, onClick) {
    return (
      <button
        onClick={onClick}
        style={{ background: 'transparent', border: '1.5px solid rgba(0,206,209,0.5)', color: '#00CED1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#00CED1'; e.currentTarget.style.color = '#0a2a2b'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00CED1'; }}
      >
        {label}
      </button>
    );
  }

  render() {
    const { navigate } = this.props;
    const currentUser = getSessionUser();

    return (
      <header style={{ background: 'linear-gradient(135deg,#0a2a2b 0%,#0d3b3d 60%,#0a2a2b 100%)', borderBottom: '2px solid #00CED1', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 20px rgba(0,206,209,0.15)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <polygon points="4,56 32,8 32,32"        fill="#00CED1" opacity="0.15" />
            <polygon points="60,56 32,8 32,32"        fill="#00A8AB" opacity="0.15" />
            <polygon points="4,56 32,32 18,56"        fill="#00CED1" opacity="0.5"  />
            <polygon points="60,56 32,32 46,56"       fill="#0099A8" opacity="0.55" />
            <polygon points="32,8 20,34 32,28"        fill="#00CED1" opacity="0.9"  />
            <polygon points="32,8 44,34 32,28"        fill="#00B8C4" opacity="0.75" />
            <polygon points="32,22 42,36 32,42 22,36" fill="#00CED1" opacity="1"    />
            <polygon points="32,26 38,34 32,38 26,34" fill="#ffffff" opacity="0.55" />
            <polygon points="14,56 32,42 50,56"       fill="#00CED1" opacity="0.3"  />
          </svg>
          <div>
            <div style={{ color: '#00CED1', fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px', lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>
              User Management
            </div>
            <div style={{ color: '#5eead4', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              System
            </div>
          </div>
        </div>

        {currentUser && (
          <>
            <nav>
              <span style={{ color: '#00CED1', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', background: 'rgba(0,206,209,0.1)', border: '1px solid rgba(0,206,209,0.3)', letterSpacing: '0.5px' }}>
                Dashboard
              </span>
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{currentUser.name}</div>
                <div style={{ fontSize: '10px', color: currentUser.role === 'admin' ? '#00CED1' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  {currentUser.role}
                </div>
              </div>
              {this.renderAvatar(currentUser)}
              {this.renderNavButton('Profile',         () => navigate('/profile'))}
              {this.renderNavButton('Change Password', () => navigate('/change-password'))}
              {this.renderNavButton('Logout',          () => this.handleLogout())}
            </div>
          </>
        )}
      </header>
    );
  }
}

export default HeaderWrapper;