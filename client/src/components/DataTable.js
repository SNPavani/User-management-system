import React, { Component } from 'react';

const ROLE_STYLE = {
  admin:   { background: '#e0f7f7', color: '#00929A' },
  lead:    { background: '#eff6ff', color: '#1d4ed8' },
  support: { background: '#fef9c3', color: '#854d0e' },
  user:    { background: '#f1f5f9', color: '#475569' },
};

class DataTable extends Component {
  handleEdit(user) {
    if (!this.props.canManage) {
      alert('Access denied: Only admins and leads can edit users.');
      return;
    }
    this.props.onEdit(user);
  }

  handleDelete(id) {
    if (!this.props.canManage) {
      alert('Access denied: Only admins and leads can delete users.');
      return;
    }
    this.props.onDelete(id);
  }

  renderAvatar(user) {
    if (user.imageUrl) {
      return (
        <img
          src={user.imageUrl}
          alt={user.name}
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00CED1', display: 'block' }}
        />
      );
    }
    const initials = user.name
      ? user.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : '?';
    return (
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0a2a2b,#0d3b3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00CED1', fontWeight: 800, fontSize: '11px', border: '2px solid rgba(0,206,209,0.4)', letterSpacing: '0.5px', flexShrink: 0 }}>
        {initials}
      </div>
    );
  }

  render() {
    const { users = [], canManage } = this.props;

    const th = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#fff', background: '#0a2a2b', borderBottom: '2px solid #00CED1', whiteSpace: 'nowrap' };
    const td = { padding: '10px 12px', fontSize: '13px', color: '#1a1a1a', borderBottom: '1px solid #e8f4f5', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
    const btn = (color) => ({ padding: '5px 11px', borderRadius: '5px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', background: color, color: '#fff', opacity: canManage ? 1 : 0.4, whiteSpace: 'nowrap' });

    return (
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #cceef0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '860px' }}>
          <colgroup>
            <col style={{ width: '52px' }} />
            <col style={{ width: '58px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '175px' }} />
            <col style={{ width: '115px' }} />
            <col style={{ width: '82px' }} />
            <col style={{ width: '118px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Image</th>
              <th style={th}>Name</th>
              <th style={th}>Username</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Role</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index} style={{ background: index % 2 === 0 ? '#fff' : '#f8fdfd' }}>
                  <td style={td}>{user.id}</td>
                  <td style={{ ...td, overflow: 'visible' }}>{this.renderAvatar(user)}</td>
                  <td style={td}><strong>{user.name}</strong></td>
                  <td style={td}>{user.username}</td>
                  <td style={td}>{user.email || '-'}</td>
                  <td style={td}>{user.phone || '-'}</td>
                  <td style={{ ...td, overflow: 'visible' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', ...(ROLE_STYLE[user.role] || ROLE_STYLE.user) }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ ...td, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => this.handleEdit(user)}      style={btn('#00CED1')}>Edit</button>
                      <button onClick={() => this.handleDelete(user.id)} style={btn('#e53e3e')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DataTable;