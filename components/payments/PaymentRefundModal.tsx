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
import { Input } from '@/components/ui/input';
import { PaymentService } from '@/services/paymentService';
import { PaymentRecord } from '@/types/payment.types';
import { formatCurrency } from '@/lib/utils';
import { RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentRecord | null;
    onRefundSuccess: () => void;
}

export const PaymentRefundModal: React.FC<PaymentRefundModalProps> = ({
    isOpen,
    onClose,
    payment,
    onRefundSuccess
}) => {
    const [reason, setReason] = useState('');
    const [treasuryRef, setTreasuryRef] = useState('');
    const [restoreDemerit, setRestoreDemerit] = useState(true);
    const [processing, setProcessing] = useState(false);

    const handleProcessRefund = async () => {
        if (!payment?._id) return;
        if (!reason.trim()) {
            toast.error('Please enter an official administrative reason for the refund.');
            return;
        }

        try {
            setProcessing(true);
            const res = await PaymentService.processRefund({
                paymentId: payment._id,
                reason: reason.trim(),
                treasuryReference: treasuryRef.trim() || undefined,
                restoreDemeritPoints: restoreDemerit
            });

            if (res.success) {
                toast.success(res.message || 'Payment successfully marked as Refunded.');
                onRefundSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Refund failed:', error);
            toast.error(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setProcessing(false);
        }
    };

    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-rose-950">
                                Authorize Payment Refund
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Super Administrator Dispute & Treasury Reversal
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                    {/* Warning Banner */}
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-900">
                        <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold block">Caution: Financial Mutation</span>
                            This will reverse the payment status for License <strong>{payment.licenseNumber}</strong> and record an immutable audit note.
                        </div>
                    </div>

                    {/* Fine Details */}
                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Violation:</span>
                            <span className="font-medium text-gray-800">{payment.offenseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Refund Amount:</span>
                            <span className="font-bold text-rose-600">{formatCurrency(payment.amount)}</span>
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Official Reason / Case Ref <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g. Magistrate Court Case #4582 Dismissal"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Treasury Voucher / Refund Ref #
                            </label>
                            <Input
                                placeholder="e.g. TR-2026-08-994"
                                value={treasuryRef}
                                onChange={(e) => setTreasuryRef(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="restoreDemerit"
                                checked={restoreDemerit}
                                onChange={(e) => setRestoreDemerit(e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                            />
                            <label htmlFor="restoreDemerit" className="text-xs text-gray-700 font-medium cursor-pointer">
                                Restore deducted demerit points (+{payment.demeritPoints || 0} pts) to driver
                            </label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleProcessRefund}
                        disabled={processing}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    >
                        {processing ? 'Processing...' : 'Confirm & Authorize Refund'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
