// src/services/api.js
// API helper functions for communicating with the backend

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = `${BACKEND_URL}/api`;
const AUTH_BASE = `${BACKEND_URL}/auth`;

// ----- Auth -----

export async function fetchCurrentUser() {
    const res = await fetch(`${AUTH_BASE}/current-user`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
}

export function loginWithGoogle() {
    window.location.href = `${AUTH_BASE}/google`;
}

export async function logout() {
    await fetch(`${AUTH_BASE}/logout`, { credentials: 'include' });
    window.location.href = '/';
}

// ----- Interview Data -----

export async function fetchInterviews() {
    const res = await fetch(`${API_BASE}/interviews`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json(); // { chats: [], scores: [] }
}

export async function saveChat(chat) {
    const res = await fetch(`${API_BASE}/interviews/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chat }),
    });
    if (!res.ok) throw new Error('Failed to save chat');
    return res.json();
}

export async function saveScore(score) {
    const res = await fetch(`${API_BASE}/interviews/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score }),
    });
    if (!res.ok) throw new Error('Failed to save score');
    return res.json();
}

export async function clearAllData() {
    const res = await fetch(`${API_BASE}/interviews`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to clear data');
    return res.json();
}
