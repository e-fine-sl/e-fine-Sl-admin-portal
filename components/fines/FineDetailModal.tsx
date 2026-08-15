'use client';

import React, { useEffect, useState } from 'react';
import { FineDTO } from '@/types/fine.types';
import { FineService } from '@/services/fineService';
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
    FileText, 
    User, 
    Shield, 
    CreditCard, 
    MapPin, 
    Calendar,
    Download,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Scale
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface FineDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    fine: FineDTO | null;
    onUpdateStatus?: (fine: FineDTO) => void;
}

export const FineDetailModal: React.FC<FineDetailModalProps> = ({
    isOpen,
    onClose,
    fine,
    onUpdateStatus
}) => {
    const [detail, setDetail] = useState<FineDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (isOpen && fine?._id) {
            setLoading(true);
            FineService.getFineById(fine._id)
                .then((data) => setDetail(data))
                .catch((err) => console.error('Failed to load fine details:', err))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
        }
    }, [isOpen, fine]);

    if (!fine) return null;

    const data = detail || fine;

    const handleDownloadReceipt = async () => {
        try {
            setDownloading(true);
            const blob = await FineService.downloadReceiptPdf(data._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `eFine-Receipt-${data._id.slice(-8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('e-Fine Receipt downloaded');
        } catch (error) {
            console.error('Failed to download receipt:', error);
            toast.error('Failed to download receipt PDF');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    Citation #{data._id.slice(-8).toUpperCase()}
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {data.vehicleNumber}
                                    </Badge>
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Issued on {formatDateTime(data.date)}
                                </p>
                            </div>
                        </div>

                        <Badge 
                            className={
                                data.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : data.status === 'DISPUTED'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                        >
                            {data.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                    {/* Financial & Penalty Strip */}
                    <div className="grid grid-cols-3 gap-3 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border text-center">
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Fine Penalty</span>
                            <span className="text-xl font-bold font-mono text-gray-900 mt-0.5 block">
                                {formatCurrency(data.amount)}
                            </span>
                            <span className="text-[10px] text-gray-500 block">Statutory Fine Amount</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Demerit Impact</span>
                            <span className="text-xl font-bold font-mono text-rose-600 mt-0.5 block">
                                -{data.demeritPoints || 0} pts
                            </span>
                            <span className="text-[10px] text-gray-500 block">Deducted from License</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Payment Status</span>
                            <span className={`text-base font-bold mt-1 block ${data.status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {data.status}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                                {data.paidAt ? formatDateTime(data.paidAt) : 'Pending Settlement'}
                            </span>
                        </div>
                    </div>

                    {/* Section 1: Offense & Legal Particulars */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <Scale className="h-3.5 w-3.5 text-purple-600" />
                            Traffic Offense Particulars
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5 bg-white p-3 rounded-lg border text-xs">
                            <div>
                                <span className="text-gray-400 block">Offense Description</span>
                                <span className="font-semibold text-gray-900">{data.offenseName}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Section of Motor Traffic Act</span>
                                <span className="font-semibold text-gray-900">
                                    {(typeof data.offenseId === 'object' && data.offenseId?.sectionOfAct) || 'Motor Traffic Act #14'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Incident Location</span>
                                <span className="font-semibold text-gray-900">{data.place}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Police Command Station</span>
                                <span className="font-semibold text-gray-900">{data.policeStation || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Driver & Officer Profile Linkages */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Driver Box */}
                        <div className="bg-white p-3 rounded-lg border space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-blue-600" />
                                    Motorist Profile
                                </h4>
                                {data.driverDetails?.id && (
                                    <Button variant="ghost" size="sm" asChild className="h-6 text-[10px] px-1.5 text-blue-600 hover:bg-blue-50">
                                        <Link href={`/drivers/${data.driverDetails.id}`}>
                                            View Profile <ExternalLink className="h-2.5 w-2.5 ml-1" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Driver Name</span>
                                <span className="font-semibold text-gray-900">{data.driverDetails?.name || 'Registered Driver'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Driving License No</span>
                                <span className="font-mono font-semibold text-gray-900">{data.licenseNumber}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">NIC & Contact</span>
                                <span className="text-gray-700">{data.driverDetails?.nic || 'N/A'} • {data.driverDetails?.phone || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Officer Box */}
                        <div className="bg-white p-3 rounded-lg border space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                                Issuing Police Officer
                            </h4>
                            <div>
                                <span className="text-gray-400 block">Officer Name</span>
                                <span className="font-semibold text-gray-900">{data.officerDetails?.name || 'Traffic Police Officer'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Badge Number</span>
                                <span className="font-mono font-semibold text-gray-900">{data.policeOfficerId || 'ADMIN'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Station & Position</span>
                                <span className="text-gray-700">
                                    {data.officerDetails?.policeStation || data.policeStation || 'HQ'} • {data.officerDetails?.position || 'Traffic Division'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Dispute & Administrative Notes (if present) */}
                    {(data.disputeReason || data.paymentNotes) && (
                        <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 space-y-1">
                            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                                Administrative Notes & Dispute Record
                            </h4>
                            {data.disputeReason && (
                                <div>
                                    <span className="text-gray-600">Dispute Reason: </span>
                                    <strong className="text-amber-900">{data.disputeReason}</strong>
                                </div>
                            )}
                            {data.paymentNotes && (
                                <div>
                                    <span className="text-gray-600">Admin Remarks: </span>
                                    <span className="text-gray-800">{data.paymentNotes}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between w-full">
                    <div className="flex items-center gap-2">
                        {onUpdateStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onClose();
                                    onUpdateStatus(data);
                                }}
                                className="text-xs flex items-center gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-50"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Update Status / Dispute
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadReceipt}
                            disabled={downloading}
                            className="text-xs flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 border-blue-200"
                        >
                            <Download className="h-3.5 w-3.5" />
                            {downloading ? 'Downloading...' : 'e-Fine Receipt PDF'}
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
