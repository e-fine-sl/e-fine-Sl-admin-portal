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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DriverService } from '@/services/driverService';
import { DriverDTO } from '@/types/driver.types';
import { SlidersHorizontal, Scale, Star } from 'lucide-react';
import { toast } from 'sonner';

interface DriverAdjustDemeritModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: DriverDTO | null;
    onSuccess: () => void;
}

export const DriverAdjustDemeritModal: React.FC<DriverAdjustDemeritModalProps> = ({
    isOpen,
    onClose,
    driver,
    onSuccess
}) => {
    const [newPoints, setNewPoints] = useState<number>(24);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (driver) {
            setNewPoints(driver.demeritPoints ?? 24);
            setReason('');
        }
    }, [driver]);

    if (!driver) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPoints < 0 || newPoints > 24) {
            toast.error('Demerit points must be between 0 and 24');
            return;
        }

        try {
            setSubmitting(true);
            const res = await DriverService.adjustDemerit({
                driverId: driver._id,
                newPoints,
                reason: reason.trim() || 'Official Administrative / Legal Demerit Adjustment'
            });

            toast.success(res.message || 'Demerit points adjusted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Demerit adjustment failed:', error);
            toast.error(error.response?.data?.message || 'Failed to adjust demerit points');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <SlidersHorizontal className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Adjust Demerit Points
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Administrative demerit points and rating adjustment.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    {/* Driver Current Status */}
                    <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-100 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Driver Name:</span>
                            <span className="font-bold text-gray-900">{driver.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">License Number:</span>
                            <span className="font-mono">{driver.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Balance:</span>
                            <span className="font-bold font-mono text-purple-800">{driver.demeritPoints} / 24 pts ({driver.demeritLevel})</span>
                        </div>
                    </div>

                    {/* New Points Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">New Demerit Balance (0 - 24) *</Label>
                            <span className="font-mono font-bold text-sm text-purple-700">{newPoints} / 24</span>
                        </div>
                        <Input
                            type="number"
                            min={0}
                            max={24}
                            value={newPoints}
                            onChange={(e) => setNewPoints(Math.min(24, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                            className="h-9 text-sm font-mono font-bold text-center"
                            required
                        />

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setNewPoints(24)}
                                className="text-[11px] h-7 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                                Max (24 pts)
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setNewPoints(18)}
                                className="text-[11px] h-7 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                                18 pts (Good)
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setNewPoints(12)}
                                className="text-[11px] h-7 px-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                                12 pts (Fair)
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setNewPoints(6)}
                                className="text-[11px] h-7 px-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                                6 pts (Warning)
                            </Button>
                        </div>
                    </div>

                    {/* Legal / Audit Reason */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Legal Reference / Reason</Label>
                        <Textarea
                            placeholder="e.g. Traffic Court Order #TC-889 / Annual Clean Record Restoration"
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            rows={2}
                            className="text-xs resize-none"
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
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <Scale className="h-3.5 w-3.5" />
                            {submitting ? 'Updating...' : 'Save Demerit Adjustment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
