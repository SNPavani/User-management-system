import React, { Component } from 'react';
import axios from 'axios';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPassword: '',
      newPassword:     '',
      confirm:         '',
      error:           '',
      success:         '',
      loading:         false,
      showCurrent:     false,
      showNew:         false,
      showConfirm:     false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  }

  validate() {
    const { currentPassword, newPassword, confirm } = this.state;
    if (!currentPassword)             return 'Current password is required.';
    if (!newPassword)                 return 'New password is required.';
    if (newPassword.length < 8)       return 'New password must be at least 8 characters.';
    if (!/[A-Z]/.test(newPassword))   return 'Include at least one uppercase letter.';
    if (!/[a-z]/.test(newPassword))   return 'Include at least one lowercase letter.';
    if (!/[0-9]/.test(newPassword))   return 'Include at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return 'Include at least one special character.';
    if (newPassword === currentPassword) return 'New password must be different from your current password.';
    if (!confirm)                     return 'Please confirm your new password.';
    if (newPassword !== confirm)      return 'Passwords do not match.';
    return null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const err = this.validate();
    if (err) return this.setState({ error: err });

    this.setState({ loading: true, error: '', success: '' });
    try {
      await axios.put(
        `${API}/api/auth/change-password`,
        { currentPassword: this.state.currentPassword, newPassword: this.state.newPassword },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      this.setState({ success: 'Password changed successfully.', currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Unable to change password.' });
    } finally {
      this.setState({ loading: false });
    }
  }

  renderField(label, name, showKey, value) {
    const show = this.state[showKey];
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#3a8a90', marginBottom: '5px' }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={this.handleChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            autoComplete="new-password"
            style={{ width: '100%', padding: '10px 42px 10px 12px', fontSize: '13px', borderRadius: '7px', border: '1px solid #cceef0', background: '#fff', boxSizing: 'border-box', outline: 'none', fontFamily: "'Segoe UI', sans-serif" }}
          />
          <button
            type="button"
            onClick={() => this.setState({ [showKey]: !show })}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {show ? <EyeOpen /> : <EyeClosed />}
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { currentPassword, newPassword, confirm, error, success, loading } = this.state;

    const isStrong   = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isDifferent = newPassword !== '' && newPassword !== currentPassword;
    const isMatching  = confirm !== '' && newPassword === confirm;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0fafa' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '400px', background: '#fff', padding: '30px 28px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,206,209,0.08)', border: '1px solid #cceef0' }}>

            <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#0d3b3d', fontWeight: 700 }}>Change Password</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>Enter your current password and choose a strong new one.</p>

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', padding: '10px 14px', borderRadius: '7px', color: '#e53e3e', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', padding: '10px 14px', borderRadius: '7px', color: '#276749', fontSize: '13px', marginBottom: '16px' }}>
                {success}
              </div>
            )}

            <form onSubmit={this.handleSubmit}>
              {this.renderField('Current Password', 'currentPassword', 'showCurrent', currentPassword)}
              {this.renderField('New Password',     'newPassword',     'showNew',     newPassword)}
              {this.renderField('Confirm Password', 'confirm',         'showConfirm', confirm)}

              {newPassword && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[
                    [isStrong,    'Strong'],
                    [isDifferent, 'Different'],
                    [isMatching,  'Matching'],
                  ].map(([met, label]) => (
                    <div key={label} style={{ flex: 1, padding: '6px 0', borderRadius: '6px', background: met ? '#f0fff4' : '#f8fafc', border: `1px solid ${met ? '#9ae6b4' : '#e2e8f0'}`, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '11.5px', fontWeight: 600, color: met ? '#276749' : '#94a3b8' }}>
                        {met ? '✓' : '○'} {label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', height: '42px', background: loading ? '#7adee0' : '#00CED1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>

              <button
                type="button"
                onClick={() => window.history.back()}
                style={{ width: '100%', height: '38px', background: '#fff', color: '#0d3b3d', border: '1px solid #cceef0', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                Go Back
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default ChangePassword;