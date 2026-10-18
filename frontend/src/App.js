import React, {useEffect, useState} from 'react';
import Navbar from './components/Navbar/Navbar';
import AuthPage from './pages/AuthPage/AuthPage';
import TablePage from './pages/TablePage/TablePage';
import VisualizationPage from './pages/VisualizationPage/VisualizationPage';
import OperationsPage from './pages/OperationsPage/OperationsPage';
import {connectWebSocket, disconnectWebSocket} from './websocket/stompClient';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [currentTab, setCurrentTab] = useState('table');
    const [wsEvent, setWsEvent] = useState(null);

    const handleLoginSuccess = (user, jwtToken) => {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('username', user);
        setToken(jwtToken);
        setUsername(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUsername('');
        disconnectWebSocket();
    };

    useEffect(() => {
        if (token) {
            connectWebSocket((event) => {
                console.log('WS Event received:', event);
                setWsEvent(event);
            });
        }
        return () => {
            disconnectWebSocket();
        };
    }, [token]);

    if (!token) {
        return <AuthPage onLoginSuccess={handleLoginSuccess}/>;
    }

    return (
        <div className="app-root">
            <Navbar
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                username={username}
                onLogout={handleLogout}
            />
            <main className="app-main">
                {currentTab === 'table' && <TablePage personsEvent={wsEvent}/>}
                {currentTab === 'visualization' && <VisualizationPage personsEvent={wsEvent}/>}
                {currentTab === 'operations' && <OperationsPage/>}
            </main>
        </div>
    );
}

export default App;