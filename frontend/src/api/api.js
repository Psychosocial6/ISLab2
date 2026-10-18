const BASE_URL = 'http://localhost:8080';

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.reload();
        throw new Error('Unauthorized');
    }
    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
        }
        throw new Error(errorMessage);
    }
    if (response.status === 204) {
        return null;
    }
    return await response.json();
}

export const api = {
    login: (credentials) => request('/api/auth/login', {method: 'POST', body: JSON.stringify(credentials)}),
    register: (credentials) => request('/api/auth/register', {method: 'POST', body: JSON.stringify(credentials)}),
    getPersons: (page = 0, size = 10, sort = '', name = '') => {
        let url = `/api/person?page=${page}&size=${size}`;
        if (sort) url += `&sort=${sort}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return request(url);
    },
    getAllPersonsRaw: () => request('/api/person?page=0&size=1000'),
    getPersonById: (id) => request(`/api/person/${id}`),
    createPerson: (data) => request('/api/person', {method: 'POST', body: JSON.stringify(data)}),
    updatePerson: (id, data) => request(`/api/person/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
    deletePerson: (id, transferToId) => request(`/api/person/${id}?transferToId=${transferToId}`, {method: 'DELETE'}),
    getCoordinates: () => request('/api/coordinates'),
    getLocations: () => request('/api/location'),
    deleteByHeight: (height) => request(`/api/person/delete-by-height?height=${height}`, {method: 'DELETE'}),
    getAvgHeight: () => request('/api/person/avg-height'),
    countNationalityLessThan: (nationality) => request(`/api/person/count-nationality-less-than?nationality=${nationality}`),
    countHairColor: (color) => request(`/api/person/count-hair-color?hair-color=${color}`),
    getHairColorPercentage: (color) => request(`/api/person/hair-color-percentage?hair-color=${color}`)
};