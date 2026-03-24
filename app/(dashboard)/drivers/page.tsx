'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Driver } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/drivers`, {
                params: { page, limit: 20, search }
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

    const handleSuspend = async (id: string) => {
        if (!confirm('Are you sure you want to suspend this driver\'s license?')) return;

        try {
            await api.put(`/admin/drivers/${id}/suspend`, {
                reason: 'Suspended by administrator'
            });
            toast.success('Driver license suspended successfully');
            fetchDrivers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to suspend license');
        }
    };

    const handleActivate = async (id: string) => {
        if (!confirm('Are you sure you want to activate this driver\'s license?')) return;

        try {
            await api.put(`/admin/drivers/${id}/activate`);
            toast.success('Driver license activated successfully');
            fetchDrivers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to activate license');
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
                                            <td className="px-4 py-3">
                                                <Badge variant={driver.licenseStatus === 'ACTIVE' ? 'default' : 'destructive'}>
                                                    {driver.licenseStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={driver.demeritPoints > 10 ? 'text-red-600 font-semibold' : ''}>
                                                    {driver.demeritPoints}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {driver.licenseStatus === 'ACTIVE' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleSuspend(driver._id)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Suspend
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleActivate(driver._id)}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                        Activate
                                                    </Button>
                                                )}
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
                            {total > 20 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
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
                                            disabled={page * 20 >= total}
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
        </div>
    );
}
