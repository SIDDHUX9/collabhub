// ...existing code...
'use client';

import React, { useEffect, useState } from 'react';

export default function AdminPage() {
    const [tab, setTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (tab === 'users') loadUsers();
    }, [tab]);

    async function loadUsers() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function deleteUser(id) {
        if (!confirm('Delete user?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setUsers((u) => u.filter((x) => x.id !== id));
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div style={{ padding: 20, fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin</h1>
                <nav>
                    <button onClick={() => setTab('overview')} disabled={tab === 'overview'}>Overview</button>
                    <button onClick={() => setTab('users')} disabled={tab === 'users'} style={{ marginLeft: 8 }}>Users</button>
                    <button onClick={() => setTab('products')} disabled={tab === 'products'} style={{ marginLeft: 8 }}>Products</button>
                    <button onClick={() => setTab('settings')} disabled={tab === 'settings'} style={{ marginLeft: 8 }}>Settings</button>
                </nav>
            </header>

            <main style={{ marginTop: 20 }}>
                {tab === 'overview' && (
                    <section>
                        <h2>Overview</h2>
                        <p>Quick stats and recent activity will appear here.</p>
                    </section>
                )}

                {tab === 'users' && (
                    <section>
                        <h2>Users</h2>
                        {loading && <p>Loading users…</p>}
                        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                        {!loading && !error && (
                            <>
                                {users.length === 0 ? (
                                    <p>No users found. Ensure your API endpoint /api/admin/users returns a list.</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>ID</th>
                                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Name</th>
                                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Email</th>
                                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id}>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.id}</td>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.name}</td>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.email}</td>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                                                        <button onClick={() => deleteUser(u.id)} style={{ color: 'red' }}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </section>
                )}

                {tab === 'products' && (
                    <section>
                        <h2>Products</h2>
                        <p>Product management UI can be added here.</p>
                    </section>
                )}

                {tab === 'settings' && (
                    <section>
                        <h2>Settings</h2>
                        <p>Application settings and configuration.</p>
                    </section>
                )}
            </main>
        </div>
    );
}