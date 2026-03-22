export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
  borderRadius: '7px',
  border: '1px solid #cceef0',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
  marginBottom: '14px',
  fontFamily: "'Segoe UI', sans-serif",
};

export const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#3a8a90',
  marginBottom: '5px',
};

export const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '30px',
  border: '1px solid #cceef0',
  boxShadow: '0 4px 16px rgba(0,206,209,0.08)',
};

export const alertSuccess = {
  background: '#f0fff4',
  border: '1px solid #9ae6b4',
  color: '#276749',
  padding: '10px 14px',
  borderRadius: '7px',
  fontSize: '13px',
  marginBottom: '16px',
};

export const alertError = {
  background: '#fff5f5',
  border: '1px solid #fed7d7',
  color: '#e53e3e',
  padding: '10px 14px',
  borderRadius: '7px',
  fontSize: '13px',
  marginBottom: '16px',
};

export const backBtnStyle = {
  background: 'transparent',
  border: '1px solid #cceef0',
  color: '#0d3b3d',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

export const primaryBtnStyle = (loading) => ({
  flex: 1,
  background: loading ? '#7adee0' : '#00CED1',
  color: '#fff',
  border: 'none',
  padding: '11px',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '14px',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.7 : 1,
});

export const cancelBtnStyle = {
  flex: 1,
  background: '#fff',
  color: '#0d3b3d',
  border: '1px solid #cceef0',
  padding: '11px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
};