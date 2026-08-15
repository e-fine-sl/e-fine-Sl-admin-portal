'use client';

import React from 'react';
import { FineDTO, FineStatus } from '@/types/fine.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
    MoreHorizontal,
    Eye,
    FileText,
    Download,
    ArrowUpDown,
    Trash2,
    ShieldAlert,
    Clock,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface FineTableProps {
    fines: FineDTO[];
    loading: boolean;
    page: number;
    pages: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    sortBy: 'date' | 'amount' | 'licenseNumber' | 'status';
    sortOrder: 'asc' | 'desc';
    onSort: (field: 'date' | 'amount' | 'licenseNumber' | 'status') => void;
    onSelectFine: (fine: FineDTO) => void;
    onUpdateStatus: (fine: FineDTO) => void;
    onDownloadPdf: (fine: FineDTO) => void;
    onDeleteFine: (fine: FineDTO) => void;
}

export const FineTable: React.FC<FineTableProps> = ({
    fines,
    loading,
    page,
    pages,
    total,
    limit,
    onPageChange,
    sortBy,
    sortOrder,
    onSort,
    onSelectFine,
    onUpdateStatus,
    onDownloadPdf,
    onDeleteFine
}) => {
    const getStatusBadge = (status: FineStatus) => {
        switch (status) {
            case 'PAID':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Paid
                    </Badge>
                );
            case 'DISPUTED':
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3 text-amber-600" />
                        Disputed
                    </Badge>
                );
            case 'REFUNDED':
                return (
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 flex items-center gap-1">
                        <RotateCcw className="h-3 w-3 text-purple-600" />
                        Refunded
                    </Badge>
                );
            case 'UNPAID':
            default:
                return (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-rose-600" />
                        Unpaid
                    </Badge>
                );
        }
    };

    return (
        <Card className="border shadow-sm overflow-hidden">
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-500">Loading traffic citations...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/80 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                                    {/* Date */}
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('date')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date & Time
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>

                                    {/* License Number */}
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('licenseNumber')}
                                    >
                                        <div className="flex items-center gap-1">
                                            License No
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>

                                    {/* Vehicle Plate */}
                                    <th className="px-4 py-3">Vehicle Plate</th>

                                    {/* Offense */}
                                    <th className="px-4 py-3">Offense / Violation</th>

                                    {/* Location */}
                                    <th className="px-4 py-3">Location & Station</th>

                                    {/* Amount */}
                                    <th 
                                        className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('amount')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Amount (LKR)
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>

                                    {/* Officer */}
                                    <th className="px-4 py-3 text-center">Officer ID</th>

                                    {/* Status */}
                                    <th 
                                        className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('status')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Status
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>

                                    {/* Actions */}
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-xs text-gray-700">
                                {fines.map((fine) => (
                                    <tr 
                                        key={fine._id} 
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectFine(fine)}
                                    >
                                        {/* Date */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 font-medium">
                                            {formatDateTime(fine.date)}
                                        </td>

                                        {/* License Number */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <Badge variant="outline" className="font-mono text-xs font-bold text-gray-900 bg-white">
                                                {fine.licenseNumber}
                                            </Badge>
                                        </td>

                                        {/* Vehicle Number */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs border">
                                                {fine.vehicleNumber}
                                            </span>
                                        </td>

                                        {/* Offense */}
                                        <td className="px-4 py-3.5 max-w-[200px]">
                                            <div className="font-semibold text-gray-900 truncate">
                                                {fine.offenseName}
                                            </div>
                                            {fine.demeritPoints && fine.demeritPoints > 0 ? (
                                                <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                                                    -{fine.demeritPoints} Demerit Points
                                                </div>
                                            ) : null}
                                        </td>

                                        {/* Location & Station */}
                                        <td className="px-4 py-3.5 max-w-[180px]">
                                            <div className="text-gray-900 font-medium truncate">{fine.place}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{fine.policeStation || 'N/A'}</div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-bold text-gray-900">
                                            {formatCurrency(fine.amount)}
                                        </td>

                                        {/* Officer ID */}
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <span className="font-mono text-[11px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border">
                                                {fine.policeOfficerId || 'ADMIN'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            {getStatusBadge(fine.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Download Single Receipt */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDownloadPdf(fine)}
                                                    className="h-7 px-2 text-[11px] text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold"
                                                    title="Download e-Fine PDF Receipt"
                                                >
                                                    <Download className="h-3 w-3 mr-1" />
                                                    PDF
                                                </Button>

                                                {/* Dropdown Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-900">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 text-xs">
                                                        <DropdownMenuLabel>Citation Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem onClick={() => onSelectFine(fine)} className="flex items-center gap-2 cursor-pointer">
                                                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                                                            View Full Details
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => onUpdateStatus(fine)} className="flex items-center gap-2 cursor-pointer">
                                                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                                                            Update Status / Dispute
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => onDownloadPdf(fine)} className="flex items-center gap-2 cursor-pointer">
                                                            <Download className="h-3.5 w-3.5 text-emerald-600" />
                                                            Download e-Fine Receipt
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem 
                                                            onClick={() => onDeleteFine(fine)} 
                                                            className="flex items-center gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete Record
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {fines.length === 0 && (
                            <div className="py-16 text-center text-gray-500">
                                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="font-semibold text-sm text-gray-700">No traffic citations found</p>
                                <p className="text-xs text-gray-400 mt-0.5">Try adjusting your filters, search term, or date range.</p>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        {total > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t bg-gray-50/50 gap-2">
                                <div className="text-xs text-gray-500">
                                    Showing <strong className="text-gray-800">{(page - 1) * limit + 1}</strong> to{' '}
                                    <strong className="text-gray-800">{Math.min(page * limit, total)}</strong> of{' '}
                                    <strong className="text-gray-800">{total.toLocaleString()}</strong> citations
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => onPageChange(page - 1)}
                                        className="h-7 text-xs px-2.5"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-xs text-gray-600 px-2 font-medium">
                                        Page {page} of {pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= pages}
                                        onClick={() => onPageChange(page + 1)}
                                        className="h-7 text-xs px-2.5"
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
