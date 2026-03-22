import React, { Component } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAuthHeaders, validatePhone } from '../utils/helpers';
import { inputStyle, labelStyle, cardStyle, alertSuccess, alertError, backBtnStyle, primaryBtnStyle, cancelBtnStyle } from '../utils/styles';

function EditUserWrapper() {
  const navigate = useNavigate();
  const { id }   = useParams();
  return <EditUser navigate={navigate} userId={id} />;
}

class EditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name:         '',
      username:     '',
      email:        '',
      phone:        '',
      role:         'user',
      image:        null,
      imagePreview: null,
      currentImage: null,
      message:      '',
      error:        '',
      loading:      false,
    };
    this.handleChange        = this.handleChange.bind(this);
    this.handleImage         = this.handleImage.bind(this);
    this.handleSubmit        = this.handleSubmit.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
  }

  componentDidMount() {
    this.fetchUser();
  }

  async fetchUser() {
    try {
      const res = await axios.get(`${API}/api/users/${this.props.userId}`, { headers: getAuthHeaders() });
      const u   = res.data;
      this.setState({
        name:         u.name     || '',
        username:     u.username || '',
        email:        u.email    || '',
        phone:        u.phone    || '',
        role:         u.role     || 'user',
        currentImage: u.imageUrl || null,
        imagePreview: u.imageUrl || null,
      });
    } catch {
      this.setState({ error: 'Could not load user data.' });
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value, error: '' });
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

  validate() {
    const { name, phone } = this.state;
    if (!name) return 'Name is required.';
    if (phone) {
      const phoneErr = validatePhone(phone);
      if (phoneErr) return phoneErr;
    }
    return null;
  }

  async handleResetPassword() {
    if (!window.confirm('Generate a temporary password for this user?')) return;
    this.setState({ loading: true, error: '', message: '' });
    try {
      const res = await axios.post(`${API}/api/users/${this.props.userId}/reset-password`, {}, { headers: getAuthHeaders() });
      this.setState({ message: `Temporary password: ${res.data.tempPassword}`, loading: false });
    } catch (err) {
      if (err.response?.status === 401) {
        this.props.navigate('/');
      } else {
        this.setState({ error: err.response?.data?.message || 'Error resetting password.', loading: false });
      }
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const err = this.validate();
    if (err) return this.setState({ error: err });

    const { name, username, email, phone, role, image } = this.state;
    this.setState({ loading: true });
    try {
      const formData = new FormData();
      formData.append('name',     name);
      formData.append('username', username || name);
      formData.append('email',    email);
      formData.append('phone',    phone);
      formData.append('role',     role);
      if (image) formData.append('image', image);

      await axios.put(
        `${API}/api/users/${this.props.userId}`,
        formData,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      this.setState({ message: 'User updated successfully!' });
      setTimeout(() => this.props.navigate('/dashboard'), 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        this.props.navigate('/');
      } else {
        this.setState({ error: err.response?.data?.message || 'Error updating user.' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { name, username, email, phone, role, imagePreview, message, error, loading } = this.state;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0fafa' }}>
        <Header />
        <div style={{ flex: 1, padding: '30px', maxWidth: '550px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <button onClick={() => this.props.navigate('/dashboard')} style={backBtnStyle}>Back to Dashboard</button>

          <div style={cardStyle}>
            <h2 style={{ color: '#0d3b3d', marginBottom: '4px', fontSize: '20px' }}>Edit User</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Update the user details below.</p>

            {message && <div style={alertSuccess}>Success: {message}</div>}
            {error   && <div style={alertError}>Warning: {error}</div>}

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

              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input name="email" type="email" value={email} onChange={this.handleChange} placeholder="Enter email" style={inputStyle} />

              <label style={labelStyle}>PHONE NUMBER</label>
              <input name="phone" value={phone} onChange={this.handleChange} placeholder="Enter 10-digit phone number" maxLength="10" style={inputStyle} />
              {phone && validatePhone(phone) && <p style={{ color: '#e53e3e', fontSize: '11.5px', marginTop: '-10px', marginBottom: '10px' }}>Phone must be exactly 10 digits</p>}

              <label style={labelStyle}>ROLE</label>
              <select name="role" value={role} onChange={this.handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="user">User</option>
                <option value="support">Support</option>
                <option value="lead">Lead</option>
                <option value="admin">Admin</option>
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} style={primaryBtnStyle(loading)}>{loading ? 'Updating...' : 'Update User'}</button>
                <button type="button" onClick={() => this.props.navigate('/dashboard')} style={cancelBtnStyle}>Cancel</button>
                <button type="button" onClick={this.handleResetPassword} disabled={loading} style={{ flex: 1, background: '#fff', color: '#e53e3e', border: '1px solid #fca5a5', padding: '11px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  Reset Password
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

export default EditUserWrapper;
