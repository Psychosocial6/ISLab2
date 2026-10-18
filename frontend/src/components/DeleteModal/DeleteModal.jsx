import React, {useState} from 'react';
import './DeleteModal.css';

export default function DeleteModal({person, allPersons, onClose, onConfirm}) {
    const candidates = allPersons.filter(p => p.id !== person.id);
    const [transferToId, setTransferToId] = useState(candidates.length > 0 ? candidates[0].id : '');
    const [error, setError] = useState('');

    const handleDelete = () => {
        if (!transferToId) {
            setError('Select a person to transfer coordinates/location to.');
            return;
        }
        onConfirm(person.id, transferToId);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Delete Person #{person.id} ({person.name})</h3>
                <p className="delete-warning">
                    Linked objects must be transferred to another person before deletion.
                </p>

                {error && <div className="modal-error">{error}</div>}

                {candidates.length === 0 ? (
                    <div className="modal-error">
                        The only person cannot be deleted
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Transfer data to *</label>
                        <select value={transferToId} onChange={e => setTransferToId(e.target.value)}>
                            {candidates.map(c => (
                                <option key={c.id} value={c.id}>
                                    ID {c.id} - {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-delete"
                        disabled={candidates.length === 0}
                        onClick={handleDelete}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
}