'use client';

import React, { useEffect, useState } from 'react';
import { PaymentRecord } from '@/types/payment.types';
import { PaymentService } from '@/services/paymentService';
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
    CreditCard, 
    User, 
    ShieldAlert, 
    FileText, 
    Download, 
    MapPin, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    RotateCcw,
    ShieldCheck,
    Hash,
    BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentRecord | null;
    onDownloadReceipt: (paymentId: string) => void;
    onOpenReconcile: (payment: PaymentRecord) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
    isOpen,
    onClose,
    payment,
    onDownloadReceipt,
    onOpenReconcile,
}) => {
    const [fullDetail, setFullDetail] = useState<PaymentRecord | null>(payment);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && payment?._id) {
            setFullDetail(payment);
            setLoading(true);
            PaymentService.getPaymentById(payment._id)
                .then((data) => setFullDetail(data))
                .catch((err) => console.error('Failed to load deep payment detail:', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, payment]);

    const current = fullDetail || payment;
    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold">
                                    Payment Record #{current._id.slice(-8).toUpperCase()}
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Official Treasury Settlement Details
                                </p>
                            </div>
                        </div>
                        <Badge 
                            className={
                                current.status === 'PAID' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : current.status === 'REFUNDED'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : current.status === 'DISPUTED'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                        >
                            {current.status === 'UNPAID' ? 'UNPAID / PENDING' : current.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Financial Summary Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {current.status === 'PAID' ? 'Settlement Amount' : 'Fine Amount Due'}
                            </span>
                            <div className={`text-2xl font-black ${current.status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(current.amount)}
                            </div>
                            <span className="text-xs text-gray-500">
                                Method: <strong className="text-gray-700">
                                    {current.status === 'PAID' ? (current.paymentMethod || 'PAYHERE_GATEWAY') : 'Awaiting Payment'}
                                </strong>
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Timestamp</span>
                            <div className="text-sm font-semibold text-gray-800">
                                {current.paidAt ? formatDateTime(current.paidAt) : 'Pending Settlement'}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                                {current.status === 'PAID' 
                                    ? `Ref: ${current.paymentId || current.gatewayPaymentId || 'N/A'}`
                                    : `Issued: ${formatDateTime(current.date)}`
                                }
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Driver & Offender Profile */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-600" />
                            Driver / Offender Profile
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border text-sm">
                            <div>
                                <span className="text-xs text-gray-400 block">Driving License</span>
                                <span className="font-bold text-gray-900 font-mono">{current.licenseNumber}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Vehicle Number</span>
                                <span className="font-semibold text-gray-800 uppercase">{current.vehicleNumber}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Driver Name</span>
                                <span className="font-medium text-gray-800">
                                    {current.driver?.name || 'Registered Driver'}
                                </span>
                            </div>
                            {current.driver?.nic && (
                                <div>
                                    <span className="text-xs text-gray-400 block">National Identity (NIC)</span>
                                    <span className="font-medium text-gray-800">{current.driver.nic}</span>
                                </div>
                            )}
                            {current.driver?.phone && (
                                <div>
                                    <span className="text-xs text-gray-400 block">Contact Phone</span>
                                    <span className="font-medium text-gray-800">{current.driver.phone}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-xs text-gray-400 block">Demerit Points</span>
                                <span className="font-medium text-rose-600">
                                    -{current.demeritPoints || 0} pts deducted
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Violation & Legal Particulars */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            Violation & Offense Details
                        </h4>
                        <div className="bg-white p-3 rounded-lg border text-sm space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-semibold text-gray-900 block">{current.offenseName}</span>
                                    <span className="text-xs text-gray-500">
                                        Location: {current.place} {current.district ? `(${current.district}, ${current.province})` : ''}
                                    </span>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                    Officer: {current.policeOfficerId}
                                </Badge>
                            </div>
                            <div className="text-xs text-gray-500 pt-1 border-t flex justify-between">
                                <span>Violation Timestamp: {formatDateTime(current.date)}</span>
                                <span>Police Station: {current.policeStation || 'Traffic HQ'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Gateway & Audit Ledger */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <BadgeCheck className="h-4 w-4 text-emerald-600" />
                            Gateway Ledger & Audit Log
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg border text-xs font-mono space-y-1 text-gray-600">
                            <div>Payment Gateway: PayHere IPN / LankaPay</div>
                            <div>Gateway Transaction ID: {current.gatewayPaymentId || current.paymentId || 'N/A'}</div>
                            <div>Internal Fine Reference ID: {current._id}</div>
                            {current.paymentNotes && (
                                <div className="text-blue-600 font-sans mt-1">
                                    Notes: {current.paymentNotes}
                                </div>
                            )}
                            {current.status === 'REFUNDED' && (
                                <div className="text-amber-700 font-sans mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                                    <strong>Refunded on:</strong> {current.refundedAt ? formatDateTime(current.refundedAt) : 'N/A'}<br />
                                    <strong>Authorized by:</strong> {current.refundedBy || 'Admin'}<br />
                                    <strong>Reason:</strong> {current.disputeReason || 'Administrative resolution'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenReconcile(current)}
                            className="text-xs flex items-center gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verify with Gateway
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onDownloadReceipt(current._id)}
                            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download PDF Receipt
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
