import React, { Component } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';
import { validatePassword, validateEmail, validatePhone } from '../utils/helpers';

function SignupWrapper() {
  const navigate = useNavigate();
  return <Signup navigate={navigate} />;
}

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form:         { name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' },
      image:        null,
      error:        '',
      popup:        null,
      focusedField: '',
      loading:      false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
  }

  validate() {
    const { form, image } = this.state;
    if (!form.name)                            return 'First name is required';
    if (!form.username)                        return 'Username is required';
    if (!form.email)                           return 'Email is required';
    const emailErr = validateEmail(form.email);
    if (emailErr)                              return emailErr;
    if (!form.phone)                           return 'Phone number is required';
    const phoneErr = validatePhone(form.phone);
    if (phoneErr)                              return phoneErr;
    const pwErr = validatePassword(form.password);
    if (pwErr)                                 return pwErr;
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!image)                                return 'Profile image is required';
    return null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const err = this.validate();
    if (err) return this.setState({ error: err });

    this.setState({ error: '', loading: true });
    try {
      const { form, image } = this.state;
      const formData = new FormData();
      formData.append('name',     form.name);
      formData.append('username', form.username);
      formData.append('email',    form.email);
      formData.append('phone',    form.phone);
      formData.append('password', form.password);
      formData.append('image',    image);

      const res = await axios.post(`${API}/api/auth/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      this.setState({
        popup: {
          message: res.data.message || 'Your account has been created successfully.',
          note:    'Please sign in with the username and password you created.',
        },
      });
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Signup failed.' });
    } finally {
      this.setState({ loading: false });
    }
  }

  inputStyle(field) {
    return {
      width: '100%',
      padding: '8px 12px',
      fontSize: '13px',
      borderRadius: '5px',
      border: `1px solid ${this.state.focusedField === field ? '#00CED1' : '#d4d4d4'}`,
      background: '#fff',
      color: '#1a1a1a',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: this.state.focusedField === field ? '0 0 0 3px rgba(0,206,209,0.12)' : 'none',
      fontFamily: "'Segoe UI', sans-serif",
    };
  }

  render() {
    const { form, error, popup, loading } = this.state;
    const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#3a8a90', marginBottom: '4px' };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(150deg,#eaf8f9 0%,#f5fdfd 55%,#e6f5f6 100%)' }}>
        <Header />
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .signup-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg,#eaf8f9 0%,#f5fdfd 55%,#e6f5f6 100%); font-family: 'Segoe UI', sans-serif; overflow: hidden; }
          .signup-card { animation: fadeUp 0.35s ease forwards; width: 100%; max-width: 350px; background: #ffffff; border-radius: 8px; padding: 24px 28px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,206,209,0.1); border: 1px solid #ddf0f1; box-sizing: border-box; }
          .signup-btn { width: 100%; height: 40px; font-size: 14px; font-weight: 800; border-radius: 5px; border: none; color: #fff; cursor: pointer; letter-spacing: 0.4px; box-shadow: 0 3px 10px rgba(0,206,209,0.28); transition: background 0.2s, box-shadow 0.2s, transform 0.15s; }
          .signup-btn:hover:not(:disabled) { background: #00b5b8 !important; box-shadow: 0 4px 16px rgba(0,206,209,0.38) !important; transform: translateY(-1px); }
          input::placeholder { color: #b8b8b8; font-size: 12.5px; }
        `}</style>

        {popup && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '28px 26px', width: '300px', textAlign: 'center', border: '1px solid #ddf0f1', boxShadow: '0 8px 30px rgba(0,206,209,0.15)' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>Signup Successful!</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>{popup.message}</h3>
              {popup.note && <p style={{ color: '#666', fontSize: '12.5px', margin: '0 0 10px' }}>{popup.note}</p>}
              <button
                onClick={() => this.props.navigate('/login')}
                style={{ width: '100%', height: '38px', fontSize: '13.5px', fontWeight: 700, borderRadius: '5px', border: 'none', background: '#00CED1', color: '#fff', cursor: 'pointer' }}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        <div className="signup-wrap" style={{ flex: 1 }}>
          <div className="signup-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}><BrandLogo size={44} /></div>
              <h2 style={{ margin: '0 0 3px', fontSize: '17px', fontWeight: 700, color: '#000' }}>Create Account</h2>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#00A8AB' }}>Sign up for User Management System</p>
            </div>

            {error && (
              <div style={{ padding: '7px 12px', marginBottom: '10px', borderRadius: '5px', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>!</span> {error}
              </div>
            )}

            <form onSubmit={this.handleSubmit}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>First Name</label>
                  <input name="name" placeholder="Enter first name" value={form.name} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'name' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('name')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Username</label>
                  <input name="username" placeholder="Username" value={form.username} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'username' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('username')} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" placeholder="Enter email address" value={form.email} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'email' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('email')} required />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Phone Number</label>
                <input name="phone" type="tel" placeholder="Enter phone number" value={form.phone} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'phone' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('phone')} maxLength="10" required />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Password</label>
                  <input name="password" type="password" placeholder="Min 8 chars, upper, lower, number, special" value={form.password} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'password' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('password')} required minLength="8" autoComplete="new-password" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={this.handleChange} onFocus={() => this.setState({ focusedField: 'confirmPassword' })} onBlur={() => this.setState({ focusedField: '' })} style={this.inputStyle('confirmPassword')} required autoComplete="new-password" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => this.setState({ image: e.target.files[0] })} required style={{ ...this.inputStyle('file'), padding: '5px 10px', fontSize: '12px', color: '#555', cursor: 'pointer' }} />
              </div>

              <button type="submit" className="signup-btn" disabled={loading} style={{ background: loading ? '#7adee0' : '#00CED1' }}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#ececec' }} />
              <span style={{ fontSize: '10.5px', color: '#c8c8c8' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#ececec' }} />
            </div>

            <p style={{ textAlign: 'center', margin: 0, fontSize: '12.5px', color: '#999' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#00CED1', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default SignupWrapper;