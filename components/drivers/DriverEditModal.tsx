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
import { DriverService } from '@/services/driverService';
import { DriverDTO, UpdateDriverDTO } from '@/types/driver.types';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface DriverEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: DriverDTO | null;
    onSuccess: () => void;
}

export const DriverEditModal: React.FC<DriverEditModalProps> = ({
    isOpen,
    onClose,
    driver,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (driver) {
            setName(driver.name || '');
            setPhone(driver.phone || '');
            setEmail(driver.email || '');
            setVehicleNumber(driver.vehicleNumber || '');
            setAddressLine1(driver.addressLine1 || '');
            setCity(driver.city || '');
            setPostalCode(driver.postalCode || '');
        }
    }, [driver]);

    if (!driver) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            const dto: UpdateDriverDTO = {
                name: name.trim(),
                phone: phone.trim(),
                email: email.toLowerCase().trim(),
                vehicleNumber: vehicleNumber.toUpperCase().trim(),
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                postalCode: postalCode.trim()
            };

            const res = await DriverService.updateDriver(driver._id, dto);
            toast.success(res.message || 'Driver particulars updated');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update driver details');
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
                                Edit Driver Particulars
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Update details for License #{driver.licenseNumber}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
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
                            <Label className="text-xs font-semibold text-gray-700">Contact Phone</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Vehicle Number</Label>
                            <Input
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">City / District</Label>
                            <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Address Line</Label>
                        <Input
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
                            <Pencil className="h-3.5 w-3.5" />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
