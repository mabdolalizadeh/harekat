const BASE = 'http://localhost:3000/api/v1';

async function get(path) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE}${path}`, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
}

export function fetchCourses() {
    return get('/courses');
}

export function fetchTeachers() {
    return get('/teachers');
}
