import React, {useEffect, useMemo, useState} from 'react';
import {api} from '../../api/api';
import PersonModal from '../../components/PersonModal/PersonModal';
import './VisualizationPage.css';

const SVG_SIZE = 600;
const HALF = SVG_SIZE / 2;
const PADDING = 40;
const USABLE_RADIUS = HALF - PADDING;
const MAX_LIMIT = 1000;

export default function VisualizationPage({personsEvent}) {
    const [persons, setPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [hoveredGroup, setHoveredGroup] = useState(null);
    const [pickerGroup, setPickerGroup] = useState(null);

    const loadPersons = async () => {
        try {
            const res = await api.getAllPersonsRaw();
            setPersons(res.content || []);
        } catch (err) {
            console.error('Failed to load', err);
        }
    };

    useEffect(() => {
        loadPersons();
    }, []);

    useEffect(() => {
        if (!personsEvent) return;
        const type = personsEvent.type || personsEvent.action || (personsEvent.id ? 'UPDATE' : null);
        const data = personsEvent.data || personsEvent.person || personsEvent.entity || (personsEvent.id ? personsEvent : null);

        if (!data || !data.id) return;

        setPersons(prev => {
            const exists = prev.some(p => p.id === data.id);
            if (type === 'UPDATE') {
                if (!exists) return prev;
                return prev.map(p => p.id === data.id ? data : p);
            }

            if (type === 'CREATE') {
                if (!exists && prev.length < MAX_LIMIT) {
                    return [...prev, data];
                }
                return prev;
            }

            if (type === 'DELETE') {
                if (!exists) return prev;
                return prev.filter(p => p.id !== data.id);
            }

            return prev;
        });
    }, [personsEvent]);

    const coordinateGroups = useMemo(() => {
        const map = new Map();
        persons.forEach(p => {
            if (!p.coordinates) return;
            const key = `${p.coordinates.x}_${p.coordinates.y}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    x: p.coordinates.x,
                    y: p.coordinates.y,
                    items: []
                });
            }
            map.get(key).items.push(p);
        });
        return Array.from(map.values());
    }, [persons]);

    const {scale, maxVal} = useMemo(() => {
        let max = 50;
        coordinateGroups.forEach(g => {
            max = Math.max(max, Math.abs(g.x), Math.abs(g.y));
        });
        const roundedMax = Math.ceil(max);
        return {
            maxVal: roundedMax,
            scale: USABLE_RADIUS / roundedMax
        };
    }, [coordinateGroups]);

    const handlePointClick = (group) => {
        if (group.items.length === 1) {
            setSelectedPerson(group.items[0]);
        } else {
            setPickerGroup(group);
        }
    };

    return (
        <div className="vis-page">
            <div className="vis-header">
                <h2>Visualization by coordinates</h2>
                <span className="vis-hint">
                    Current range: <strong>[-{maxVal}, +{maxVal}]</strong>. Click to view or edit Person.
                </span>
            </div>

            <div className="svg-wrapper">
                <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
                    <line x1={0} y1={HALF} x2={SVG_SIZE} y2={HALF} stroke="#94a3b8" strokeWidth="1.5"/>
                    <line x1={HALF} y1={0} x2={HALF} y2={SVG_SIZE} stroke="#94a3b8" strokeWidth="1.5"/>
                    <line x1={HALF + USABLE_RADIUS} y1={HALF - 5} x2={HALF + USABLE_RADIUS} y2={HALF + 5}
                          stroke="#64748b"/>
                    <text x={HALF + USABLE_RADIUS - 10} y={HALF + 18} fill="#64748b" fontSize="10">+{maxVal}</text>
                    <line x1={HALF - USABLE_RADIUS} y1={HALF - 5} x2={HALF - USABLE_RADIUS} y2={HALF + 5}
                          stroke="#64748b"/>
                    <text x={HALF - USABLE_RADIUS - 10} y={HALF + 18} fill="#64748b" fontSize="10">-{maxVal}</text>
                    <line x1={HALF - 5} y1={HALF - USABLE_RADIUS} x2={HALF + 5} y2={HALF - USABLE_RADIUS}
                          stroke="#64748b"/>
                    <text x={HALF + 8} y={HALF - USABLE_RADIUS + 4} fill="#64748b" fontSize="10">+{maxVal}</text>
                    <line x1={HALF - 5} y1={HALF + USABLE_RADIUS} x2={HALF + 5} y2={HALF + USABLE_RADIUS}
                          stroke="#64748b"/>
                    <text x={HALF + 8} y={HALF + USABLE_RADIUS + 4} fill="#64748b" fontSize="10">-{maxVal}</text>

                    <text x={SVG_SIZE - 15} y={HALF - 10} fill="#334155" fontSize="12" fontWeight="bold">X</text>
                    <text x={HALF + 10} y={15} fill="#334155" fontSize="12" fontWeight="bold">Y</text>
                    <text x={HALF + 6} y={HALF + 16} fill="#94a3b8" fontSize="10">(0,0)</text>

                    {coordinateGroups.map(group => {
                        const cx = HALF + (group.x * scale);
                        const cy = HALF - (group.y * scale);
                        const hasMultiple = group.items.length > 1;

                        const label = hasMultiple
                            ? `${group.items[0].name} (+${group.items.length - 1})`
                            : group.items[0].name;

                        return (
                            <g
                                key={group.key}
                                className="point-group"
                                onClick={() => handlePointClick(group)}
                                onMouseEnter={() => setHoveredGroup(group)}
                                onMouseLeave={() => setHoveredGroup(null)}
                            >
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={5}
                                    className="person-dot"
                                />
                                <text x={cx + 7} y={cy + 4} fontSize="11" fill="#0f172a">
                                    {label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {hoveredGroup && (
                    <div className="vis-tooltip-container">
                        {hoveredGroup.items.map(person => (
                            <div key={person.id} className="vis-tooltip-card">
                                <strong>{person.name}</strong> (ID: {person.id})<br/>
                                X: {person.coordinates?.x}, Y: {person.coordinates?.y}<br/>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pickerGroup && (
                <div className="modal-overlay" onClick={() => setPickerGroup(null)}>
                    <div className="modal-content picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Objects at ({pickerGroup.x}, {pickerGroup.y})</h3>
                            <button className="close-btn" onClick={() => setPickerGroup(null)}>✕</button>
                        </div>
                        <p className="vis-hint">Choose person:</p>
                        <div className="picker-list">
                            {pickerGroup.items.map(p => (
                                <div
                                    key={p.id}
                                    className="picker-item"
                                    onClick={() => {
                                        setSelectedPerson(p);
                                        setPickerGroup(null);
                                    }}
                                >
                                    <div>
                                        <strong>{p.name}</strong> <span className="picker-id">ID: #{p.id}</span>
                                    </div>
                                    <span className="picker-arrow">Edit ›</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedPerson && (
                <PersonModal
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                    onSaved={loadPersons}
                />
            )}
        </div>
    );
}