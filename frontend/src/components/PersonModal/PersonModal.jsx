import React, {useEffect, useState} from 'react';
import {api} from '../../api/api';
import './PersonModal.css';

const EYE_COLORS = ['BLACK', 'YELLOW', 'WHITE'];
const HAIR_COLORS = ['', 'BLACK', 'YELLOW', 'WHITE'];
const COUNTRIES = ['SPAIN', 'CHINA', 'INDIA', 'ITALY'];

export default function PersonModal({person, onClose, onSaved}) {
    const isEdit = Boolean(person && person.id);
    const [name, setName] = useState(person?.name || '');
    const [height, setHeight] = useState(person?.height || '');
    const [weight, setWeight] = useState(person?.weight || '');
    const [eyeColor, setEyeColor] = useState(person?.eyeColor || 'BLACK');
    const [hairColor, setHairColor] = useState(person?.hairColor || '');
    const [nationality, setNationality] = useState(person?.nationality || 'SPAIN');
    const [birthday, setBirthday] = useState(
        person?.birthday ? person.birthday.substring(0, 16) : ''
    );
    const [coordMode, setCoordMode] = useState('new');
    const [coordinatesId, setCoordinatesId] = useState('');
    const [coordX, setCoordX] = useState(person?.coordinates?.x || '');
    const [coordY, setCoordY] = useState(person?.coordinates?.y || '');
    const [locMode, setLocMode] = useState(person?.location ? 'new' : 'none');
    const [locationId, setLocationId] = useState('');
    const [locX, setLocX] = useState(person?.location?.x || '');
    const [locY, setLocY] = useState(person?.location?.y || '');
    const [locZ, setLocZ] = useState(person?.location?.z || '');
    const [existingCoords, setExistingCoords] = useState([]);
    const [existingLocs, setExistingLocs] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getCoordinates().then(setExistingCoords).catch(() => {
        });
        api.getLocations().then(setExistingLocs).catch(() => {
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const payload = {
            name,
            height: parseFloat(height),
            weight: parseFloat(weight),
            eyeColor,
            hairColor: hairColor || null,
            nationality,
            birthday: birthday ? new Date(birthday).toISOString() : null,
        };
        if (coordMode === 'existing') {
            payload.coordinatesId = parseInt(coordinatesId, 10);
        } else {
            payload.coordinates = {
                x: parseFloat(coordX),
                y: parseFloat(coordY)
            };
        }
        if (locMode === 'existing') {
            payload.locationId = parseInt(locationId, 10);
        } else if (locMode === 'new') {
            payload.location = {
                x: parseFloat(locX),
                y: parseInt(locY, 10),
                z: parseFloat(locZ)
            };
        } else {
            payload.location = null;
            payload.locationId = null;
        }

        try {
            if (isEdit) {
                await api.updatePerson(person.id, payload);
            } else {
                await api.createPerson(payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{isEdit ? `Edit Person id=${person.id}` : 'Create new Person'}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input value={name} onChange={e => setName(e.target.value)} required/>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Height *</label>
                            <input type="number" step="any" min="0.001" value={height}
                                   onChange={e => setHeight(e.target.value)} required/>
                        </div>
                        <div className="form-group">
                            <label>Weight *</label>
                            <input type="number" step="any" min="0.001" value={weight}
                                   onChange={e => setWeight(e.target.value)} required/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Eye Color *</label>
                            <select value={eyeColor} onChange={e => setEyeColor(e.target.value)}>
                                {EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Hair Color</label>
                            <select value={hairColor} onChange={e => setHairColor(e.target.value)}>
                                {HAIR_COLORS.map(c => <option key={c} value={c}>{c || 'NONE'}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nationality *</label>
                            <select value={nationality} onChange={e => setNationality(e.target.value)}>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Birthday</label>
                            <input type="datetime-local" value={birthday} onChange={e => setBirthday(e.target.value)}/>
                        </div>
                    </div>

                    <fieldset className="fieldset">
                        <legend>Coordinates *</legend>
                        <div className="radio-group">
                            <label>
                                <input type="radio" value="new" checked={coordMode === 'new'}
                                       onChange={() => setCoordMode('new')}/>
                                New
                            </label>
                            <label>
                                <input type="radio" value="existing" checked={coordMode === 'existing'}
                                       onChange={() => setCoordMode('existing')}/>
                                Existing
                            </label>
                        </div>

                        {coordMode === 'new' ? (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>X *</label>
                                    <input type="number" step="any" value={coordX}
                                           onChange={e => setCoordX(e.target.value)} required/>
                                </div>
                                <div className="form-group">
                                    <label>Y *</label>
                                    <input type="number" step="any" value={coordY}
                                           onChange={e => setCoordY(e.target.value)} required/>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Select Coordinates *</label>
                                <select value={coordinatesId} onChange={e => setCoordinatesId(e.target.value)} required>
                                    <option value="">Choose coordinates</option>
                                    {existingCoords.map(c => (
                                        <option key={c.id} value={c.id}>ID {c.id} (x: {c.x}, y: {c.y})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend>Location</legend>
                        <div className="radio-group">
                            <label>
                                <input type="radio" value="none" checked={locMode === 'none'}
                                       onChange={() => setLocMode('none')}/>
                                None
                            </label>
                            <label>
                                <input type="radio" value="new" checked={locMode === 'new'}
                                       onChange={() => setLocMode('new')}/>
                                New
                            </label>
                            <label>
                                <input type="radio" value="existing" checked={locMode === 'existing'}
                                       onChange={() => setLocMode('existing')}/>
                                Existing
                            </label>
                        </div>

                        {locMode === 'new' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>X *</label>
                                    <input type="number" step="any" value={locX} onChange={e => setLocX(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-group">
                                    <label>Y *</label>
                                    <input type="number" step="1" value={locY} onChange={e => setLocY(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-group">
                                    <label>Z *</label>
                                    <input type="number" step="any" value={locZ} onChange={e => setLocZ(e.target.value)}
                                           required/>
                                </div>
                            </div>
                        )}

                        {locMode === 'existing' && (
                            <div className="form-group">
                                <label>Select Location *</label>
                                <select value={locationId} onChange={e => setLocationId(e.target.value)} required>
                                    <option value="">Choose location</option>
                                    {existingLocs.map(l => (
                                        <option key={l.id} value={l.id}>ID {l.id} (x: {l.x}, y: {l.y},
                                            z: {l.z})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </fieldset>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">{isEdit ? 'Save Changes' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}