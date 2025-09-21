import React, { useEffect, useState } from 'react';
import { getAdminOrders, getAdminRatings } from '../../api/AdminApi';
import { clearAdminToken, getAdminToken } from '../../utils/AdminTokenStorage';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(null);
  const [ratingsCount, setRatingsCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (!getAdminToken()) {
          navigate('/admin/login');
          return;
        }
        const [orders, ratings] = await Promise.all([
          getAdminOrders().catch(() => ({ items: [] })),
          getAdminRatings().catch(() => ({ items: [] })),
        ]);
        const oc = Array.isArray(orders?.items) ? orders.items.length : (Array.isArray(orders) ? orders.length : 0);
        const rc = Array.isArray(ratings?.items) ? ratings.items.length : (Array.isArray(ratings) ? ratings.length : 0);
        setOrdersCount(oc);
        setRatingsCount(rc);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  function logout() {
    clearAdminToken();
    navigate('/admin/login');
  }

  if (loading) return <div className="p-6">Loading admin dashboard...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button onClick={logout} className="px-3 py-1.5 bg-gray-900 text-white rounded">Logout</button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded bg-white">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="text-3xl font-bold">{ordersCount ?? '—'}</div>
          <Link className="text-blue-600 text-sm" to="#">View</Link>
        </div>
        <div className="p-4 border rounded bg-white">
          <div className="text-sm text-gray-500">Ratings</div>
          <div className="text-3xl font-bold">{ratingsCount ?? '—'}</div>
          <Link className="text-blue-600 text-sm" to="#">View</Link>
        </div>
        <div className="p-4 border rounded bg-white">
          <div className="text-sm text-gray-500">Reports</div>
          <div className="text-3xl font-bold">—</div>
          <Link className="text-blue-600 text-sm" to="#">View</Link>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-6">Using admin APIs at /api/admin/*</p>
    </div>
  );
}
