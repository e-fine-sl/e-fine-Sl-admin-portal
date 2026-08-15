'use client';

import React, { useEffect, useState } from 'react';
import { OfficerDTO, OfficerDetailDTO } from '@/types/officer.types';
import { OfficerService } from '@/services/officerService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
    User, 
    Building2, 
    ShieldCheck, 
    ShieldAlert, 
    FileText, 
    Phone, 
    Mail, 
    CreditCard, 
    Calendar,
    Radio,
    Clock,
    Pencil,
    ArrowRightLeft
} from 'lucide-react';

interface OfficerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: OfficerDTO | null;
    onEdit?: (officer: OfficerDTO) => void;
    onTransfer?: (officer: OfficerDTO) => void;
}

export const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({
    isOpen,
    onClose,
    officer,
    onEdit,
    onTransfer
}) => {
    const [detail, setDetail] = useState<OfficerDetailDTO | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && officer?._id) {
            setLoading(true);
            OfficerService.getOfficerById(officer._id)
                .then((data) => setDetail(data))
                .catch((err) => console.error('Failed to load officer details:', err))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
        }
    }, [isOpen, officer]);

    if (!officer) return null;

    const current = detail || (officer as any);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                                {officer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {officer.name}
                                    <Badge variant="outline" className="font-mono text-xs">
                                        Badge #{officer.badgeNumber}
                                    </Badge>
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {officer.position} • {officer.policeStation}
                                </p>
                            </div>
                        </div>

                        <Badge 
                            className={
                                officer.isActive 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                        >
                            {officer.isActive ? 'Active Duty' : 'Suspended'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-5 py-2 text-sm">
                    {/* Enforcement Performance Summary */}
                    {detail?.enforcementStats && (
                        <div className="grid grid-cols-3 gap-3 bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 rounded-xl border text-center">
                            <div>
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Citations Issued</span>
                                <span className="text-xl font-bold text-gray-900">{detail.enforcementStats.totalFines.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-500 block">Total violations</span>
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Penalty Volume</span>
                                <span className="text-xl font-bold text-blue-600">{formatCurrency(detail.enforcementStats.totalAmount)}</span>
                                <span className="text-[10px] text-gray-500 block">Imposed fines</span>
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Settlement Rate</span>
                                <span className="text-xl font-bold text-emerald-600">{detail.enforcementStats.collectionRate}%</span>
                                <span className="text-[10px] text-gray-500 block">{detail.enforcementStats.paidFines} settled fines</span>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Personnel & Contact Particulars */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-600" />
                            Officer Particulars
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border text-xs">
                            <div>
                                <span className="text-gray-400 block">National Identity (NIC)</span>
                                <span className="font-semibold text-gray-800">{officer.nic || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Contact Phone</span>
                                <span className="font-semibold text-gray-800">{officer.phone || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Official Email</span>
                                <span className="font-semibold text-gray-800 truncate block">{officer.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Assigned Station</span>
                                <span className="font-semibold text-gray-800">{officer.policeStation}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Rank / Position</span>
                                <span className="font-semibold text-gray-800">{officer.position}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Live Duty State</span>
                                <span className="font-semibold text-gray-800">{officer.appState || 'LOGGED_OUT'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Recent Issued Violations */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-amber-600" />
                            Recent Enforcement Log (Last 10 Tickets)
                        </h4>
                        
                        {detail?.recentFines && detail.recentFines.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
                                        <tr>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Vehicle / License</th>
                                            <th className="px-3 py-2">Violation</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="px-3 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {detail.recentFines.map((fine) => (
                                            <tr key={fine._id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(fine.date)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap font-mono">{fine.vehicleNumber}</td>
                                                <td className="px-3 py-2 max-w-[150px] truncate">{fine.offenseName}</td>
                                                <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(fine.amount)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                        fine.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        {fine.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-500 border">
                                No recent citation records found for this badge number.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between w-full">
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onClose();
                                    onEdit(officer);
                                }}
                                className="text-xs flex items-center gap-1.5"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Profile
                            </Button>
                        )}
                        {onTransfer && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onClose();
                                    onTransfer(officer);
                                }}
                                className="text-xs flex items-center gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                Transfer Station
                            </Button>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
