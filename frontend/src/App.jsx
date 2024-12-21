import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login.jsx';
import Signup from './Components/Signup.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './Components/Home.jsx';

// ProtectedRoute Component
function ProtectedRoute({ element, ...rest }) {
  const isLoggedIn = JSON.parse(localStorage.getItem("loggedin"));
  return isLoggedIn ? element : <Navigate to="/login" />;
}

function App() {
  const [selectedChatId, setSelectedChatId] = useState(null); // State to track the selected chatId
  const [selectedChatpic, setSelectedChatpic] = useState(null); // State to track the selected chatId


  return (
    <Router>
      {/* Pass props to Navbar */}
      <Routes>
      <Route path="/" element={<Navbar selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} /> }/>
        <Route path="/login" element={<Login  setSelectedChatpic = {setSelectedChatpic}/>} />
        <Route path="/signup" element={<Signup setSelectedChatpic = {setSelectedChatpic}/>} />
        <Route
          path="/home"
          element={
            <ProtectedRoute 
              element={
                <Home selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} selectedChatpic={selectedChatpic} />
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
