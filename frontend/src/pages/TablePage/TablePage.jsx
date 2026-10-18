import React, {useCallback, useEffect, useState} from 'react';
import {api} from '../../api/api';
import PersonModal from '../../components/PersonModal/PersonModal';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import './TablePage.css';

export default function TablePage({personsEvent}) {
    const [persons, setPersons] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchName, setSearchName] = useState('');
    const [currentSearch, setCurrentSearch] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDir, setSortDir] = useState('asc');
    const [modalPerson, setModalPerson] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [allPersonsForDelete, setAllPersonsForDelete] = useState([]);

    const fetchPersons = useCallback(async () => {
        try {
            const sort = `${sortField},${sortDir}`;
            const res = await api.getPersons(page, size, sort, currentSearch);
            setPersons(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
        } catch (err) {
        }
    }, [page, size, sortField, sortDir, currentSearch]);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    useEffect(() => {
        if (personsEvent) {
            fetchPersons();
        }
    }, [personsEvent, fetchPersons]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        setCurrentSearch(searchName);
    };

    const handleResetSearch = () => {
        setSearchName('');
        setCurrentSearch('');
        setPage(0);
    };

    const openDeleteModal = async (person) => {
        try {
            const res = await api.getAllPersonsRaw();
            setAllPersonsForDelete(res.content || []);
            setDeleteTarget(person);
        } catch (err) {
        }
    };

    const handleConfirmDelete = async (id, transferToId) => {
        try {
            await api.deletePerson(id, transferToId);
            setDeleteTarget(null);
            fetchPersons();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="table-page">
            <div className="table-toolbar">
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                    />
                    <button type="submit" className="btn-search">Search</button>
                    {currentSearch && (
                        <button type="button" className="btn-reset" onClick={handleResetSearch}>Reset</button>
                    )}
                </form>

                <button className="btn-add" onClick={() => setModalPerson({})} title="Add new person">
                    +
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortField === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th onClick={() => handleSort('name')}>Name {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th>Coords (X, Y)</th>
                        <th onClick={() => handleSort('creationDate')}>Created {sortField === 'creationDate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th>Eye</th>
                        <th>Hair</th>
                        <th>Location (X, Y, Z)</th>
                        <th onClick={() => handleSort('height')}>Height {sortField === 'height' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th>Birthday</th>
                        <th onClick={() => handleSort('weight')}>Weight {sortField === 'weight' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                        <th>Nationality</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {persons.length === 0 ? (
                        <tr>
                            <td colSpan="12" className="empty-row">No records found</td>
                        </tr>
                    ) : (
                        persons.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td><strong>{p.name}</strong></td>
                                <td>({p.coordinates?.x}, {p.coordinates?.y})</td>
                                <td>{p.creationDate ? new Date(p.creationDate).toLocaleDateString() : '-'}</td>
                                <td>{p.eyeColor}</td>
                                <td>{p.hairColor || '-'}</td>
                                <td>
                                    {p.location ? `(${p.location.x}, ${p.location.y}, ${p.location.z})` : '-'}
                                </td>
                                <td>{p.height}</td>
                                <td>{p.birthday ? new Date(p.birthday).toLocaleDateString() : '-'}</td>
                                <td>{p.weight}</td>
                                <td>{p.nationality}</td>
                                <td className="actions-cell">
                                    <button className="btn-edit" onClick={() => setModalPerson(p)}>✎</button>
                                    <button className="btn-trash" onClick={() => openDeleteModal(p)}>✕</button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-bar">
                <div className="pagination-info">
                    Total: {totalElements} | Page {page + 1} of {totalPages}
                </div>
                <div className="pagination-actions">
                    <button disabled={page === 0} onClick={() => setPage(0)}>« First</button>
                    <button disabled={page === 0} onClick={() => setPage(page - 1)}>‹ Prev</button>
                    <span className="page-indicator">{page + 1}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next ›</button>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>Last »</button>

                    <select value={size} onChange={e => {
                        setSize(Number(e.target.value));
                        setPage(0);
                    }}>
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                    </select>
                </div>
            </div>

            {modalPerson && (
                <PersonModal
                    person={modalPerson}
                    onClose={() => setModalPerson(null)}
                    onSaved={fetchPersons}
                />
            )}

            {deleteTarget && (
                <DeleteModal
                    person={deleteTarget}
                    allPersons={allPersonsForDelete}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
}