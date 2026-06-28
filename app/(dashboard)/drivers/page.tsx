'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Driver } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Search, ShieldOff, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { Trash2, FileText } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function DriversPage() {
    const { user } = useAuth();
    const canDeleteDriver = user?.role === USER_ROLES.SUPER_ADMIN;
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
        icon: string;
        iconColor: string;
        iconBgColor: string;
        title: string;
        message: string;
        confirmText: string;
        confirmColor: string;
        driverId: string;
        newStatus: 'ACTIVE' | 'SUSPENDED';
    } | null>(null);

    // Fines modal state
    const [isFinesModalOpen, setIsFinesModalOpen] = useState(false);
    const [selectedDriverFines, setSelectedDriverFines] = useState<any[]>([]);
    const [isFinesLoading, setIsFinesLoading] = useState(false);
    const [selectedDriverName, setSelectedDriverName] = useState('');

    const openFinesModal = async (driver: Driver) => {
        setSelectedDriverName(driver.name);
        setIsFinesModalOpen(true);
        setIsFinesLoading(true);
        try {
            const response = await api.get('/admin/fines', {
                params: { search: driver.licenseNumber, limit: 100 }
            });
            setSelectedDriverFines(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load fines for this driver');
        } finally {
            setIsFinesLoading(false);
        }
    };

    const handleDeleteFine = async (fineId: string) => {
        if (!confirm('Are you sure you want to delete this fine? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/fines/${fineId}`);
            toast.success('Fine deleted successfully');
            setSelectedDriverFines(prev => prev.filter(f => f._id !== fineId));
        } catch (error) {
            toast.error('Failed to delete fine');
        }
    };

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/drivers`, {
                params: { page, limit: 15, search }
            });
            setDrivers(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, [page, search]);

    const openSuspendDialog = (driver: Driver) => {
        setDialogConfig({
            icon: '⊘',
            iconColor: '#ffffff',
            iconBgColor: '#F44336',
            title: 'Suspend License',
            message: `Are you sure you want to suspend the license for ${driver.name}? The driver will be notified by email immediately.`,
            confirmText: 'Yes, Suspend',
            confirmColor: '#F44336',
            driverId: driver._id,
            newStatus: 'SUSPENDED',
        });
        setDialogOpen(true);
    };

    const openActivateDialog = (driver: Driver) => {
        setDialogConfig({
            icon: '✓',
            iconColor: '#ffffff',
            iconBgColor: '#4CAF50',
            title: 'Activate License',
            message: `Are you sure you want to activate the license for ${driver.name}? This will restore their driving privileges immediately.`,
            confirmText: 'Yes, Activate',
            confirmColor: '#4CAF50',
            driverId: driver._id,
            newStatus: 'ACTIVE',
        });
        setDialogOpen(true);
    };

    const handleStatusChange = async () => {
        if (!dialogConfig) return;

        const { driverId, newStatus } = dialogConfig;
        const endpoint = newStatus === 'SUSPENDED'
            ? `/admin/drivers/${driverId}/suspend`
            : `/admin/drivers/${driverId}/activate`;

        await api.put(endpoint, {
            reason: newStatus === 'SUSPENDED' ? 'Suspended by administrator' : undefined,
        });

        // Update locally without full refetch
        setDrivers((prev) =>
            prev.map((d) =>
                d._id === driverId
                    ? { ...d, licenseStatus: newStatus }
                    : d
            )
        );

        toast.success(
            newStatus === 'ACTIVE'
                ? '✓ License Activated — Driver has been notified by email'
                : '✗ License Suspended — Driver has been notified by email'
        );
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete driver "${name}"? This action cannot be undone.`)) return;

        try {
            await api.delete(`/admin/drivers/${id}`);
            toast.success('Driver deleted successfully');

            if (drivers.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchDrivers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete driver');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Drivers</h1>
                    <p className="text-gray-500 mt-1">Manage driver accounts and licenses</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Drivers ({total})</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by name, NIC, license..."
                                    className="pl-9 w-80"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">License Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">NIC</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Demerit Points</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Level</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map((driver) => (
                                        <tr key={driver._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <Link href={`/drivers/${driver._id}`} className="font-medium text-blue-600 hover:underline">
                                                    {driver.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{driver.licenseNumber}</td>
                                            <td className="px-4 py-3 text-sm">{driver.nic}</td>
                                            <td className="px-4 py-3 text-sm">{driver.email}</td>

                                            {/* Premium Status Pill */}
                                            <td className="px-4 py-3">
                                                {driver.licenseStatus === 'ACTIVE' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D32' }} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C62828' }} />
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                                <span className={driver.demeritPoints < 10 ? 'text-red-600 font-semibold' : ''}>
                                                    {driver.demeritPoints} / 24
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <span className="font-semibold">{driver.ratingScore?.toFixed(1) || '0.0'}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                                {(() => {
                                                    const colors: Record<string, { bg: string, text: string, dot: string }> = {
                                                        'EXCELLENT': { bg: '#E3F2FD', text: '#1565C0', dot: '#1565C0' },
                                                        'GOOD':      { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
                                                        'FAIR':      { bg: '#FFF8E1', text: '#F9A825', dot: '#F9A825' },
                                                        'WARNING':   { bg: '#FFF3E0', text: '#EF6C00', dot: '#EF6C00' },
                                                        'DANGER':    { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
                                                        'SUSPENDED': { bg: '#FAFAFA', text: '#616161', dot: '#616161' },
                                                    };
                                                    const style = colors[driver.demeritLevel] || colors['EXCELLENT'];
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                                            style={{ backgroundColor: style.bg, color: style.text }}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                                                            {driver.demeritLevel}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Action Icon Button */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {driver.licenseStatus === 'ACTIVE' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            title="Suspend License"
                                                            onClick={() => openSuspendDialog(driver)}
                                                        >
                                                            <ShieldOff className="h-4 w-4 mr-1" />
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            title="Activate License"
                                                            onClick={() => openActivateDialog(driver)}
                                                        >
                                                            <ShieldCheck className="h-4 w-4 mr-1" />
                                                            Activate
                                                        </Button>
                                                    )}
                                                    
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" 
                                                        onClick={() => openFinesModal(driver)} 
                                                        title="View Fines"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1"/> Fines
                                                    </Button>

                                                    {canDeleteDriver && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                            title="Delete Driver"
                                                            onClick={() => handleDelete(driver._id, driver.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {drivers.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No drivers found
                                </div>
                            )}

                            {/* Pagination */}
                            {total > 15 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page * 15 >= total}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reusable Confirm Dialog */}
            {dialogConfig && (
                <ConfirmDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    icon={dialogConfig.icon}
                    iconColor={dialogConfig.iconColor}
                    iconBgColor={dialogConfig.iconBgColor}
                    title={dialogConfig.title}
                    message={dialogConfig.message}
                    confirmText={dialogConfig.confirmText}
                    confirmColor={dialogConfig.confirmColor}
                    onConfirm={handleStatusChange}
                />
            )}

            {/* Fines Viewer Dialog */}
            <Dialog open={isFinesModalOpen} onOpenChange={setIsFinesModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Fine History: <span className="text-blue-600">{selectedDriverName}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {isFinesLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : selectedDriverFines.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
                                <p>No fines found for this driver.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 border-b text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Offense</th>
                                            <th className="px-4 py-3 font-medium">Location</th>
                                            <th className="px-4 py-3 font-medium">Amount</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            {user?.role === USER_ROLES.SUPER_ADMIN && (
                                                <th className="px-4 py-3 font-medium text-right">Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedDriverFines.map(fine => (
                                            <tr key={fine._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(fine.date)}</td>
                                                <td className="px-4 py-3">{fine.offenseName}</td>
                                                <td className="px-4 py-3 text-gray-600">{fine.place}</td>
                                                <td className="px-4 py-3 font-semibold">Rs. {fine.amount}</td>
                                                <td className="px-4 py-3">
                                                    <Badge 
                                                        className={fine.status === 'PAID' ? 'bg-emerald-900 hover:bg-emerald-800 text-white' : ''}
                                                        variant={fine.status === 'PAID' ? 'default' : 'destructive'}
                                                    >
                                                        {fine.status}
                                                    </Badge>
                                                </td>
                                                {user?.role === USER_ROLES.SUPER_ADMIN && (
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                                                            title="Delete Fine"
                                                            onClick={() => handleDeleteFine(fine._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
