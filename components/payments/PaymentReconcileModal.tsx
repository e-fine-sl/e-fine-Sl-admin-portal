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
import { PaymentService } from '@/services/paymentService';
import { PaymentRecord, GatewayVerificationDTO } from '@/types/payment.types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentReconcileModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentRecord | null;
    onVerifiedSuccess?: () => void;
}

export const PaymentReconcileModal: React.FC<PaymentReconcileModalProps> = ({
    isOpen,
    onClose,
    payment,
    onVerifiedSuccess
}) => {
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<GatewayVerificationDTO | null>(null);

    const handleVerify = async () => {
        if (!payment?._id) return;
        try {
            setVerifying(true);
            setResult(null);
            const res = await PaymentService.verifyWithGateway(payment._id);
            setResult(res);
            if (res.isVerified) {
                toast.success('Payment verified with gateway ledger!');
                if (onVerifiedSuccess) onVerifiedSuccess();
            } else {
                toast.warning(res.message || 'Payment status unconfirmed at gateway.');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Gateway verification check failed');
        } finally {
            setVerifying(false);
        }
    };

    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">
                                Gateway Ledger Reconciliation
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Re-query and verify payment status with PayHere / LankaPay.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                    {/* Transaction Preview */}
                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">License Number:</span>
                            <span className="font-bold font-mono">{payment.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment ID:</span>
                            <span className="font-mono">{payment.paymentId || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Result Output if verified */}
                    {result && (
                        <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                            result.isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}>
                            <div className="flex items-center gap-1.5 font-bold">
                                {result.isVerified ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                                Gateway Status: {result.gatewayStatus}
                            </div>
                            <p className="text-xs leading-relaxed">{result.message}</p>
                            {result.settlementDate && (
                                <div className="text-[11px] text-gray-600 pt-1 border-t border-emerald-200">
                                    Settled on: {formatDateTime(result.settlementDate)}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-3 flex justify-between sm:justify-between w-full">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleVerify}
                        disabled={verifying}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
                        {verifying ? 'Checking Gateway...' : 'Run Gateway Check'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
