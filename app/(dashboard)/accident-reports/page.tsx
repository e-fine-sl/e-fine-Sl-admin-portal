'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { AccidentReport, AccidentStatsResponse, SL_PROVINCES, SL_DISTRICTS } from '@/types';
import { ACCIDENT_STATUSES, ACCIDENT_TYPE_ICONS } from '@/lib/constants';
import { Activity, CheckCircle, MapPin, Search, Eye, AlertCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AccidentReportsPage() {
  const { token, user } = useAuth();
  const { notifications } = useSocket();
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [stats, setStats] = useState<AccidentStatsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [province, setProvince] = useState('all');
  const [district, setDistrict] = useState('all');
  const [status, setStatus] = useState('all');
  
  // Dialog state
  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchReports();
    }
  }, [token, province, district, status]);

  // Watch for new notifications from socket context
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      setReports((prev) => {
        // Prevent duplicates
        if (prev.some(r => r._id === latest._id)) return prev;
        return [latest, ...prev];
      });
      fetchStats(); // Update the top cards instantly
    }
  }, [notifications]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/accident/reports/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accident/reports', {
        params: { province, district, status, limit: 50 }
      });
      if (res.data.success) setReports(res.data.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setIsUpdateLoading(true);
    try {
      const res = await api.patch(
        `/accident/reports/${reportId}/status`,
        { status: newStatus, adminName: user?.name }
      );
      
      if (res.data.success) {
        setReports(reports.map(r => r._id === reportId ? res.data.data : r));
        setSelectedReport(res.data.data);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleNotifyDivision = async (reportId: string) => {
    if (!confirm('This will send another email to the local police station. Continue?')) return;
    
    setIsUpdateLoading(true);
    try {
      const res = await api.post(
        `/accident/reports/${reportId}/notify-division`,
        { adminName: user?.name }
      );
      
      if (res.data.success) {
        alert('Police division notified successfully!');
        fetchReports();
      }
    } catch (err: any) {
      console.error('Failed to notify division', err);
      alert(err.response?.data?.message || 'Failed to notify division');
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const getStatusBadgeColor = (s: string) => {
    switch(s) {
      case 'OPEN': return 'bg-red-100 text-red-800 border-red-200';
      case 'ACKNOWLEDGED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accident Reports</h1>
          <p className="text-gray-500">Monitor and manage road accidents nationwide</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-gray-100 rounded-lg text-gray-600 mr-4">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center">
          <div className="p-3 bg-red-100 rounded-lg text-red-600 mr-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-red-600 font-medium">Open / Unresolved</p>
            <p className="text-2xl font-bold text-red-700">{stats?.open || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Acknowledged</p>
            <p className="text-2xl font-bold text-blue-700">{stats?.acknowledged || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center">
          <div className="p-3 bg-green-100 rounded-lg text-green-600 mr-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Resolved</p>
            <p className="text-2xl font-bold text-green-700">{stats?.resolved || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={province}
            onChange={e => setProvince(e.target.value)}
          >
            <option value="all">All Provinces</option>
            {SL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={district}
            onChange={e => setDistrict(e.target.value)}
          >
            <option value="all">All Districts</option>
            {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <button 
          onClick={fetchReports}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Search className="h-4 w-4 mr-2" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No accident reports found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Driver</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{report.accidentType}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{report.policeDivision}</p>
                      <p className="text-xs text-gray-500">{report.district}, {report.province}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{report.driverName}</p>
                      <p className="text-xs text-gray-500">{report.driverLicense}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(report.reportedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              {selectedReport?.accidentType} Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="mt-4 space-y-6">
              {/* Header Status */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {selectedReport.status === 'OPEN' && (
                    <button 
                      onClick={() => handleStatusUpdate(selectedReport._id, 'ACKNOWLEDGED')}
                      disabled={isUpdateLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Acknowledge
                    </button>
                  )}
                  {['OPEN', 'ACKNOWLEDGED'].includes(selectedReport.status) && (
                    <button 
                      onClick={() => handleStatusUpdate(selectedReport._id, 'RESOLVED')}
                      disabled={isUpdateLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Driver Info</h4>
                  <p className="font-medium">{selectedReport.driverName}</p>
                  <p className="text-sm text-gray-600 mt-1">License: {selectedReport.driverLicense}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedReport.driverPhone || 'N/A'}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Location</h4>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-red-500" /> 
                    {selectedReport.policeDivision}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{selectedReport.district}, {selectedReport.province}</p>
                  <a 
                    href={`https://maps.google.com/?q=${selectedReport.location.coordinates[1]},${selectedReport.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View on Google Maps ↗
                  </a>
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 uppercase mb-2">Driver Description</h4>
                  <p className="text-sm text-yellow-900">{selectedReport.description}</p>
                </div>
              )}

              {/* Notifications */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex justify-between items-center">
                  System Actions
                  <button 
                    onClick={() => handleNotifyDivision(selectedReport._id)}
                    disabled={isUpdateLoading}
                    className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    Manually Notify Division
                  </button>
                </h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {selectedReport.officersNotified} nearby officer(s) alerted via push notification
                  </li>
                  <li className="flex items-center">
                    {selectedReport.emailSent ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    Email sent to {selectedReport.stationNotified || 'nearest station'}
                  </li>
                </ul>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
