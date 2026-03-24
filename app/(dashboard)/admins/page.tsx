'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, ShieldCheck, ShieldAlert, CheckCircle2, QrCode, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    isTwoFactorEnabled: boolean;
}

export default function AdminsPage() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: 2FA Setup

    // Registration Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin_officer'
    });

    // 2FA Setup Data (Temporary)
    const [tempSecret, setTempSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!regex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setFormData({ ...formData, email: newEmail });
        validateEmail(newEmail);
    };

    // Only Super Admin can access
    if (user?.role !== USER_ROLES.SUPER_ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                    Only Super Admins have permission to access the Admin Management module.
                </p>
            </div>
        );
    }

    const handleOpenDialog = () => {
        setStep(1);
        setFormData({ name: '', email: '', password: '', role: 'admin_officer' });
        setTempSecret('');
        setQrCodeUrl('');
        setVerificationCode('');
        setEmailError('');
        setIsDialogOpen(true);
    };

    const handleInitRegistration = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!validateEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setIsRegistering(true);
            const response = await api.post('/admin/register/init', formData);
            setTempSecret(response.data.tempSecret);
            setQrCodeUrl(response.data.qrCodeUrl);
            setStep(2);
            toast.info('Please verify 2FA to complete registration');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to initiate registration');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCompleteRegistration = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        try {
            setIsRegistering(true);
            await api.post('/admin/register/complete', {
                ...formData,
                secret: tempSecret,
                token: verificationCode
            });

            toast.success('Admin registered successfully with 2FA enabled');
            setIsDialogOpen(false);
            // Reset form
            setFormData({ name: '', email: '', password: '', role: 'admin_officer' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Management</h1>
                    <p className="text-gray-500 mt-1">Manage system administrators and officers</p>
                </div>
                <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin Officer
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900">Enforced Security Policy</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        All new admin accounts require mandatory Two-Factor Authentication (2FA) setup during creation.
                        Do not close the registration window until the QR code is scanned and verified.
                    </p>
                </div>
            </div>

            {/* Admin List Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>System Administrators</CardTitle>
                    <CardDescription>Accounts with administrative access to the portal</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                        <p>Admin list functionality coming soon.</p>
                        <p className="text-sm mt-2">Use the "Add Admin Officer" button to create verified accounts.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Add Admin Modal with Enforced 2FA */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {step === 1 ? (
                                <>
                                    <Plus className="h-5 w-5" /> Add New Admin
                                </>
                            ) : (
                                <>
                                    <QrCode className="h-5 w-5" /> Setup Mandatory 2FA
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 1
                                ? 'Enter account details. You will need to verify 2FA in the next step.'
                                : 'Registration incomplete. Scan the QR code to verify and activate the account.'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 1 ? (
                        <form onSubmit={handleInitRegistration} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Silva"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className={emailError ? "text-red-500" : ""}>Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleEmailChange}
                                    placeholder="admin@police.lk"
                                    required
                                    className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {emailError && (
                                    <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimum 6 characters"
                                        required
                                        minLength={6}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin_officer">Admin Officer</SelectItem>
                                        <SelectItem value="finance_officer">Finance Officer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isRegistering}>
                                    {isRegistering ? 'Processing...' : 'Next: Setup 2FA'}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="space-y-6 py-2">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="bg-white p-4 border rounded-xl shadow-sm">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="2FA QR Code" width={180} height={180} className="block" />
                                    ) : (
                                        <div className="w-[180px] h-[180px] bg-gray-100 flex items-center justify-center">
                                            Loading QR...
                                        </div>
                                    )}
                                </div>

                                <div className="text-center space-y-1">
                                    <p className="font-medium text-sm">Scan with Google Authenticator</p>
                                    <p className="text-xs text-gray-500 max-w-[250px] mx-auto">
                                        Open your authenticator app, verify the identity, and enter the 6-digit code below.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-center block">Verification Code</Label>
                                <div className="flex justify-center">
                                    <Input
                                        id="code"
                                        className="text-center text-2xl tracking-[0.5em] w-[200px] h-12 font-mono"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length <= 6) setVerificationCode(val);
                                        }}
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button className="w-full sm:w-auto order-2 sm:order-1" variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                                    onClick={handleCompleteRegistration}
                                    disabled={verificationCode.length !== 6 || isRegistering}
                                >
                                    {isRegistering ? 'Verifying...' : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Create Account
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
