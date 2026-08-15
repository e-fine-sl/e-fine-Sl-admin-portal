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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OfficerService } from '@/services/officerService';
import { CreateOfficerDTO } from '@/types/officer.types';
import { StationSimple } from '@/hooks/useOfficers';
import { UserPlus, Shield, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    stations: StationSimple[];
    onSuccess: () => void;
}

export const OfficerCreateModal: React.FC<OfficerCreateModalProps> = ({
    isOpen,
    onClose,
    stations,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [badgeNumber, setBadgeNumber] = useState('');
    const [nic, setNic] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [policeStation, setPoliceStation] = useState('');
    const [position, setPosition] = useState('Constable');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !badgeNumber.trim() || !nic.trim() || !phone.trim() || !password.trim() || !policeStation || !position) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setSubmitting(true);
            const dto: CreateOfficerDTO = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                badgeNumber: badgeNumber.trim(),
                nic: nic.toUpperCase().trim(),
                phone: phone.trim(),
                password,
                policeStation,
                position
            };

            const res = await OfficerService.createOfficer(dto);
            toast.success(res.message || 'Police Officer registered successfully');
            
            // Reset form
            setName('');
            setEmail('');
            setBadgeNumber('');
            setNic('');
            setPhone('');
            setPassword('');
            setPoliceStation('');
            setPosition('Constable');
            
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register officer');
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
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Register New Police Officer
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Issue digital enforcement credentials and assign to station.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
                    {/* Full Name & Badge Number */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Full Name *</Label>
                            <Input
                                placeholder="e.g. S.A. Perera"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Badge Number *</Label>
                            <Input
                                placeholder="e.g. 10045"
                                value={badgeNumber}
                                onChange={(e) => setBadgeNumber(e.target.value)}
                                className="h-8 text-xs font-mono"
                                required
                            />
                        </div>
                    </div>

                    {/* Email & NIC */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Official Email *</Label>
                            <Input
                                type="email"
                                placeholder="officer@police.lk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">National ID (NIC) *</Label>
                            <Input
                                placeholder="e.g. 199512345678"
                                value={nic}
                                onChange={(e) => setNic(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone & Password */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Contact Phone *</Label>
                            <Input
                                placeholder="0771234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Initial Mobile PIN / Password *</Label>
                            <Input
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Police Station & Rank */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Assigned Station *</Label>
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
                            <Label className="text-xs font-semibold text-gray-700">Rank / Position *</Label>
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
                            <UserPlus className="h-3.5 w-3.5" />
                            {submitting ? 'Registering...' : 'Register Officer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
