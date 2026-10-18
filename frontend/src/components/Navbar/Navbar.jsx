import React from 'react';
import './Navbar.css';

export default function Navbar({currentTab, setCurrentTab, username, onLogout}) {
    return (
        <nav className="navbar">
            <div className="nav-brand"></div>
            <div className="nav-links">
                <button
                    className={`nav-btn ${currentTab === 'table' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('table')}
                >
                    Persons Table
                </button>
                <button
                    className={`nav-btn ${currentTab === 'visualization' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('visualization')}
                >
                    Visualization
                </button>
                <button
                    className={`nav-btn ${currentTab === 'operations' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('operations')}
                >
                    Special Operations
                </button>
            </div>
            <div className="nav-user">
                <span>User: <strong>{username}</strong></span>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
        </nav>
    );
}