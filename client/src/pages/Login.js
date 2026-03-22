import React, { Component } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login navigate={navigate} />;
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form:         { username: '', password: '' },
      error:        '',
      loading:      false,
      focusedField: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { form } = this.state;
    const username = form.username.trim();
    const password = form.password.trim();
    if (!username) return this.setState({ error: 'Username is required' });
    if (!password) return this.setState({ error: 'Password is required' });

    this.setState({ error: '', loading: true });
    try {
      const res = await axios.post(
        `${API}/api/auth/login`,
        { username, password },
        { headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' } }
      );
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      this.props.navigate('/dashboard');
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Login failed. Please check your credentials.' });
    } finally {
      this.setState({ loading: false });
    }
  }

  inputStyle(field) {
    return {
      width: '100%',
      padding: '10px 12px',
      fontSize: '13px',
      borderRadius: '6px',
      border: `1px solid ${this.state.focusedField === field ? '#00CED1' : 'rgba(255,255,255,0.2)'}`,
      background: 'rgba(255,255,255,0.08)',
      color: '#e8f5f5',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: this.state.focusedField === field ? '0 0 0 3px rgba(0,206,209,0.2)' : 'none',
      fontFamily: "'Segoe UI', sans-serif",
    };
  }

  render() {
    const { form, error, loading } = this.state;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg,#071d1f 0%,#0b2f32 45%,#0a2022 100%)' }}>
        <Header />
        <style>{`
          .login-wrap { position: fixed; inset: 0; padding: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg,#071d1f 0%,#0b2f32 45%,#0a2022 100%); font-family: 'Segoe UI', sans-serif; overflow: hidden; }
          .login-card { width: 100%; max-width: 380px; background: rgba(255,255,255,0.08); border-radius: 14px; padding: 32px 30px 26px; box-shadow: 0 6px 18px rgba(0,0,0,0.25); border: 1px solid rgba(0,206,209,0.18); box-sizing: border-box; }
          .login-btn  { width: 100%; height: 42px; font-size: 14px; font-weight: 800; border-radius: 6px; border: none; color: #0a2022; cursor: pointer; letter-spacing: 0.4px; transition: none; }
          .login-btn:hover:not(:disabled) { background: #00CED1; }
          input::placeholder { color: #b8b8b8; font-size: 12.5px; }
        `}</style>

        <div className="login-wrap" style={{ flex: 1 }}>
          <div className="login-card">
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ marginBottom: '10px' }}><BrandLogo size={48} /></div>
              <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#e8f5f5', letterSpacing: '-0.2px' }}>Welcome Back</h2>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 500, color: '#7de5e8' }}>Sign in to User Management System</p>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(255,245,245,0.15)', border: '1px solid #fecaca', color: '#fecaca', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>!</span> {error}
              </div>
            )}

            <form onSubmit={this.handleSubmit}>
              <div style={{ marginBottom: '11px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#9ee7ea', marginBottom: '5px' }}>Username / Email / Phone</label>
                <input
                  name="username"
                  placeholder="Enter your username, email, or phone"
                  value={form.username}
                  onChange={this.handleChange}
                  onFocus={() => this.setState({ focusedField: 'username' })}
                  onBlur={() => this.setState({ focusedField: '' })}
                  style={this.inputStyle('username')}
                  autoComplete="username"
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#9ee7ea', marginBottom: '5px' }}>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={this.handleChange}
                  onFocus={() => this.setState({ focusedField: 'password' })}
                  onBlur={() => this.setState({ focusedField: '' })}
                  style={this.inputStyle('password')}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="login-btn" disabled={loading} style={{ background: loading ? '#7adee0' : '#00CED1' }}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
              <span style={{ fontSize: '10.5px', color: '#9fbfc1' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <p style={{ textAlign: 'right', margin: '0 0 6px', fontSize: '12px', color: '#9fbfc1' }}>
              Forgot password? <span style={{ color: '#00CED1', fontWeight: 700 }}>Contact admin to reset.</span>
            </p>
            <p style={{ textAlign: 'center', margin: 0, fontSize: '12.5px', color: '#9fbfc1' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#00CED1', fontWeight: 700, textDecoration: 'none' }}>Signup</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default LoginWrapper;