'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ResetDemeritModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading: boolean;
}

export const ResetDemeritModal: React.FC<ResetDemeritModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Reset Demerit Rules to Factory Defaults?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Restore official statutory baseline values for driver safety points.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-2 text-xs space-y-3">
                    <p className="text-gray-700">
                        This action will immediately reset the following demerit configurations to factory defaults:
                    </p>

                    <div className="bg-gray-50 border rounded-lg p-3 space-y-1.5 font-medium text-gray-800">
                        <div className="flex justify-between">
                            <span>Starting Point Balance:</span>
                            <span className="font-bold">24 Points</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Monthly Recovery Points:</span>
                            <span className="font-bold">2 Points / run</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Recovery Cycle Period:</span>
                            <span className="font-bold">1 Month</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Clean Record Requirement:</span>
                            <span className="font-bold">30 Days</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Recovery Master Switch:</span>
                            <span className="font-bold text-emerald-600">Enabled</span>
                        </div>
                    </div>

                    <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px]">
                        <strong>Note:</strong> Accident notification radius, payment grace period, and admin security settings will remain untouched.
                    </p>
                </div>

                <DialogFooter className="border-t pt-3">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {loading ? 'Resetting...' : 'Confirm Factory Reset'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
