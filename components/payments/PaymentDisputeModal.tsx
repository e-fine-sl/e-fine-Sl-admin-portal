'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PaymentService } from '@/services/paymentService';
import { PaymentRecord, FlagDisputeDTO } from '@/types/payment.types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentRecord | null;
    onDisputeSuccess: () => void;
}

export const PaymentDisputeModal: React.FC<PaymentDisputeModalProps> = ({
    isOpen,
    onClose,
    payment,
    onDisputeSuccess
}) => {
    const [category, setCategory] = useState<FlagDisputeDTO['disputeCategory']>('DRIVER_APPEAL');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment?._id) return;
        if (!reason.trim()) {
            toast.error('Please enter a dispute reason or justification.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await PaymentService.flagDispute({
                paymentId: payment._id,
                disputeCategory: category,
                reason: reason.trim(),
                notes: notes.trim() ? notes.trim() : undefined
            });

            toast.success(res.message || 'Fine successfully flagged as DISPUTED.');
            setReason('');
            setNotes('');
            onDisputeSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to flag dispute:', error);
            toast.error(error.response?.data?.message || 'Failed to flag dispute');
        } finally {
            setSubmitting(false);
        }
    };

    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Flag Fine / Payment as Disputed
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Place fine on administrative hold for citizen appeal, chargeback, or judicial review.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-sm">
                    {/* Record Overview Card */}
                    <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Fine Reference:</span>
                            <span className="font-mono font-bold text-gray-800">#{payment._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Driver License:</span>
                            <span className="font-mono font-bold text-gray-800">{payment.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Vehicle / Offense:</span>
                            <span className="font-medium text-gray-700">{payment.vehicleNumber} • {payment.offenseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount / Status:</span>
                            <span className="font-bold text-purple-700">{formatCurrency(payment.amount)} ({payment.status})</span>
                        </div>
                    </div>

                    {/* Dispute Category */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Dispute Category</Label>
                        <Select 
                            value={category} 
                            onValueChange={(val) => setCategory(val as FlagDisputeDTO['disputeCategory'])}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select dispute category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRIVER_APPEAL">Driver Violation Appeal (Citizen Contest)</SelectItem>
                                <SelectItem value="BANK_CHARGEBACK">Bank / Cardholder Chargeback Notice</SelectItem>
                                <SelectItem value="ANPR_CAMERA_ERROR">ANPR / Speed Camera Calibration Error</SelectItem>
                                <SelectItem value="CLONED_PLATE">Cloned / Stolen Number Plate Claim</SelectItem>
                                <SelectItem value="OTHER">Administrative / Judicial Hold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason / Justification */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">
                            Reason / Justification <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="State the official ground for dispute (e.g. Citizen filed appeal affidavit ref #AP-492 claiming vehicle was in garage)..."
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            rows={3}
                            className="text-xs resize-none"
                            required
                        />
                    </div>

                    {/* Internal Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Internal Audit Notes (Optional)</Label>
                        <Textarea
                            placeholder="Optional officer badge or inquiry file reference..."
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            rows={2}
                            className="text-xs resize-none"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg flex items-start gap-2 text-xs">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                            Flagging as <strong>DISPUTED</strong> pauses automated license penalties and flags the ticket across police terminals until resolved.
                        </span>
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={submitting || !reason.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {submitting ? 'Applying Dispute...' : 'Flag as Disputed'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
