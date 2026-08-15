'use client';

import React, { useEffect, useState } from 'react';
import { DriverDTO, DriverDetailDTO } from '@/types/driver.types';
import { DriverService } from '@/services/driverService';
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
    CreditCard, 
    ShieldAlert, 
    ShieldCheck, 
    FileText, 
    Star, 
    Calendar,
    Phone,
    Mail,
    MapPin,
    Car,
    ExternalLink,
    Pencil,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface DriverDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: DriverDTO | null;
    onEdit?: (driver: DriverDTO) => void;
}

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({
    isOpen,
    onClose,
    driver,
    onEdit
}) => {
    const [detail, setDetail] = useState<DriverDetailDTO | null>(null);
    const [violations, setViolations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && driver?._id) {
            setLoading(true);
            DriverService.getDriverById(driver._id)
                .then((res) => {
                    setDetail(res.driver);
                    setViolations(res.violations || []);
                })
                .catch((err) => console.error('Failed to load driver details:', err))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
            setViolations([]);
        }
    }, [isOpen, driver]);

    if (!driver) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                                {detail?.profileImage || driver.profileImage ? (
                                    <img 
                                        src={detail?.profileImage || driver.profileImage} 
                                        alt={driver.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span>{driver.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {driver.name}
                                    <Badge variant="outline" className="font-mono text-xs">
                                        License #{driver.licenseNumber}
                                    </Badge>
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    NIC: {driver.nic} • Phone: {driver.phone}
                                </p>
                            </div>
                        </div>

                        <Badge 
                            className={
                                driver.licenseStatus === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                        >
                            {driver.licenseStatus === 'ACTIVE' ? 'Active Driving' : 'Suspended'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                    {/* Demerit & Violation KPI Strip */}
                    <div className="grid grid-cols-4 gap-2 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border text-center">
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Demerit Points</span>
                            <span className={`text-lg font-bold font-mono ${
                                driver.demeritPoints <= 4 ? 'text-rose-600' : driver.demeritPoints <= 10 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                                {driver.demeritPoints} / 24
                            </span>
                            <span className="text-[10px] text-gray-500 block">{driver.demeritLevel}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Driver Rating</span>
                            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg mt-0.5">
                                <Star className="h-4 w-4 fill-current" />
                                <span>{(driver.ratingScore ?? 5.0).toFixed(1)}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block">Out of 5.0</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Total Citations</span>
                            <span className="text-lg font-bold text-gray-900">
                                {detail?.enforcementSummary?.totalFines ?? driver.finesCount ?? 0}
                            </span>
                            <span className="text-[10px] text-gray-500 block">Tickets issued</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Unpaid Balance</span>
                            <span className="text-lg font-bold text-rose-600">
                                {formatCurrency(detail?.enforcementSummary?.unpaidAmount ?? 0)}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                                {detail?.enforcementSummary?.unpaidFines ?? 0} unpaid fines
                            </span>
                        </div>
                    </div>

                    {/* Section 1: Demographic & Identity Particulars */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            Driver Particulars
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-lg border text-xs">
                            <div>
                                <span className="text-gray-400 block">National Identity (NIC)</span>
                                <span className="font-semibold text-gray-800">{driver.nic}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Official Email</span>
                                <span className="font-semibold text-gray-800 truncate block">{driver.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Contact Phone</span>
                                <span className="font-semibold text-gray-800">{driver.phone}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Registered Vehicle</span>
                                <span className="font-semibold text-gray-800">{driver.vehicleNumber || 'None registered'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Residential City</span>
                                <span className="font-semibold text-gray-800">{driver.city || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">KYC Verification</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                    {driver.kycVerified ? <><CheckCircle2 className="h-3 w-3" /> Face Verified</> : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Recent Issued Citations */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-amber-600" />
                            Recent Violation History (Last 10 Tickets)
                        </h4>
                        
                        {violations.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
                                        <tr>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Offense / Violation</th>
                                            <th className="px-3 py-2">Location</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="px-3 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {violations.slice(0, 10).map((fine) => (
                                            <tr key={fine._id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(fine.date)}</td>
                                                <td className="px-3 py-2 max-w-[150px] truncate">{fine.offenseName || fine.offenseId?.offenseName}</td>
                                                <td className="px-3 py-2 text-gray-500">{fine.place || 'N/A'}</td>
                                                <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(fine.amount)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                        (fine.status || '').toUpperCase() === 'PAID' 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : 'bg-rose-50 text-rose-700'
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
                                Clean driving record. No violations recorded in database.
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
                                    onEdit(driver);
                                }}
                                className="text-xs flex items-center gap-1.5"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Particulars
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 border-blue-200"
                        >
                            <Link href={`/drivers/${driver._id}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Full Profile
                            </Link>
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
