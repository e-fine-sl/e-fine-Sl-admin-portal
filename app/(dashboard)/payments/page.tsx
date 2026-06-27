'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { IssuedFine } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<IssuedFine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/payments`, {
                params: { page, limit: 20, search }
            });
            setPayments(response.data.data);
            setTotal(response.data.total);

            // Calculate total revenue from fetched payments
            const revenue = response.data.data.reduce((sum: number, p: IssuedFine) => sum + p.amount, 0);
            setTotalRevenue(revenue);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, search]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payments</h1>
                    <p className="text-gray-500 mt-1">Track all fine payments</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Current Page Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Average Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(payments.length > 0 ? totalRevenue / payments.length : 0)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Payment History ({total})</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by license, vehicle..."
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">License Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vehicle</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Offense</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                {payment.paidAt ? formatDateTime(payment.paidAt) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium">{payment.licenseNumber}</td>
                                            <td className="px-4 py-3 text-sm">{payment.vehicleNumber}</td>
                                            <td className="px-4 py-3 text-sm">{payment.offenseName}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-xs">
                                                {payment.paymentId || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {payments.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No payments found
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
