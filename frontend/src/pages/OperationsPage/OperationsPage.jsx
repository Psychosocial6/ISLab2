import React, {useState} from 'react';
import {api} from '../../api/api';
import './OperationsPage.css';

const COUNTRIES = ['SPAIN', 'CHINA', 'INDIA', 'ITALY'];
const COLORS = ['BLACK', 'YELLOW', 'WHITE'];

export default function OperationsPage() {
    const [deleteHeight, setDeleteHeight] = useState('');
    const [deleteMsg, setDeleteMsg] = useState('');
    const [avgHeight, setAvgHeight] = useState(null);
    const [nationality, setNationality] = useState('CHINA');
    const [natCount, setNatCount] = useState(null);
    const [hairColorCount, setHairColorCount] = useState('BLACK');
    const [colorCount, setColorCount] = useState(null);
    const [hairColorPerc, setHairColorPerc] = useState('BLACK');
    const [percentage, setPercentage] = useState(null);

    const handleDeleteByHeight = async () => {
        if (!deleteHeight) return;
        try {
            await api.deleteByHeight(parseFloat(deleteHeight));
            setDeleteMsg(`Deleted persons with height = ${deleteHeight}`);
            setDeleteHeight('');
        } catch (err) {
            setDeleteMsg(`Error: ${err.message}`);
        }
    };

    const handleAvgHeight = async () => {
        try {
            const res = await api.getAvgHeight();
            setAvgHeight(res.average_height);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleNationalityCount = async () => {
        try {
            const res = await api.countNationalityLessThan(nationality);
            setNatCount(res.count);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleColorCount = async () => {
        try {
            const res = await api.countHairColor(hairColorCount);
            setColorCount(res.count);
        } catch (err) {
            alert(err.message);
        }
    };

    const handlePercentage = async () => {
        try {
            const res = await api.getHairColorPercentage(hairColorPerc);
            setPercentage(res.percentage);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="ops-page">
            <h2>Special Operations</h2>

            <div className="ops-grid">
                <div className="op-card">
                    <h4>Delete Persons by Height</h4>
                    <div className="op-controls">
                        <input
                            type="number"
                            step="any"
                            placeholder="Enter height..."
                            value={deleteHeight}
                            onChange={e => setDeleteHeight(e.target.value)}
                        />
                        <button className="btn-op-delete" onClick={handleDeleteByHeight}>Delete</button>
                    </div>
                    {deleteMsg && <span className="op-result">{deleteMsg}</span>}
                </div>

                <div className="op-card">
                    <h4>Average Height of all Persons</h4>
                    <button className="btn-op" onClick={handleAvgHeight}>Calculate Average</button>
                    {avgHeight !== null && (
                        <span className="op-result">Average: <strong>{avgHeight.toFixed(2)}</strong></span>
                    )}
                </div>

                <div className="op-card">
                    <h4>Count Nationality Less Than</h4>
                    <div className="op-controls">
                        <select value={nationality} onChange={e => setNationality(e.target.value)}>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className="btn-op" onClick={handleNationalityCount}>Calculate</button>
                    </div>
                    {natCount !== null && (
                        <span className="op-result">Result: <strong>{natCount}</strong></span>
                    )}
                </div>

                <div className="op-card">
                    <h4>Count Persons with Hair Color</h4>
                    <div className="op-controls">
                        <select value={hairColorCount} onChange={e => setHairColorCount(e.target.value)}>
                            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className="btn-op" onClick={handleColorCount}>Calculate</button>
                    </div>
                    {colorCount !== null && (
                        <span className="op-result">Count: <strong>{colorCount}</strong></span>
                    )}
                </div>

                <div className="op-card">
                    <h4>Percentage of Hair Color</h4>
                    <div className="op-controls">
                        <select value={hairColorPerc} onChange={e => setHairColorPerc(e.target.value)}>
                            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className="btn-op" onClick={handlePercentage}>Calculate %</button>
                    </div>
                    {percentage !== null && (
                        <span className="op-result">Percentage: <strong>{percentage.toFixed(2)}%</strong></span>
                    )}
                </div>
            </div>
        </div>
    );
}