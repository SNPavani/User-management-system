import React, { Component } from 'react';
import axios from 'axios';
import API from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAuthHeaders } from '../utils/helpers';

class Profile extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(sessionStorage.getItem('user')) || {};
    this.state = {
      preview: user.imageUrl || (user.image ? `${API}/uploads/${user.image}` : ''),
      file:    null,
      message: '',
      error:   '',
      loading: false,
    };
    this.handleFile   = this.handleFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.setState({ error: 'Only JPEG, PNG, or WebP images are allowed (max 2MB).', file: null, preview: '', message: '' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.setState({ error: 'Image must be 2MB or smaller.', file: null, preview: '', message: '' });
      return;
    }
    this.setState({ file, preview: URL.createObjectURL(file), error: '', message: '' });
  }

  async handleUpload(e) {
    e.preventDefault();
    const { file } = this.state;
    if (!file) return this.setState({ error: 'Please choose an image.' });

    this.setState({ loading: true, error: '', message: '' });
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await axios.patch(`${API}/api/users/me/avatar`, form, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      const user    = JSON.parse(sessionStorage.getItem('user')) || {};
      const updated = { ...user, image: res.data.image, imageUrl: res.data.imageUrl };
      sessionStorage.setItem('user', JSON.stringify(updated));
      this.setState({ message: 'Profile picture updated!', loading: false });
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Upload failed. Please ensure the image is JPEG/PNG/WebP and under 2MB.', loading: false });
    }
  }

  render() {
    const { preview, message, error, loading } = this.state;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0fafa' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #cceef0' }}>
            <button onClick={() => window.history.back()} style={{ background: 'transparent', border: '1px solid #cceef0', color: '#0d3b3d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginBottom: '12px' }}>
              Back
            </button>

            <h2 style={{ margin: '0 0 12px', color: '#0d3b3d' }}>Profile Picture</h2>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>Upload a new profile photo (JPEG/PNG/WebP, max 2MB).</p>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', border: '3px solid #00CED1', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {preview
                  ? <img src={preview} alt="avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#94a3b8' }}>No image</span>
                }
              </div>
              <input type="file" accept="image/*" onChange={this.handleFile} />
            </div>

            {message && <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749', padding: '9px 12px', borderRadius: '7px', fontSize: '12.5px', marginBottom: '14px' }}>{message}</div>}
            {error   && <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', color: '#e53e3e', padding: '9px 12px', borderRadius: '7px', fontSize: '12.5px', marginBottom: '14px' }}>{error}</div>}

            <button onClick={this.handleUpload} disabled={loading} style={{ width: '100%', background: loading ? '#7adee0' : '#00CED1', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Uploading...' : 'Save Avatar'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Profile;