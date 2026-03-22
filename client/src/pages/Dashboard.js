import React, { Component } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DataTable from '../components/DataTable';
import { getAuthHeaders, clearSession, getSessionUser } from '../utils/helpers';

function DashboardWrapper() {
  const navigate = useNavigate();
  return <Dashboard navigate={navigate} />;
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users:            [],
      page:             1,
      total:            0,
      search:           '',
      message:          '',
      showSessionModal: false,
    };
    this.LIMIT       = 6;
    this.timer       = null;
    this.currentUser = getSessionUser();
    this.canManage   = ['admin', 'lead'].includes(this.currentUser?.role);

    this.fetchUsers        = this.fetchUsers.bind(this);
    this.handleDelete      = this.handleDelete.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleExpiry      = this.handleExpiry.bind(this);
    this.resetTimer        = this.resetTimer.bind(this);
    this.setPage           = this.setPage.bind(this);
  }

  componentDidMount() {
    this.fetchUsers();
    this.startSessionTimer();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search) {
      this.fetchUsers();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach((e) =>
      window.removeEventListener(e, this.resetTimer)
    );
  }

  startSessionTimer() {
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach((e) =>
      window.addEventListener(e, this.resetTimer)
    );
    this.resetTimer();
  }

  resetTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      clearSession();
      this.setState({ showSessionModal: true });
    }, 18000000);
  }

  handleExpiry() {
    clearSession();
    this.props.navigate('/');
  }

  setPage(newPage) {
    this.setState({ page: newPage });
  }

  handleSearchChange(e) {
    this.setState({ search: e.target.value, page: 1 });
  }

  async fetchUsers() {
    const { page, search } = this.state;
    try {
      const res = await axios.get(
        `${API}/api/users?page=${page}&limit=${this.LIMIT}&search=${encodeURIComponent(search)}`,
        { headers: getAuthHeaders() }
      );
      this.setState({ users: res.data.users, total: res.data.total });
    } catch (err) {
      if (err.response?.status === 401) this.handleExpiry();
    }
  }

  async handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API}/api/users/${id}`, { headers: getAuthHeaders() });
      this.setState({ message: 'User deleted successfully!' });
      this.fetchUsers();
    } catch (err) {
      if (err.response?.status === 401) this.handleExpiry();
      else this.setState({ message: 'Error deleting user.' });
    }
  }

  renderPagination(totalPages) {
    const { page } = this.state;
    const btnBase = (disabled) => ({
      height: '34px', padding: '0 14px', borderRadius: '8px',
      border: `1px solid ${disabled ? '#e8f0f1' : '#d4ecee'}`,
      background: disabled ? '#f4fafb' : '#fff',
      color: disabled ? '#c0d4d5' : '#0d3b3d',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '13px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '5px',
    });

    return (
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #cceef0', borderRadius: '10px', padding: '10px 18px', boxShadow: '0 2px 8px rgba(0,206,209,0.07)' }}>
        <span style={{ fontSize: '12.5px', color: '#64748b', minWidth: '160px' }}>
          Showing <strong style={{ color: '#0d3b3d' }}>{this.state.total === 0 ? 0 : (page - 1) * this.LIMIT + 1}-{Math.min(page * this.LIMIT, this.state.total)}</strong> of <strong style={{ color: '#0d3b3d' }}>{this.state.total}</strong> users
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => this.setPage(page - 1)} disabled={page === 1} style={btnBase(page === 1)}>
            {'<'} Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => this.setPage(p)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: p === page ? 'none' : '1px solid #d4ecee', background: p === page ? 'linear-gradient(135deg,#00CED1,#009fa3)' : '#fff', color: p === page ? '#fff' : '#0d3b3d', fontSize: '13px', fontWeight: p === page ? 700 : 500, cursor: 'pointer', boxShadow: p === page ? '0 2px 8px rgba(0,206,209,0.35)' : 'none' }}>
              {p}
            </button>
          ))}
          <button onClick={() => this.setPage(page + 1)} disabled={page >= totalPages} style={btnBase(page >= totalPages)}>
            Next {'>'}
          </button>
        </div>
        <span style={{ fontSize: '12.5px', color: '#64748b', minWidth: '80px', textAlign: 'right' }}>
          Page <strong style={{ color: '#0d3b3d' }}>{page}</strong> of <strong style={{ color: '#0d3b3d' }}>{totalPages}</strong>
        </span>
      </div>
    );
  }

  render() {
    const { users, total, search, message, showSessionModal } = this.state;
    const totalPages = Math.ceil(total / this.LIMIT) || 1;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0fafa' }}>
        <Header />
        <div style={{ flex: 1, padding: '30px', maxWidth: '950px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#0d3b3d', marginBottom: '4px' }}>Dashboard</h2>
          <p style={{ fontSize: '13px', marginBottom: '20px', color: '#475569' }}>
            Welcome, <strong>{this.currentUser?.name}</strong> | Role: <strong style={{ color: '#00CED1' }}>{this.currentUser?.role}</strong>
          </p>

          {message && <p style={{ color: '#00A8AB', fontSize: '13px', marginBottom: '10px' }}>{message}</p>}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {this.canManage && (
              <button onClick={() => this.props.navigate('/add-user')} style={{ background: '#00CED1', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,206,209,0.3)' }}>
                + Add New User
              </button>
            )}
          </div>

          <input
            placeholder="Search by name or username..."
            value={search}
            onChange={this.handleSearchChange}
            style={{ width: '300px', marginBottom: '15px', padding: '8px 12px', borderRadius: '7px', border: '1px solid #cceef0', fontSize: '13px', outline: 'none' }}
          />

          <DataTable
            users={users}
            canManage={this.canManage}
            onEdit={(user) => this.props.navigate(`/edit-user/${user.id}`)}
            onDelete={this.handleDelete}
          />

          {this.renderPagination(totalPages)}
        </div>
        <Footer />

        {showSessionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '32px 28px', maxWidth: '340px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid #ddf0f1' }}>
              <h3 style={{ color: '#0d3b3d', margin: '0 0 8px', fontSize: '17px' }}>Session Expired</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>Please sign in again.</p>
              <button onClick={() => { this.setState({ showSessionModal: false }); this.props.navigate('/'); }} style={{ background: '#00CED1', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                Sign In Again
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default DashboardWrapper;