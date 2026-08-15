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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OfficerService } from '@/services/officerService';
import { OfficerDTO, UpdateOfficerDTO } from '@/types/officer.types';
import { StationSimple } from '@/hooks/useOfficers';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: OfficerDTO | null;
    stations: StationSimple[];
    onSuccess: () => void;
}

export const OfficerEditModal: React.FC<OfficerEditModalProps> = ({
    isOpen,
    onClose,
    officer,
    stations,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [policeStation, setPoliceStation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (officer) {
            setName(officer.name || '');
            setEmail(officer.email || '');
            setPhone(officer.phone || '');
            setPosition(officer.position || 'Constable');
            setPoliceStation(officer.policeStation || '');
        }
    }, [officer]);

    if (!officer) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            const dto: UpdateOfficerDTO = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                position,
                policeStation
            };

            const res = await OfficerService.updateOfficer(officer._id, dto);
            toast.success(res.message || 'Officer profile updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update officer profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Pencil className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Edit Officer Particulars
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Update contact and profile for Badge #{officer.badgeNumber}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Full Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Official Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Contact Phone</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Assigned Station</Label>
                            <Select value={policeStation} onValueChange={setPoliceStation}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select Police Station" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stations.map((st) => (
                                        <SelectItem key={st._id || st.stationCode} value={st.name}>
                                            {st.name} {st.stationCode ? `(${st.stationCode})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Rank / Position</Label>
                            <Select value={position} onValueChange={setPosition}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select Rank" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Constable">Constable</SelectItem>
                                    <SelectItem value="Sergeant">Sergeant</SelectItem>
                                    <SelectItem value="Sub-Inspector (SI)">Sub-Inspector (SI)</SelectItem>
                                    <SelectItem value="Inspector (IP)">Inspector (IP)</SelectItem>
                                    <SelectItem value="OIC">Officer-in-Charge (OIC)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                            <Pencil className="h-3.5 w-3.5" />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
