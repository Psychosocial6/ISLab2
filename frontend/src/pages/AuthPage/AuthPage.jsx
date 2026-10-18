import React, {useState} from 'react';
import {api} from '../../api/api';
import './AuthPage.css';

export default function AuthPage({onLoginSuccess}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.login({username, password});
            onLoginSuccess(username, res.token);
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.register({username, password});
            onLoginSuccess(username, res.token);
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Authorization</h2>
                <form>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={`error-box ${error ? 'visible' : ''}`}>
                        {error}
                    </div>

                    <div className="auth-buttons">
                        <button type="button" className="btn-primary" onClick={handleLogin}>
                            Login
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleRegister}>
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}