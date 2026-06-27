'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { IssuedFine } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function FinesPage() {
    const [fines, setFines] = useState<IssuedFine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'UNPAID'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get(`/admin/fines`, { params });
            setFines(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch fines:', error);
            toast.error('Failed to load fines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, [page, search, statusFilter, startDate, endDate]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Fines</h1>
                    <p className="text-gray-500 mt-1">View and manage all issued fines</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Fines ({total})</CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Date Pickers */}
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    className="w-40"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Start Date"
                                />
                                <span className="text-gray-400">to</span>
                                <Input
                                    type="date"
                                    className="w-40"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="End Date"
                                />
                                {(startDate || endDate) && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                        }}
                                        className="text-xs h-9"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="px-3 py-2 border rounded-md text-sm h-10"
                            >
                                <option value="all">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="UNPAID">Unpaid</option>
                            </select>
 
                             {/* Search */}
                             <div className="relative">
                                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                 <Input
                                     placeholder="Search by license, vehicle, location, officer..."
                                     className="pl-9 w-64 h-10"
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">License Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vehicle Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Offense</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Officer ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fines.map((fine) => (
                                        <tr key={fine._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{formatDate(fine.date)}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{fine.licenseNumber}</td>
                                            <td className="px-4 py-3 text-sm">{fine.vehicleNumber}</td>
                                            <td className="px-4 py-3 text-sm">{fine.offenseName}</td>
                                            <td className="px-4 py-3 text-sm">{fine.place}</td>
                                            <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(fine.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">{fine.policeOfficerId || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <Badge 
                                                    className={fine.status === 'PAID' ? 'bg-emerald-900 hover:bg-emerald-800 text-white' : ''}
                                                    variant={fine.status === 'PAID' ? 'default' : 'destructive'}
                                                >
                                                    {fine.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {fines.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No fines found
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
        </div>
    );
}
