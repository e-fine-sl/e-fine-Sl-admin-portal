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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OfficerService } from '@/services/officerService';
import { OfficerDTO } from '@/types/officer.types';
import { StationSimple } from '@/hooks/useOfficers';
import { ArrowRightLeft, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: OfficerDTO | null;
    stations: StationSimple[];
    onSuccess: () => void;
}

export const OfficerTransferModal: React.FC<OfficerTransferModalProps> = ({
    isOpen,
    onClose,
    officer,
    stations,
    onSuccess
}) => {
    const [targetStation, setTargetStation] = useState('');
    const [transferReason, setTransferReason] = useState('');
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
    const [submitting, setSubmitting] = useState(false);

    if (!officer) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!targetStation) {
            toast.error('Please select a target police station');
            return;
        }

        if (targetStation === officer.policeStation) {
            toast.error('Target station must be different from current assigned station');
            return;
        }

        try {
            setSubmitting(true);
            const res = await OfficerService.transferStation({
                officerId: officer._id,
                targetStation,
                transferReason: transferReason.trim() || 'Official Administrative Transfer',
                effectiveDate
            });

            toast.success(res.message || 'Station transfer executed successfully');
            setTargetStation('');
            setTransferReason('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Transfer failed:', error);
            toast.error(error.response?.data?.message || 'Failed to transfer officer station');
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
                            <ArrowRightLeft className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Officer Station Transfer
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Reassign officer command division and terminal station.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
                    {/* Current Assignment Overview */}
                    <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Officer Name:</span>
                            <span className="font-bold text-gray-900">{officer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Badge / Rank:</span>
                            <span className="font-mono font-medium text-gray-800">#{officer.badgeNumber} ({officer.position})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Current Station:</span>
                            <span className="font-semibold text-purple-800">{officer.policeStation}</span>
                        </div>
                    </div>

                    {/* Target Station Picker */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Target Police Station *</Label>
                        <Select value={targetStation} onValueChange={setTargetStation}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select New Police Station" />
                            </SelectTrigger>
                            <SelectContent>
                                {stations
                                    .filter((st) => st.name !== officer.policeStation)
                                    .map((st) => (
                                        <SelectItem key={st._id || st.stationCode} value={st.name}>
                                            {st.name} {st.stationCode ? `(${st.stationCode})` : ''}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Effective Date */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Effective Date</Label>
                        <Input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    {/* Transfer Reason */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Transfer Remarks / Order Ref</Label>
                        <Textarea
                            placeholder="e.g. Police HQ Special Traffic Operation Order #HQ-942"
                            value={transferReason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTransferReason(e.target.value)}
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
                            disabled={submitting || !targetStation}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            {submitting ? 'Executing Transfer...' : 'Confirm Station Transfer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
