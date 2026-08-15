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
import { Label } from '@/components/ui/label';
import { DriverService } from '@/services/driverService';
import { DriverDTO } from '@/types/driver.types';
import { KeyRound, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DriverResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: DriverDTO | null;
    onSuccess: () => void;
}

export const DriverResetPasswordModal: React.FC<DriverResetPasswordModalProps> = ({
    isOpen,
    onClose,
    driver,
    onSuccess
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!driver) return null;

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(pass);
        toast.info('Generated temporary secure password');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setSubmitting(true);
            const res = await DriverService.resetCredentials({
                driverId: driver._id,
                newPassword
            });

            toast.success(res.message || 'Driver password reset successfully');
            setNewPassword('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Password reset failed:', error);
            toast.error(error.response?.data?.message || 'Failed to reset driver password');
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
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Reset Driver App Credentials
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Issue temporary access credentials for License #{driver.licenseNumber}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Driver Name:</span>
                            <span className="font-bold">{driver.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email Address:</span>
                            <span className="font-mono">{driver.email}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-700">
                                New Temporary Password *
                            </Label>
                            <button
                                type="button"
                                onClick={generateRandomPassword}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Generate Random Pass
                            </button>
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter or generate temporary password..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-8 text-xs font-mono"
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
                            disabled={submitting || !newPassword}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            {submitting ? 'Updating...' : 'Set New Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
