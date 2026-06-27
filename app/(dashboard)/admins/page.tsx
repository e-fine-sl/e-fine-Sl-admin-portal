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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, ShieldCheck, ShieldAlert, CheckCircle2, QrCode, Eye, EyeOff, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

interface AdminUser {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: string;
    isTwoFactorEnabled: boolean;
    isActive?: boolean;
    lastLogin?: string;
}

export default function AdminsPage() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 15;

    // Edit/Delete State
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: 2FA Setup

    // Registration/Edit Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin_officer',
        isActive: true
    });

    // 2FA Setup Data (Temporary)
    const [tempSecret, setTempSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        if (user?.role === USER_ROLES.SUPER_ADMIN) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/all');
            if (response.data.success) {
                setAdmins(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load admins', error);
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

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
        setIsEditMode(false);
        setStep(1);
        setFormData({ name: '', email: '', password: '', role: 'admin_officer', isActive: true });
        setTempSecret('');
        setQrCodeUrl('');
        setVerificationCode('');
        setEmailError('');
        setSelectedAdminId(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (admin: AdminUser) => {
        setIsEditMode(true);
        setFormData({
            name: admin.name,
            email: admin.email,
            password: '', 
            role: admin.role,
            isActive: admin.isActive ?? true
        });
        setSelectedAdminId(admin._id || admin.id);
        setStep(1); 
        setEmailError('');
        setIsDialogOpen(true);
    };

    const handleInitRegistration = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            return handleEditAdmin(e);
        }

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
            setFormData({ name: '', email: '', password: '', role: 'admin_officer', isActive: true });
            fetchAdmins();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdminId) return;

        if (!formData.name || !formData.email) {
            toast.error('Please fill in required fields');
            return;
        }

        if (!validateEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setIsRegistering(true);
            await api.put(`/admin/${selectedAdminId}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive
            });
            toast.success('Admin updated successfully');
            fetchAdmins();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update admin');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdminId) return;
        try {
            await api.delete(`/admin/${selectedAdminId}`);
            toast.success('Admin deleted successfully');
            fetchAdmins();
            setIsDeleteDialogOpen(false);
            setSelectedAdminId(null);
        } catch (error: any) {
             toast.error(error.response?.data?.message || 'Failed to delete admin');
             setIsDeleteDialogOpen(false);
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

            <Card>
                <CardHeader>
                    <CardTitle>System Administrators</CardTitle>
                    <CardDescription>Accounts with administrative access to the portal</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading admins...</div>
                    ) : admins.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                            <p>No admins found.</p>
                            <p className="text-sm mt-2">Use the "Add Admin Officer" button to create verified accounts.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Last Login</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.slice((page - 1) * limit, page * limit).map((admin) => (
                                        <tr key={admin._id || admin.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{admin.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                                                    {admin.role.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {admin.isActive ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never logged in'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleOpenEditDialog(admin)}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAdminId(admin._id || admin.id);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        disabled={admin.role === 'super_admin'}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {admins.length > limit && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t px-2">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, admins.length)} of {admins.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page * limit >= admins.length}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this admin account? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAdmin}>Delete Admin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Admin Modal with Enforced 2FA */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isEditMode ? (
                                <>
                                    <Pencil className="h-5 w-5" /> Edit Admin
                                </>
                            ) : step === 1 ? (
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
                            {isEditMode 
                                ? 'Modify the details for this admin account.'
                                : step === 1
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

                            {!isEditMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Minimum 6 characters"
                                            required={!isEditMode}
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
                                        </Button>
                                    </div>
                                </div>
                            )}

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
                                        <SelectItem value="super_admin" disabled={!isEditMode || formData.role !== 'super_admin'}>Super Admin</SelectItem>
                                        <SelectItem value="admin_officer">Admin Officer</SelectItem>
                                        <SelectItem value="finance_officer">Finance Officer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isEditMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="isActive">Account Status</Label>
                                    <Select
                                        value={formData.isActive.toString()}
                                        onValueChange={(val) => setFormData({ ...formData, isActive: val === 'true' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isRegistering}>
                                    {isRegistering ? 'Processing...' : isEditMode ? 'Save Changes' : 'Next: Setup 2FA'}
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
