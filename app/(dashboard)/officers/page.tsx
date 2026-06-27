'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Officer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Search, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

interface Station {
    _id: string;
    stationCode: string;
    name: string;
    district: string;
    officialEmail: string;
}

type RegistrationStep = 'verification' | 'otp' | 'details';

export default function OfficersPage() {
    const { user } = useAuth();
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('verification');
    const [stationName, setStationName] = useState('');

    // Step 1: Verification Request
    const [verificationData, setVerificationData] = useState({
        badgeNumber: '',
        stationCode: ''
    });

    // Step 2: OTP Verification
    const [otp, setOtp] = useState('');

    // Step 3: Officer Details
    const [officerData, setOfficerData] = useState({
        name: '',
        email: '',
        password: '',
        nic: '',
        phone: '',
        position: '',
        profileImage: ''
    });

    const canCreateOfficer = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN_OFFICER;
    const canDeleteOfficer = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN_OFFICER;
    const limit = 15;

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/officers`, {
                params: { page, limit, search }
            });
            setOfficers(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch officers:', error);
            toast.error('Failed to load officers');
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        try {
            const response = await api.get('/stations');
            setStations(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stations:', error);
        }
    };

    useEffect(() => {
        fetchOfficers();
        fetchStations();
    }, [page, search]);

    const handleOpenDialog = () => {
        setCurrentStep('verification');
        setVerificationData({ badgeNumber: '', stationCode: '' });
        setOtp('');
        setOfficerData({
            name: '',
            email: '',
            password: '',
            nic: '',
            phone: '',
            position: '',
            profileImage: ''
        });
        setStationName('');
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    // Step 1: Request OTP Verification
    const handleRequestVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verificationData.badgeNumber || !verificationData.stationCode) {
            toast.error('Please provide badge number and select station');
            return;
        }

        try {
            const response = await api.post('/auth/request-verification', verificationData);

            const selectedStation = stations.find(s => s.stationCode === verificationData.stationCode);
            setStationName(selectedStation?.name || '');

            toast.success(response.data.message || 'OTP sent to station email');
            setCurrentStep('otp');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to request verification');
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            await api.post('/auth/verify-otp', {
                badgeNumber: verificationData.badgeNumber,
                otp
            });

            toast.success('OTP verified successfully');
            setCurrentStep('details');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        }
    };

    // Step 3: Complete Registration
    const handleCompleteRegistration = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!officerData.name || !officerData.email || !officerData.password ||
            !officerData.nic || !officerData.phone || !officerData.position) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(officerData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (officerData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            const selectedStation = stations.find(s => s.stationCode === verificationData.stationCode);

            await api.post('/auth/register-police', {
                name: officerData.name,
                badgeNumber: verificationData.badgeNumber,
                email: officerData.email,
                password: officerData.password,
                station: selectedStation?.name,
                otp: otp,
                nic: officerData.nic,
                phone: officerData.phone,
                position: officerData.position,
                profileImage: officerData.profileImage || 'https://cdn-icons-png.flaticon.com/512/206/206853.png'
            });

            toast.success('Police officer registered successfully');
            handleCloseDialog();
            setPage(1);
            fetchOfficers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register officer');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete officer "${name}"?`)) return;

        try {
            await api.delete(`/admin/officers/${id}`);
            toast.success('Officer deleted successfully');

            if (officers.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchOfficers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete officer');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Police Officers</h1>
                    <p className="text-gray-500 mt-1">Manage police officer accounts</p>
                </div>
                {canCreateOfficer && (
                    <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Officer
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Officers ({total})</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name, badge number..."
                                className="pl-9 w-80"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Badge Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Station</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                                        {canDeleteOfficer && (
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {officers.map((officer) => (
                                        <tr key={officer._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{officer.name}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <Badge variant="outline">{officer.badgeNumber}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{officer.email}</td>
                                            <td className="px-4 py-3 text-sm">{officer.policeStation}</td>
                                            <td className="px-4 py-3">
                                                <Badge>{officer.position}</Badge>
                                            </td>
                                            {canDeleteOfficer && (
                                                <td className="px-4 py-3">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(officer._id, officer.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {officers.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    {search ? 'No officers found matching your search' : 'No officers found'}
                                </div>
                            )}

                            {/* Pagination */}
                            {total > limit && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
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
                                        <div className="flex items-center gap-2 px-3">
                                            <span className="text-sm text-gray-600">
                                                Page {page} of {Math.ceil(total / limit)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page * limit >= total}
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

            {/* Multi-Step Registration Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {currentStep === 'verification' && 'Step 1: Request Verification'}
                            {currentStep === 'otp' && 'Step 2: Verify OTP'}
                            {currentStep === 'details' && 'Step 3: Officer Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentStep === 'verification' && 'Enter badge number and select police station to send OTP'}
                            {currentStep === 'otp' && `OTP has been sent to ${stationName} official email`}
                            {currentStep === 'details' && 'Complete officer registration details'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step 1: Verification Request */}
                    {currentStep === 'verification' && (
                        <form onSubmit={handleRequestVerification}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="badgeNumber">
                                        Badge Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="badgeNumber"
                                        placeholder="e.g., P12345"
                                        value={verificationData.badgeNumber}
                                        onChange={(e) => setVerificationData({ ...verificationData, badgeNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stationCode">
                                        Police Station <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={verificationData.stationCode}
                                        onValueChange={(value) => setVerificationData({ ...verificationData, stationCode: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Police Station" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stations.map((station) => (
                                                <SelectItem key={station.stationCode} value={station.stationCode}>
                                                    {station.name} - {station.district}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">OTP will be sent to the station's official email</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Send OTP
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {currentStep === 'otp' && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="space-y-4 py-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800">
                                         A 6-digit OTP has been sent to the official email of <strong>{stationName}</strong>.
                                        Please obtain the code from the station OIC.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp">
                                        Enter OTP <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep('verification')}
                                >
                                    Back
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Verify OTP
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Step 3: Officer Details */}
                    {currentStep === 'details' && (
                        <form onSubmit={handleCompleteRegistration}>
                            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-center gap-2 text-sm text-green-800">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>OTP Verified Successfully</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., John Silva"
                                        value={officerData.name}
                                        onChange={(e) => setOfficerData({ ...officerData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nic">
                                        NIC Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nic"
                                        placeholder="e.g., 199812345678"
                                        value={officerData.nic}
                                        onChange={(e) => setOfficerData({ ...officerData, nic: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g., officer@police.lk"
                                        value={officerData.email}
                                        onChange={(e) => setOfficerData({ ...officerData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="e.g., 0771234567"
                                        value={officerData.phone}
                                        onChange={(e) => setOfficerData({ ...officerData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={officerData.password}
                                        onChange={(e) => setOfficerData({ ...officerData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        Position/Rank <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={officerData.position}
                                        onValueChange={(value) => setOfficerData({ ...officerData, position: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Constable">Constable</SelectItem>
                                            <SelectItem value="Sergeant">Sergeant</SelectItem>
                                            <SelectItem value="Inspector">Inspector</SelectItem>
                                            <SelectItem value="Sub Inspector">Sub Inspector</SelectItem>
                                            <SelectItem value="OIC">OIC (Officer In Charge)</SelectItem>
                                            <SelectItem value="ASP">ASP (Assistant Superintendent)</SelectItem>
                                            <SelectItem value="SP">SP (Superintendent)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep('otp')}
                                >
                                    Back
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    Complete Registration
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
