import React, {useEffect, useState} from 'react';
import {api} from '../../api/api';
import './ImportPage.css';

export default function ImportPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const loadHistory = async () => {
        try {
            const data = await api.getImportHistory();
            setHistory(data || []);
        } catch (err) {
            console.error('Failed to load import history', err);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.json')) {
                setError('Only .json files are allowed');
                setSelectedFile(null);
                e.target.value = null;
                return;
            }
            setError('');
            setSuccessMsg('');
            setSelectedFile(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Select json file');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const result = await api.importPersons(formData);
            setSuccessMsg(`Successfully imported ${result.length} persons!`);
            setSelectedFile(null);
            document.getElementById('import-file-input').value = null;
            await loadHistory();
        } catch (err) {
            setError(err.message || 'Import failed');
            await loadHistory();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="import-page">
            <h2>Import From File</h2>
            <div className="import-card">
                <h4>Upload JSON File</h4>
                <p className="import-hint">
                    Select a .json file containing an array of Person objects.
                </p>

                <form className="import-form" onSubmit={handleUpload}>
                    <input
                        id="import-file-input"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn-upload"
                        disabled={!selectedFile || loading}
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </button>
                </form>

                {error && <div className="import-alert alert-error">{error}</div>}
                {successMsg && <div className="import-alert alert-success">{successMsg}</div>}
            </div>

            <div className="history-section">
                <div className="history-header">
                    <h3>Import History</h3>
                    <button className="btn-refresh" onClick={loadHistory} title="Refresh history">
                        Refresh
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Operation ID</th>
                            <th>Status</th>
                            <th>User ID</th>
                            <th>Added Objects</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-row">No import operations yet</td>
                            </tr>
                        ) : (
                            history.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.id}</td>
                                    <td>
                                        <span className={`status-badge status-${log.status.toLowerCase()}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>{log.userId}</td>
                                    <td>{log.addedCount !== null ? log.addedCount : '-'}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}