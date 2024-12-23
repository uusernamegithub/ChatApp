import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Signup.css'; // Import the CSS file

const SignupPage = ({setSelectedChatpic}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPicturePreview(URL.createObjectURL(file)); // Generate a preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Simple validation for name, email, and password (picture is optional)
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }
  
    try {
      // Send a POST request to the backend
      const response = await fetch('https://chat-appliacation.onrender.com/chatApp/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name:name,
          email: email,
          password: password,
          picture:picture
        }),
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Signup failed. Please try again.');
      }
  
      // Parse the response JSON
      const data = await response.json();
  
      // Store the JWT in localStorage
      localStorage.setItem('token', data.body.token);
      localStorage.setItem('loggedin', 'true');
      setSelectedChatpic(data.data.user.pic)

      // Clear any previous error
      setError('');
  
      // Redirect to /home after successful signup
      navigate('/home');
    } catch (error) {
      // Set the error state if the signup fails
      setError(error.message);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="signup-container">
      <h2 className="signup-header">Signup</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="name" className="signup-label">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="signup-input"
            placeholder="Enter your name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email" className="signup-label">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
            placeholder="Enter your email"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password" className="signup-label">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
            placeholder="Enter your password"
          />
        </div>
        <div className="input-group">
          <label htmlFor="picture" className="signup-label">Picture:</label>
          <input
            type="file"
            id="picture"
            accept="image/*"
            onChange={handlePictureChange}
            className="signup-input"
          />
        </div>
        {picturePreview && (
          <div className="preview-container">
            <img src={picturePreview} alt="Preview" className="preview-image" />
          </div>
        )}
        <button type="submit" className="signup-button">Signup</button>
      </form>
    </div>
    </>
  );
};

export default SignupPage;
