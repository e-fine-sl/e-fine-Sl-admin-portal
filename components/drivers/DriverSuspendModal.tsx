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
import { DriverService } from '@/services/driverService';
import { DriverDTO } from '@/types/driver.types';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DriverSuspendModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: DriverDTO | null;
    onSuccess: () => void;
}

export const DriverSuspendModal: React.FC<DriverSuspendModalProps> = ({
    isOpen,
    onClose,
    driver,
    onSuccess
}) => {
    const [reason, setReason] = useState('Dangerous driving violation / Demerit points threshold reached');
    const [submitting, setSubmitting] = useState(false);

    if (!driver) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast.error('Please provide an official reason for the license suspension');
            return;
        }

        try {
            setSubmitting(true);
            const res = await DriverService.suspendDriver({
                driverId: driver._id,
                reason: reason.trim()
            });

            toast.success(res.message || 'Driver license suspended successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Suspension failed:', error);
            toast.error(error.response?.data?.message || 'Failed to suspend driver license');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-rose-900">
                                Suspend Driving License
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Revoke driving privileges for License #{driver.licenseNumber}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-rose-900 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Driver Name:</span>
                            <span className="font-bold">{driver.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">NIC / License:</span>
                            <span className="font-mono">{driver.nic} • #{driver.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Demerit:</span>
                            <span className="font-bold font-mono text-rose-700">{driver.demeritPoints} / 24 pts ({driver.demeritLevel})</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Official Reason Note *</Label>
                        <Textarea
                            rows={3}
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            placeholder="Enter official legal or administrative reason..."
                            className="text-xs resize-none"
                            required
                        />
                        <p className="text-[11px] text-gray-400">
                            This note will be transmitted directly via push notification and email alert to the motorist.
                        </p>
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={submitting}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {submitting ? 'Suspending...' : 'Confirm Suspension'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
