import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/login.css'; // Import the CSS file

const Login = ({setSelectedChatpic}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3256/chatApp/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userId', data.data.user._id);
      localStorage.setItem('loggedin', 'true');
      setSelectedChatpic(data.data.user.pic)

      setError('');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  const userCredbtnClicked=()=>{
    setEmail('person2@gmail.com');
    setPassword('password2');
  }
  return (
    <>
      <Navbar />
      <div className="login-container">
        <h2 className="login-header">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder={email || "Enter your email"}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={password || "Enter your password"}
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <button onClick={userCredbtnClicked} className="login-button">Get User Credentials</button>
      </div>
    </>
  );
};

export default Login;
