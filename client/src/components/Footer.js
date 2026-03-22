import React, { Component } from 'react';

class Footer extends Component {
  render() {
    const year = new Date().getFullYear();
    return (
      <footer style={{ background: 'linear-gradient(135deg,#000000 0%,#0d3b3d 100%)', borderTop: '1px solid rgba(0,206,209,0.2)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00CED1', boxShadow: '0 0 6px #00CED1' }} />
          <span style={{ color: '#5eead4', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            User Management System
          </span>
        </div>
        <div style={{ color: '#93a3bb', fontSize: '11px', letterSpacing: '0.5px' }}>
          All systems operational <span style={{ color: '#00CED1', marginLeft: '6px' }}>*</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#93a3bb', fontSize: '11px' }}>
            (c) {year} Developed by <span style={{ color: '#00CED1', fontWeight: 700 }}>SN Pavani</span>
          </div>
          <div style={{ color: '#93a3bb', fontSize: '10px', marginTop: '2px', letterSpacing: '0.5px' }}>
            Powered by React / Node.js
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;