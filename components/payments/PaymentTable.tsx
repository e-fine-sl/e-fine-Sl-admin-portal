'use client';

import React from 'react';
import { PaymentRecord } from '@/types/payment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
    Eye, 
    Download, 
    ArrowUpDown, 
    ShieldCheck, 
    AlertCircle, 
    RotateCcw, 
    FileText, 
    CheckCircle2,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

interface PaymentTableProps {
    payments: PaymentRecord[];
    loading: boolean;
    page: number;
    pages: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    sortBy: 'paidAt' | 'amount' | 'licenseNumber' | 'date';
    sortOrder: 'asc' | 'desc';
    onSort: (column: 'paidAt' | 'amount' | 'licenseNumber' | 'date') => void;
    onSelectPayment: (payment: PaymentRecord) => void;
    onDownloadReceipt: (paymentId: string) => void;
    onOpenReconcile: (payment: PaymentRecord) => void;
    onOpenRefund: (payment: PaymentRecord) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
    payments,
    loading,
    page,
    pages,
    total,
    limit,
    onPageChange,
    sortBy,
    sortOrder,
    onSort,
    onSelectPayment,
    onDownloadReceipt,
    onOpenReconcile,
    onOpenRefund,
}) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Paid
                    </Badge>
                );
            case 'REFUNDED':
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1 font-medium">
                        <RotateCcw className="h-3 w-3 text-amber-600" />
                        Refunded
                    </Badge>
                );
            case 'DISPUTED':
                return (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        Disputed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-gray-50/50">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Settlement Ledger ({total.toLocaleString()} records)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-500 font-medium">Loading settlement records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/75 text-xs uppercase font-semibold text-gray-600 tracking-wider">
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('paidAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Payment Date
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">License & Vehicle</th>
                                    <th className="px-4 py-3">Offense / Violation</th>
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('amount')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Amount (LKR)
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">Payment ID / Gateway Ref</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm text-gray-700">
                                {payments.map((payment) => (
                                    <tr 
                                        key={payment._id} 
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectPayment(payment)}
                                    >
                                        {/* Date */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {payment.paidAt ? formatDateTime(payment.paidAt) : formatDateTime(payment.date)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Issued: {formatDateTime(payment.date)}
                                            </div>
                                        </td>

                                        {/* License & Vehicle */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-gray-900 tracking-wide font-mono">
                                                {payment.licenseNumber}
                                            </div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase">
                                                {payment.vehicleNumber}
                                            </div>
                                        </td>

                                        {/* Offense */}
                                        <td className="px-4 py-3.5 max-w-xs">
                                            <div className="font-medium text-gray-900 truncate">
                                                {payment.offenseName}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <span>{payment.province ? `${payment.province} • ` : ''}{payment.place}</span>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-emerald-600">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                {payment.paymentMethod || 'PAYHERE_GATEWAY'}
                                            </div>
                                        </td>

                                        {/* Payment ID / Ref */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-mono text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded inline-block max-w-[140px] truncate">
                                                {payment.paymentId || payment.gatewayPaymentId || 'N/A'}
                                            </div>
                                            {payment.policeOfficerId && (
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Officer: {payment.policeOfficerId}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {renderStatusBadge(payment.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                {/* View Detail */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                    title="View Transaction Details"
                                                    onClick={() => onSelectPayment(payment)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Download Receipt */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50"
                                                    title="Download Official Receipt (PDF)"
                                                    onClick={() => onDownloadReceipt(payment._id)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>

                                                {/* Verify with Gateway */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                    title="Reconcile with PayHere Gateway"
                                                    onClick={() => onOpenReconcile(payment)}
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                </Button>

                                                {/* Super Admin Refund */}
                                                {isSuperAdmin && payment.status === 'PAID' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                                                        title="Authorize Refund / Dispute"
                                                        onClick={() => onOpenRefund(payment)}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {payments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                                <h3 className="text-base font-semibold text-gray-700">No payment records found</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1">
                                    Try adjusting your search criteria, date ranges, or status filters.
                                </p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {total > limit && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50/50 gap-3">
                                <p className="text-xs text-gray-600">
                                    Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
                                    <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-semibold">{total.toLocaleString()}</span> settlements
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => onPageChange(page - 1)}
                                        className="h-8 text-xs font-medium"
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-xs text-gray-600 font-medium px-2">
                                        Page {page} of {pages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= pages}
                                        onClick={() => onPageChange(page + 1)}
                                        className="h-8 text-xs font-medium"
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
    );
};
