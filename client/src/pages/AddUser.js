import React, { Component } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AddUserWrapper() {
  const navigate = useNavigate();
  return <AddUser navigate={navigate} />;
}

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name:            '',
      username:        '',
      email:           '',
      phone:           '',
      password:        '',
      role:            'user',
      image:           null,
      imagePreview:    null,
      createdPassword: '',
      message:         '',
      error:           '',
      loading:         false,
    };
    this.handleChange   = this.handleChange.bind(this);
    this.handleImage    = this.handleImage.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
    this.handleSubmit   = this.handleSubmit.bind(this);
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      'bypass-tunnel-reminder': 'true',
    };
  }

  handleChange(e) {
    const { name, value } = e.target;
    const coreFields = ['name', 'username', 'email'];
    if (coreFields.includes(name)) {
      this.setState({ [name]: value, password: '', createdPassword: '', error: '' });
    } else {
      this.setState({ [name]: value, error: '' });
    }
  }

  handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.setState({ error: 'Only JPEG, PNG, or WebP images allowed (max 2MB).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.setState({ error: 'Image must be 2MB or smaller.' });
      return;
    }
    this.setState({ image: file, imagePreview: URL.createObjectURL(file), error: '' });
  }

  isFormReady() {
    const { name, username, email } = this.state;
    return name.trim() !== '' && username.trim() !== '' && email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  }

  generateStrongPassword() {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower   = 'abcdefghijkmnopqrstuvwxyz';
    const digits  = '0123456789';
    const special = '!@#$%&*?';
    const all     = upper + lower + digits + special;
    const pick    = (pool) => pool[Math.floor(Math.random() * pool.length)];
    const base    = [pick(upper), pick(lower), pick(digits), pick(special)];
    while (base.length < 10) base.push(pick(all));
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return base.join('');
  }

  handleGenerate() {
    const { name, username, email, phone } = this.state;
    if (!name.trim())                         return this.setState({ error: 'Please fill in Full Name before generating.' });
    if (!username.trim())                     return this.setState({ error: 'Please fill in Username before generating.' });
    if (!email.trim())                        return this.setState({ error: 'Please fill in Email before generating.' });
    if (!/\S+@\S+\.\S+/.test(email))          return this.setState({ error: 'Please enter a valid email address first.' });
    if (phone && !/^\d{10}$/.test(phone))     return this.setState({ error: 'Fix Phone number before generating.' });
    this.setState({ password: this.generateStrongPassword(), createdPassword: '', error: '' });
  }

  validate() {
    const { name, username, email, phone, password } = this.state;
    if (!name.trim())                                  return 'Name is required.';
    if (!username.trim())                              return 'Username is required.';
    if (!email.trim())                                 return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email))                  return 'Enter a valid email address.';
    if (phone && !/^\d{10}$/.test(phone))              return 'Phone must be exactly 10 digits.';
    if (!password)                                     return 'Please generate a temporary password first.';
    if (password.length < 8)                           return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password))                       return 'Password must include an uppercase letter.';
    if (!/[a-z]/.test(password))                       return 'Password must include a lowercase letter.';
    if (!/[0-9]/.test(password))                       return 'Password must include a number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))     return 'Password must include a special character.';
    return null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const err = this.validate();
    if (err) return this.setState({ error: err });

    const { name, username, email, phone, password, role, image } = this.state;
    this.setState({ loading: true });
    try {
      const formData = new FormData();
      formData.append('name',     name);
      formData.append('username', username.trim());
      formData.append('password', password);
      formData.append('role',     role);
      formData.append('email',    email);
      formData.append('phone',    phone);
      if (image) formData.append('image', image);

      await axios.post(`${API}/api/users`, formData, {
        headers: { ...this.getHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      this.setState({
        message: 'User added successfully!', createdPassword: password,
        name: '', username: '', email: '', phone: '',
        password: '', role: 'user', image: null, imagePreview: null,
      });
      setTimeout(() => this.props.navigate('/dashboard'), 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        this.props.navigate('/');
      } else {
        this.setState({ error: err.response?.data?.message || 'Error adding user. Please try again.' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { name, username, email, phone, password, role, imagePreview, message, error, loading, createdPassword } = this.state;
    const canGenerate = this.isFormReady();

    const inputStyle = {
      width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '7px',
      border: '1px solid #cceef0', background: '#fff', boxSizing: 'border-box',
      outline: 'none', marginBottom: '14px', fontFamily: "'Segoe UI', sans-serif",
    };
    const labelStyle = {
      display: 'block', fontSize: '12px', fontWeight: 700, color: '#3a8a90', marginBottom: '5px',
    };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0fafa' }}>
        <Header />
        <div style={{ flex: 1, padding: '30px', maxWidth: '550px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          <button onClick={() => this.props.navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid #cceef0', color: '#0d3b3d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginBottom: '20px' }}>
            Back to Dashboard
          </button>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #cceef0', boxShadow: '0 4px 16px rgba(0,206,209,0.08)' }}>
            <h2 style={{ color: '#0d3b3d', marginBottom: '4px', fontSize: '20px' }}>Add New User</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
              Fill in Name, Username and Email first — then generate a password.
            </p>

            {message && (
              <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749', padding: '10px 14px', borderRadius: '7px', fontSize: '13px', marginBottom: '16px' }}>
                Success: {message}
              </div>
            )}
            {createdPassword && (
              <div style={{ background: '#eef6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '7px', fontSize: '13px', marginBottom: '16px' }}>
                Temporary Password: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{createdPassword}</span>
              </div>
            )}
            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', color: '#e53e3e', padding: '10px 14px', borderRadius: '7px', fontSize: '13px', marginBottom: '16px' }}>
                Warning: {error}
              </div>
            )}

            <form onSubmit={this.handleSubmit}>

              <label style={labelStyle}>PROFILE IMAGE</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #cceef0', overflow: 'hidden', background: '#f0fafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '4px' }}>No image</span>
                  }
                </div>
                <div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={this.handleImage} style={{ fontSize: '12px', color: '#555' }} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>JPEG, PNG or WebP — max 2MB</p>
                </div>
              </div>

              <label style={labelStyle}>FULL NAME *</label>
              <input name="name" value={name} onChange={this.handleChange} placeholder="Enter full name" style={inputStyle} />

              <label style={labelStyle}>USERNAME *</label>
              <input name="username" value={username} onChange={this.handleChange} placeholder="Enter username" style={inputStyle} />

              <label style={labelStyle}>EMAIL ADDRESS *</label>
              <input name="email" type="email" value={email} onChange={this.handleChange} placeholder="Enter email" style={inputStyle} />

              <label style={labelStyle}>PHONE NUMBER</label>
              <input name="phone" value={phone} onChange={this.handleChange} placeholder="Enter 10-digit phone number" maxLength="10" style={inputStyle} />
              {phone && !/^\d{10}$/.test(phone) && (
                <p style={{ color: '#e53e3e', fontSize: '11.5px', marginTop: '-10px', marginBottom: '10px' }}>Phone must be exactly 10 digits</p>
              )}

              <label style={labelStyle}>ROLE</label>
              <select name="role" value={role} onChange={this.handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="user">User</option>
                <option value="support">Support</option>
                <option value="lead">Lead</option>
                <option value="admin">Admin</option>
              </select>

              <label style={labelStyle}>TEMPORARY PASSWORD</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={password}
                  readOnly
                  placeholder={canGenerate ? 'Click Generate to create a password' : 'Fill Name, Username & Email first'}
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    background: password ? '#f0fff4' : '#f8fdfd',
                    color: password ? '#276749' : '#94a3b8',
                    fontFamily: password ? 'monospace' : "'Segoe UI', sans-serif",
                    fontWeight: password ? 700 : 400,
                    border: password ? '1px solid #9ae6b4' : '1px solid #cceef0',
                  }}
                />
                <button
                  type="button"
                  onClick={this.handleGenerate}
                  disabled={!canGenerate}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '10px 14px',
                    borderRadius: '7px',
                    border: `1px solid ${canGenerate ? '#00CED1' : '#cceef0'}`,
                    background: canGenerate ? '#00CED1' : '#f0f0f0',
                    color: canGenerate ? '#fff' : '#b0b0b0',
                    fontWeight: 700,
                    cursor: canGenerate ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                >
                  {password ? 'Regenerate' : 'Generate'}
                </button>
              </div>
              {!canGenerate && (
                <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '-10px', marginBottom: '10px' }}>
                  Fill in Name, Username and a valid Email to enable password generation.
                </p>
              )}
              {password && (
                <p style={{ fontSize: '11.5px', color: '#276749', marginTop: '-10px', marginBottom: '10px' }}>
                  Password generated. Changing Name, Username, or Email will reset it.
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, background: loading ? '#7adee0' : '#00CED1', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Adding...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => this.props.navigate('/dashboard')}
                  style={{ flex: 1, background: '#fff', color: '#0d3b3d', border: '1px solid #cceef0', padding: '11px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default AddUserWrapper;