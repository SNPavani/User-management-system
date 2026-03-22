import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login          from './pages/Login';
import Signup         from './pages/Signup';
import Dashboard      from './pages/Dashboard';
import AddUser        from './pages/AddUser';
import EditUser       from './pages/EditUser';
import ChangePassword from './pages/ChangePassword';
import Profile        from './pages/Profile';

class ProtectedRoute extends Component {
  render() {
    const token = sessionStorage.getItem('token');
    const user  = sessionStorage.getItem('user');
    if (!token || !user) return <Navigate to="/" replace />;
    return this.props.children;
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route path="/"         element={<Login />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />

          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-user"        element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          <Route path="/edit-user/:id"   element={<ProtectedRoute><EditUser /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Router>
    );
  }
}

export default App;