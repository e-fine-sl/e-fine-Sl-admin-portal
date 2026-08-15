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
import { OfficerService } from '@/services/officerService';
import { OfficerDTO } from '@/types/officer.types';
import { KeyRound, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerResetCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: OfficerDTO | null;
    onSuccess: () => void;
}

export const OfficerResetCredentialsModal: React.FC<OfficerResetCredentialsModalProps> = ({
    isOpen,
    onClose,
    officer,
    onSuccess
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!officer) return null;

    const generateRandomPin = () => {
        const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
        setNewPassword(randomPin);
        toast.info('Generated 6-digit temporary PIN');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password or PIN must be at least 6 characters');
            return;
        }

        try {
            setSubmitting(true);
            const res = await OfficerService.resetCredentials({
                officerId: officer._id,
                newPassword
            });

            toast.success(res.message || 'Credentials reset successfully');
            setNewPassword('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Password reset failed:', error);
            toast.error(error.response?.data?.message || 'Failed to reset credentials');
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
                                Reset Mobile Terminal Credentials
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Issue temporary access PIN for Badge #{officer.badgeNumber}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Officer Name:</span>
                            <span className="font-bold">{officer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Badge / Station:</span>
                            <span className="font-mono">{officer.badgeNumber} • {officer.policeStation}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-700">
                                New Temporary PIN / Password *
                            </Label>
                            <button
                                type="button"
                                onClick={generateRandomPin}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Generate 6-Digit PIN
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

                    <div className="bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-lg flex items-start gap-2 text-xs">
                        <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>
                            Resetting credentials will <strong>terminate any active mobile terminal session</strong> and force the officer to re-authenticate.
                        </span>
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
                            {submitting ? 'Updating...' : 'Set New Credentials'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
