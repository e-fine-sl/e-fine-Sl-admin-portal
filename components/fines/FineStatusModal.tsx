'use client';

import React, { useState, useEffect } from 'react';
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
    SelectValue
} from '@/components/ui/select';
import { FineService } from '@/services/fineService';
import { FineDTO, FineStatus } from '@/types/fine.types';
import { formatCurrency } from '@/lib/utils';
import { ShieldAlert, AlertTriangle, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FineStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    fine: FineDTO | null;
    onSuccess: () => void;
}

export const FineStatusModal: React.FC<FineStatusModalProps> = ({
    isOpen,
    onClose,
    fine,
    onSuccess
}) => {
    const [status, setStatus] = useState<FineStatus>('DISPUTED');
    const [notes, setNotes] = useState('');
    const [restoreDemerit, setRestoreDemerit] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (fine) {
            setStatus(fine.status || 'DISPUTED');
            setNotes(fine.disputeReason || fine.paymentNotes || '');
            setRestoreDemerit(false);
        }
    }, [fine]);

    if (!fine) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Please provide an administrative note or legal reason for the status update');
            return;
        }

        try {
            setSubmitting(true);
            const res = await FineService.updateFineStatus(fine._id, {
                status,
                notes: notes.trim(),
                restoreDemerit
            });

            toast.success(res.message || 'Citation status updated');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update fine status:', error);
            toast.error(error.response?.data?.message || 'Failed to update fine status');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Citation Status & Dispute Resolution
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Override citation status for #{fine._id.slice(-8).toUpperCase()}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    {/* Fine Summary Strip */}
                    <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Offense:</span>
                            <span className="font-semibold text-gray-900">{fine.offenseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">License / Plate:</span>
                            <span className="font-mono">{fine.licenseNumber} • {fine.vehicleNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Imposed Penalty:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(fine.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Demerit Penalty:</span>
                            <span className="font-mono text-rose-600 font-semibold">-{fine.demeritPoints || 0} pts</span>
                        </div>
                    </div>

                    {/* New Status Selection */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Target Citation Status *</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as FineStatus)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PAID" className="text-emerald-700 font-semibold">
                                    PAID (Mark as Settled / Paid in Court)
                                </SelectItem>
                                <SelectItem value="UNPAID" className="text-rose-700 font-semibold">
                                    UNPAID (Pending Payment)
                                </SelectItem>
                                <SelectItem value="DISPUTED" className="text-amber-700 font-semibold">
                                    DISPUTED (Flag Under Investigation)
                                </SelectItem>
                                <SelectItem value="REFUNDED" className="text-purple-700 font-semibold">
                                    REFUNDED (Court Dismissed / Overturned)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Restore Demerit Checkbox */}
                    {(status === 'REFUNDED' || status === 'DISPUTED') && (fine.demeritPoints ?? 0) > 0 && (
                        <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                            <input
                                type="checkbox"
                                id="restoreDemerit"
                                checked={restoreDemerit}
                                onChange={(e) => setRestoreDemerit(e.target.checked)}
                                className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                            />
                            <label htmlFor="restoreDemerit" className="text-[11px] text-purple-900 cursor-pointer">
                                <strong>Restore +{fine.demeritPoints} Demerit Points</strong> to driver's license record upon dismissal.
                            </label>
                        </div>
                    )}

                    {/* Administrative Notes / Reason */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Administrative / Legal Reason Note *</Label>
                        <Textarea
                            rows={3}
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            placeholder="Enter court reference, appeal justification, or settlement note..."
                            className="text-xs resize-none"
                            required
                        />
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {submitting ? 'Saving...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
