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
import { SystemConfigService } from '@/services/systemConfigService';
import { ManualRecoveryResult } from '@/types/systemConfig.types';
import { Play, CheckCircle2, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ManualRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ManualRecoveryModal: React.FC<ManualRecoveryModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState<ManualRecoveryResult | null>(null);

    const handleExecute = async () => {
        try {
            setExecuting(true);
            const res = await SystemConfigService.triggerManualRecovery();
            setResult(res.data);
            toast.success(res.message || 'Demerit recovery run executed successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Failed to trigger recovery:', error);
            toast.error(error.response?.data?.message || 'Failed to trigger recovery cycle');
        } finally {
            setExecuting(false);
        }
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Play className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Run Demerit Points Recovery Cycle
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Manually reward all eligible, active drivers with good conduct points now.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {!result ? (
                    <div className="py-2 text-xs space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            This will evaluate all active, non-suspended drivers who have had no new offenses within their clean record period and credit their license with recovery points up to the configured ceiling.
                        </p>

                        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 text-blue-600" />
                                Execution Criteria:
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                                <li>License status must be <strong>ACTIVE</strong> (suspended drivers excluded).</li>
                                <li>Current demerit balance must be below starting ceiling.</li>
                                <li>No offenses recorded within clean record window.</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="py-2 text-xs space-y-3">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                Recovery Run Successful!
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1 font-medium text-xs">
                                <div>
                                    <span className="text-emerald-700 block text-[11px]">Drivers Rewarded:</span>
                                    <strong className="text-emerald-950 text-base">{result.updatedCount}</strong>
                                </div>
                                <div>
                                    <span className="text-emerald-700 block text-[11px]">Points Added:</span>
                                    <strong className="text-emerald-950 text-base">+{result.recoveryPoints} pts</strong>
                                </div>
                            </div>
                            <div className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-200 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Executed: {new Date(result.executedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="border-t pt-3">
                    {!result ? (
                        <>
                            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={executing}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleExecute}
                                disabled={executing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                            >
                                <Play className="h-3.5 w-3.5" />
                                {executing ? 'Executing Cycle...' : 'Execute Recovery Cycle'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
