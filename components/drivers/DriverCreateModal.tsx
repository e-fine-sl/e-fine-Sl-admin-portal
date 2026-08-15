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
import { CreateDriverDTO } from '@/types/driver.types';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface DriverCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DriverCreateModal: React.FC<DriverCreateModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [nic, setNic] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [city, setCity] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !nic.trim() || !licenseNumber.trim() || !email.trim() || !phone.trim() || !password.trim()) {
            toast.error('Please fill in all mandatory driver registration fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setSubmitting(true);
            const dto: CreateDriverDTO = {
                name: name.trim(),
                nic: nic.toUpperCase().trim(),
                licenseNumber: licenseNumber.toUpperCase().trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                password,
                vehicleNumber: vehicleNumber.toUpperCase().trim() || undefined,
                city: city.trim() || undefined,
                addressLine1: addressLine1.trim() || undefined
            };

            const res = await DriverService.createDriver(dto);
            toast.success(res.message || 'Driver registered successfully');

            // Reset form
            setName('');
            setNic('');
            setLicenseNumber('');
            setEmail('');
            setPhone('');
            setPassword('');
            setVehicleNumber('');
            setCity('');
            setAddressLine1('');

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register driver');
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
                                Register Licensed Driver
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Onboard motorist into national traffic enforcement directory.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
                    {/* Full Name & License Number */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Full Name *</Label>
                            <Input
                                placeholder="e.g. K.A. Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">License Number *</Label>
                            <Input
                                placeholder="e.g. B1234567"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="h-8 text-xs font-mono"
                                required
                            />
                        </div>
                    </div>

                    {/* NIC & Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">National ID (NIC) *</Label>
                            <Input
                                placeholder="e.g. 199612345678"
                                value={nic}
                                onChange={(e) => setNic(e.target.value)}
                                className="h-8 text-xs font-mono"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Email Address *</Label>
                            <Input
                                type="email"
                                placeholder="driver@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone & Initial Password */}
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
                            <Label className="text-xs font-semibold text-gray-700">Initial Mobile Password *</Label>
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

                    {/* Vehicle Number & City */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Primary Vehicle Plate</Label>
                            <Input
                                placeholder="e.g. WP-CAB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">City / District</Label>
                            <Input
                                placeholder="e.g. Colombo"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Residential Address</Label>
                        <Input
                            placeholder="Street address line..."
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            className="h-8 text-xs"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            {submitting ? 'Registering...' : 'Register Driver'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
