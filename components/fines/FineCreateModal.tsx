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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { FineService } from '@/services/fineService';
import { CreateFineDTO, FineOffenseDTO } from '@/types/fine.types';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Scale, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FineCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const FineCreateModal: React.FC<FineCreateModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [offenseId, setOffenseId] = useState('');
    const [place, setPlace] = useState('');
    const [policeStation, setPoliceStation] = useState('Colombo Fort Police Station');
    const [policeOfficerId, setPoliceOfficerId] = useState('ADMIN-DESK');
    const [notes, setNotes] = useState('');

    const [offenses, setOffenses] = useState<FineOffenseDTO[]>([]);
    const [loadingOffenses, setLoadingOffenses] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoadingOffenses(true);
            api.get('/admin/fines/offenses')
                .then((res) => {
                    const data = res.data.data || res.data;
                    setOffenses(Array.isArray(data) ? data : []);
                })
                .catch((err) => console.error('Failed to load offenses:', err))
                .finally(() => setLoadingOffenses(false));
        }
    }, [isOpen]);

    const selectedOffense = offenses.find((o) => o._id === offenseId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!licenseNumber.trim() || !vehicleNumber.trim() || !offenseId || !place.trim()) {
            toast.error('Please fill in all mandatory citation fields');
            return;
        }

        try {
            setSubmitting(true);
            const dto: CreateFineDTO = {
                licenseNumber: licenseNumber.toUpperCase().trim(),
                vehicleNumber: vehicleNumber.toUpperCase().trim(),
                offenseId,
                place: place.trim(),
                policeStation: policeStation.trim(),
                policeOfficerId: policeOfficerId.trim(),
                notes: notes.trim() || undefined
            };

            const res = await FineService.createFine(dto);
            toast.success(res.message || 'Traffic citation issued successfully');

            // Reset form
            setLicenseNumber('');
            setVehicleNumber('');
            setOffenseId('');
            setPlace('');
            setNotes('');

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to issue citation:', error);
            toast.error(error.response?.data?.message || 'Failed to issue traffic citation');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Issue Traffic Citation
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Register manual paper citation or court-mandated fine penalty.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
                    {/* License Number & Vehicle Number */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Driving License # *</Label>
                            <Input
                                placeholder="e.g. B1234567"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Vehicle Number Plate *</Label>
                            <Input
                                placeholder="e.g. WP-CAB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                                required
                            />
                        </div>
                    </div>

                    {/* Offense Selector */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Traffic Offense / Violation *</Label>
                        <Select value={offenseId} onValueChange={setOffenseId}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={loadingOffenses ? 'Loading offenses...' : 'Select Traffic Offense'} />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                                {offenses.map((offense) => (
                                    <SelectItem key={offense._id} value={offense._id} className="text-xs">
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <span>{offense.offenseName}</span>
                                            <span className="font-mono text-gray-500">{formatCurrency(offense.amount || 0)}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Offense preview banner */}
                        {selectedOffense && (
                            <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 flex justify-between items-center text-xs mt-1">
                                <div>
                                    <span className="font-semibold text-blue-900">{selectedOffense.offenseName}</span>
                                    <span className="text-[11px] text-blue-700 block">{selectedOffense.sectionOfAct || 'Motor Traffic Act'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono font-bold text-blue-900 block">{formatCurrency(selectedOffense.amount || 0)}</span>
                                    <span className="text-[10px] text-rose-600 font-semibold">-{selectedOffense.demeritPoints || 0} Demerit Pts</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Place & Station */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Incident Location *</Label>
                            <Input
                                placeholder="e.g. Galle Road, Kollupitiya"
                                value={place}
                                onChange={(e) => setPlace(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Police Command Station</Label>
                            <Input
                                value={policeStation}
                                onChange={(e) => setPoliceStation(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Officer ID & Notes */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Issuing Officer Badge / ID</Label>
                            <Input
                                value={policeOfficerId}
                                onChange={(e) => setPoliceOfficerId(e.target.value)}
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Citation / Court Reference</Label>
                            <Input
                                placeholder="e.g. Manual Ticket #MT-904"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={submitting || !offenseId}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {submitting ? 'Issuing...' : 'Issue Citation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
