'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { CreateDriverDTO, VehicleClass } from '@/types/driver.types';
import { 
    UserPlus, 
    ShieldCheck, 
    ShieldAlert, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Sparkles, 
    Info 
} from 'lucide-react';
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
    // Form fields
    const [name, setName] = useState('');
    const [nic, setNic] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [city, setCity] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Real-time Field Existence / Uniqueness State
    const [nicStatus, setNicStatus] = useState<'idle' | 'checking' | 'unique' | 'taken' | 'invalid'>('idle');
    const [nicError, setNicError] = useState<string | null>(null);

    const [licenseStatus, setLicenseStatus] = useState<'idle' | 'checking' | 'unique' | 'taken' | 'invalid'>('idle');
    const [licenseError, setLicenseError] = useState<string | null>(null);

    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'unique' | 'taken' | 'invalid'>('idle');
    const [emailError, setEmailError] = useState<string | null>(null);

    const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'unique' | 'taken' | 'invalid'>('idle');
    const [phoneError, setPhoneError] = useState<string | null>(null);

    // DMT (Department of Motor Traffic) Verification State
    const [isDmtChecking, setIsDmtChecking] = useState(false);
    const [isDmtVerified, setIsDmtVerified] = useState(false);
    const [dmtError, setDmtError] = useState<string | null>(null);
    const [dmtData, setDmtData] = useState<{
        fullName?: string;
        dateOfBirth?: string;
        address?: string;
        licenseIssueDate?: string;
        licenseExpiryDate?: string;
        licenseStatus?: string;
        vehicleClasses?: VehicleClass[];
        issuingOffice?: string;
    } | null>(null);

    // Debounce timer refs
    const debounceNicRef = useRef<NodeJS.Timeout | null>(null);
    const debounceLicenseRef = useRef<NodeJS.Timeout | null>(null);
    const debounceEmailRef = useRef<NodeJS.Timeout | null>(null);
    const debouncePhoneRef = useRef<NodeJS.Timeout | null>(null);

    // Regex validators
    const isValidNIC = (val: string) => /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val.trim());
    const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    const isValidPhone = (val: string) => /^(?:\+94|0)?[0-9]{9,10}$/.test(val.trim().replace(/\s+/g, ''));

    // Reset all state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setNic('');
            setLicenseNumber('');
            setEmail('');
            setPhone('');
            setPassword('');
            setVehicleNumber('');
            setCity('');
            setAddressLine1('');
            setAddressLine2('');
            setNicStatus('idle');
            setNicError(null);
            setLicenseStatus('idle');
            setLicenseError(null);
            setEmailStatus('idle');
            setEmailError(null);
            setPhoneStatus('idle');
            setPhoneError(null);
            setIsDmtChecking(false);
            setIsDmtVerified(false);
            setDmtError(null);
            setDmtData(null);
        }
    }, [isOpen]);

    // Helper to parse DMT address string into separate AddressLine1, AddressLine2, and City
    const parseDmtAddress = (rawAddress: string) => {
        if (!rawAddress) return { line1: '', line2: '', cityPart: '' };
        const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length === 1) {
            return { line1: parts[0], line2: '', cityPart: '' };
        } else if (parts.length === 2) {
            return { line1: parts[0], line2: parts[1], cityPart: '' };
        } else if (parts.length === 3) {
            return { line1: parts[0], line2: parts[1], cityPart: parts[2] };
        } else {
            return {
                line1: parts.slice(0, 2).join(', '),
                line2: parts[2],
                cityPart: parts[parts.length - 1]
            };
        }
    };

    // ── DMT Verification Routine ──────────────────────────────────────────────
    const performDmtCheck = async (licNo: string, nationalId: string) => {
        const cleanLic = licNo.trim().toUpperCase();
        const cleanNic = nationalId.trim().toUpperCase();

        if (!cleanLic || !cleanNic || !isValidNIC(cleanNic)) {
            setIsDmtVerified(false);
            setDmtError(null);
            setDmtData(null);
            return;
        }

        setIsDmtChecking(true);
        setDmtError(null);

        try {
            const res = await DriverService.verifyLicenseWithDMT(cleanLic, cleanNic);

            if (res.success && res.data) {
                setIsDmtVerified(true);
                setDmtError(null);
                setDmtData(res.data);

                // Auto-suggest name and parsed address if inputs are empty
                if (!name.trim() && res.data.fullName) {
                    setName(res.data.fullName);
                }
                if (res.data.address) {
                    const parsed = parseDmtAddress(res.data.address);
                    if (!addressLine1.trim() && parsed.line1) setAddressLine1(parsed.line1);
                    if (!addressLine2.trim() && parsed.line2) setAddressLine2(parsed.line2);
                    if (!city.trim() && parsed.cityPart) setCity(parsed.cityPart);
                }
            } else if (res.dmtUnreachable) {
                setIsDmtVerified(false);
                setDmtError('DMT verification service is temporarily unavailable. Registration requires DMT verification.');
                setDmtData(null);
            } else if (res.found === false) {
                setIsDmtVerified(false);
                setDmtError('Driving License Number not found in DMT national database. Only legal licenses can be onboarded.');
                setDmtData(null);
            } else if (res.nicMatch === false) {
                setIsDmtVerified(false);
                setDmtError('National ID (NIC) does not match the registered license holder record at DMT.');
                setDmtData(null);
            } else {
                setIsDmtVerified(false);
                setDmtError(res.message || 'DMT License Verification failed.');
                setDmtData(null);
            }
        } catch (err: any) {
            console.error('DMT verification request failed:', err);
            const msg = err.response?.data?.message || 'Failed to connect to DMT verification service.';
            setIsDmtVerified(false);
            setDmtError(msg);
            setDmtData(null);
        } finally {
            setIsDmtChecking(false);
        }
    };

    // ── Field Change Handlers with Debounced DB & DMT Checks ─────────────────

    const handleNicChange = (val: string) => {
        setNic(val);
        setIsDmtVerified(false);
        setDmtError(null);

        if (debounceNicRef.current) clearTimeout(debounceNicRef.current);

        const trimmed = val.trim().toUpperCase();
        if (!trimmed) {
            setNicStatus('idle');
            setNicError(null);
            return;
        }

        if (!isValidNIC(trimmed)) {
            setNicStatus('invalid');
            setNicError('Invalid NIC (9 digits + V/X or 12 digits)');
            return;
        }

        setNicStatus('checking');
        setNicError(null);

        debounceNicRef.current = setTimeout(async () => {
            try {
                const res = await DriverService.checkFieldExists('nic', trimmed, 'driver');
                if (res.exists) {
                    setNicStatus('taken');
                    setNicError('National ID is already registered in e-Fine SL');
                } else {
                    setNicStatus('unique');
                    setNicError(null);
                    // If licenseNumber is also ready, trigger DMT check
                    if (licenseNumber.trim()) {
                        performDmtCheck(licenseNumber, trimmed);
                    }
                }
            } catch (err) {
                setNicStatus('idle');
            }
        }, 500);
    };

    const handleLicenseChange = (val: string) => {
        setLicenseNumber(val);
        setIsDmtVerified(false);
        setDmtError(null);

        if (debounceLicenseRef.current) clearTimeout(debounceLicenseRef.current);

        const trimmed = val.trim().toUpperCase();
        if (!trimmed) {
            setLicenseStatus('idle');
            setLicenseError(null);
            return;
        }

        setLicenseStatus('checking');
        setLicenseError(null);

        debounceLicenseRef.current = setTimeout(async () => {
            try {
                const res = await DriverService.checkFieldExists('licenseNumber', trimmed, 'driver');
                if (res.exists) {
                    setLicenseStatus('taken');
                    setLicenseError('License Number is already registered in e-Fine SL');
                } else {
                    setLicenseStatus('unique');
                    setLicenseError(null);
                    // If NIC is valid, trigger DMT check
                    if (nic.trim() && isValidNIC(nic.trim())) {
                        performDmtCheck(trimmed, nic.trim());
                    }
                }
            } catch (err) {
                setLicenseStatus('idle');
            }
        }, 500);
    };

    const handleEmailChange = (val: string) => {
        setEmail(val);

        if (debounceEmailRef.current) clearTimeout(debounceEmailRef.current);

        const trimmed = val.trim().toLowerCase();
        if (!trimmed) {
            setEmailStatus('idle');
            setEmailError(null);
            return;
        }

        if (!isValidEmail(trimmed)) {
            setEmailStatus('invalid');
            setEmailError('Invalid email address format');
            return;
        }

        setEmailStatus('checking');
        setEmailError(null);

        debounceEmailRef.current = setTimeout(async () => {
            try {
                const res = await DriverService.checkFieldExists('email', trimmed);
                if (res.exists) {
                    setEmailStatus('taken');
                    setEmailError('Email is already registered in e-Fine SL (Driver or Officer)');
                } else {
                    setEmailStatus('unique');
                    setEmailError(null);
                }
            } catch (err) {
                setEmailStatus('idle');
            }
        }, 500);
    };

    const handlePhoneChange = (val: string) => {
        setPhone(val);

        if (debouncePhoneRef.current) clearTimeout(debouncePhoneRef.current);

        const trimmed = val.trim();
        if (!trimmed) {
            setPhoneStatus('idle');
            setPhoneError(null);
            return;
        }

        if (!isValidPhone(trimmed)) {
            setPhoneStatus('invalid');
            setPhoneError('Invalid phone number (e.g. 0771234567)');
            return;
        }

        setPhoneStatus('checking');
        setPhoneError(null);

        debouncePhoneRef.current = setTimeout(async () => {
            try {
                const res = await DriverService.checkFieldExists('phone', trimmed, 'driver');
                if (res.exists) {
                    setPhoneStatus('taken');
                    setPhoneError('Phone number is already registered in e-Fine SL');
                } else {
                    setPhoneStatus('unique');
                    setPhoneError(null);
                }
            } catch (err) {
                setPhoneStatus('idle');
            }
        }, 500);
    };

    // Auto-populate DMT particulars button handler
    const handleApplyDmtDetails = () => {
        if (dmtData) {
            if (dmtData.fullName) setName(dmtData.fullName);
            if (dmtData.address) {
                const parsed = parseDmtAddress(dmtData.address);
                if (parsed.line1) setAddressLine1(parsed.line1);
                if (parsed.line2) setAddressLine2(parsed.line2);
                if (parsed.cityPart) setCity(parsed.cityPart);
            }
            toast.success('Applied official legal details from DMT records.');
        }
    };

    // ── Form Submission ───────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !nic.trim() || !licenseNumber.trim() || !email.trim() || !phone.trim() || !password.trim()) {
            toast.error('Please fill in all mandatory driver registration fields.');
            return;
        }

        if (!isDmtVerified) {
            toast.error('Driving License must be verified with DMT before registration.');
            return;
        }

        if (nicStatus === 'taken' || licenseStatus === 'taken' || emailStatus === 'taken' || phoneStatus === 'taken') {
            toast.error('Please resolve duplicate credential errors before submitting.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
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
                addressLine1: addressLine1.trim() || undefined,
                addressLine2: addressLine2.trim() || undefined,
                licenseExpiryDate: dmtData?.licenseExpiryDate || undefined,
                licenseIssueDate: dmtData?.licenseIssueDate || undefined,
                dateOfBirth: dmtData?.dateOfBirth || undefined,
                vehicleClasses: dmtData?.vehicleClasses || []
            };

            const res = await DriverService.createDriver(dto);
            toast.success(res.message || 'Driver verified with DMT and registered successfully.');

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register driver.');
        } finally {
            setSubmitting(false);
        }
    };

    // Can submit guard
    const isFormValid = 
        name.trim().length > 0 &&
        nic.trim().length > 0 &&
        licenseNumber.trim().length > 0 &&
        email.trim().length > 0 &&
        phone.trim().length > 0 &&
        password.length >= 6 &&
        nicStatus === 'unique' &&
        licenseStatus === 'unique' &&
        emailStatus === 'unique' &&
        phoneStatus === 'unique' &&
        isDmtVerified &&
        !isDmtChecking;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
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
                                Onboard motorist with real-time DMT license legality & e-Fine SL duplicate validation.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── DMT LIVE STATUS BANNER ─────────────────────────────────── */}
                <div className="my-1">
                    {isDmtChecking && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-700 text-xs animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                            <span>Verifying driving license legality with Department of Motor Traffic (DMT) database...</span>
                        </div>
                    )}

                    {isDmtVerified && dmtData && !isDmtChecking && (
                        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/80 text-emerald-900 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    <span>DMT Verified: Legal Driving License Active</span>
                                </div>
                                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                                    {dmtData.issuingOffice || 'DMT Sri Lanka'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2 rounded border border-emerald-100">
                                <div>
                                    <span className="text-gray-500">Official Name: </span>
                                    <span className="font-semibold text-gray-800">{dmtData.fullName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">License Expiry: </span>
                                    <span className="font-semibold text-gray-800">{dmtData.licenseExpiryDate || 'N/A'}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-1.5 flex-wrap pt-0.5">
                                    <span className="text-gray-500">Authorized Classes:</span>
                                    {dmtData.vehicleClasses && dmtData.vehicleClasses.length > 0 ? (
                                        dmtData.vehicleClasses.map((vc, idx) => (
                                            <span key={idx} className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                                                {vc.category}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="font-semibold text-gray-700">Class B</span>
                                    )}
                                </div>
                            </div>

                            {(!name.trim() || !addressLine1.trim()) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleApplyDmtDetails}
                                    className="h-6 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60 p-0 font-medium flex items-center gap-1"
                                >
                                    <Sparkles className="h-3 w-3" /> Auto-fill name & address from DMT records
                                </Button>
                            )}
                        </div>
                    )}

                    {dmtError && !isDmtChecking && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-semibold">DMT Verification Failed</div>
                                <div className="text-[11px] text-red-600 mt-0.5">{dmtError}</div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 py-1 text-xs">
                    {/* License Number & National ID (NIC) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">License Number *</Label>
                                {licenseStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                {licenseStatus === 'unique' && isDmtVerified && <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Verified</span>}
                                {licenseStatus === 'taken' && <span className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> Already In System</span>}
                            </div>
                            <Input
                                placeholder="e.g. B5395114"
                                value={licenseNumber}
                                onChange={(e) => handleLicenseChange(e.target.value)}
                                className={`h-8 text-xs font-mono uppercase ${
                                    licenseStatus === 'taken' || (dmtError && !isDmtVerified) ? 'border-red-400 bg-red-50/20' : 
                                    licenseStatus === 'unique' && isDmtVerified ? 'border-emerald-400 bg-emerald-50/20' : ''
                                }`}
                                required
                            />
                            {licenseError && <p className="text-[10px] text-red-600 mt-0.5 font-medium">{licenseError}</p>}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">National ID (NIC) *</Label>
                                {nicStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                {nicStatus === 'unique' && isDmtVerified && <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Matched</span>}
                                {nicStatus === 'taken' && <span className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> Already Registered</span>}
                            </div>
                            <Input
                                placeholder="e.g. 200107101016"
                                value={nic}
                                onChange={(e) => handleNicChange(e.target.value)}
                                className={`h-8 text-xs font-mono uppercase ${
                                    nicStatus === 'taken' || nicStatus === 'invalid' ? 'border-red-400 bg-red-50/20' : 
                                    nicStatus === 'unique' && isDmtVerified ? 'border-emerald-400 bg-emerald-50/20' : ''
                                }`}
                                required
                            />
                            {nicError && <p className="text-[10px] text-red-600 mt-0.5 font-medium">{nicError}</p>}
                        </div>
                    </div>

                    {/* Full Legal Name */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Full Legal Name *</Label>
                        <Input
                            placeholder="e.g. M.A. Shashimantha"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    {/* Email Address & Contact Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">Email Address *</Label>
                                {emailStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                {emailStatus === 'unique' && <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Available</span>}
                                {emailStatus === 'taken' && <span className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> In Use</span>}
                            </div>
                            <Input
                                type="email"
                                placeholder="driver@efine-sl.com"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                className={`h-8 text-xs ${emailStatus === 'taken' || emailStatus === 'invalid' ? 'border-red-400 bg-red-50/20' : ''}`}
                                required
                            />
                            {emailError && <p className="text-[10px] text-red-600 mt-0.5 font-medium">{emailError}</p>}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">Contact Phone *</Label>
                                {phoneStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                {phoneStatus === 'unique' && <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Available</span>}
                                {phoneStatus === 'taken' && <span className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> In Use</span>}
                            </div>
                            <Input
                                placeholder="0771234567"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={`h-8 text-xs font-mono ${phoneStatus === 'taken' || phoneStatus === 'invalid' ? 'border-red-400 bg-red-50/20' : ''}`}
                                required
                            />
                            {phoneError && <p className="text-[10px] text-red-600 mt-0.5 font-medium">{phoneError}</p>}
                        </div>
                    </div>

                    {/* Initial Mobile Terminal Password */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Initial Mobile App Password *</Label>
                        <Input
                            type="password"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-8 text-xs"
                            required
                        />
                        <p className="text-[10px] text-gray-400">Motorist can use this password to sign into the e-Fine SL Mobile App.</p>
                    </div>

                    {/* Address Line 1 & Address Line 2 (Separated) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Address Line 1 (Street / House No)</Label>
                            <Input
                                placeholder="e.g. No. 45, Juwangahawaththa"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Address Line 2 (Area / Locality)</Label>
                            <Input
                                placeholder="e.g. Kithulampitiya"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Primary Vehicle Plate & City / District */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Primary Vehicle Plate</Label>
                            <Input
                                placeholder="e.g. WP-CAB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">City / District</Label>
                            <Input
                                placeholder="e.g. Galle"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-3 flex items-center justify-between">
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Info className="h-3.5 w-3.5 text-gray-400" />
                            <span>Initial starting balance: <b>24 Demerit Points</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                size="sm" 
                                disabled={submitting || !isFormValid}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-3.5 w-3.5" />
                                        <span>Register Driver</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
