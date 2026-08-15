'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { DriverService } from '@/services/driverService';
import { DriverDTO } from '@/types/driver.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
    ArrowLeft, 
    Calendar, 
    CreditCard, 
    Mail, 
    Phone, 
    MapPin, 
    Star, 
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Info,
    Car,
    User,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [driver, setDriver] = useState<DriverDTO | null>(null);
    const [violations, setViolations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await DriverService.getDriverById(id);
            setDriver(res.driver as any);
            setViolations(res.violations || []);
        } catch (error) {
            console.error('Failed to fetch driver details:', error);
            toast.error('Failed to load driver details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleToggleStatus = async () => {
        if (!driver) return;
        const isSuspending = driver.licenseStatus === 'ACTIVE';

        if (isSuspending) {
            const reason = prompt('Enter official reason for license suspension:', 'Dangerous driving violation / Demerit exhausted');
            if (!reason) return;

            try {
                const res = await DriverService.suspendDriver({ driverId: driver._id, reason });
                toast.success(res.message || 'Driver license suspended');
                fetchDetails();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to suspend license');
            }
        } else {
            if (!confirm(`Are you sure you want to activate license for ${driver.name}? This will restore 24 points.`)) return;

            try {
                const res = await DriverService.activateDriver(driver._id);
                toast.success(res.message || 'Driver license activated');
                fetchDetails();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to activate license');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500 font-medium text-sm">Loading driver profile...</p>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
                <h2 className="text-xl font-bold text-gray-900">Driver Record Not Found</h2>
                <p className="text-gray-500 text-sm mt-1">The driver you requested does not exist or was removed.</p>
                <Button asChild className="mt-5 bg-blue-600 hover:bg-blue-700">
                    <Link href="/drivers">Back to Drivers Directory</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header with Driver Avatar & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9">
                        <Link href="/drivers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* Driver Profile Photo */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg flex-shrink-0 shadow-sm">
                        {driver.profileImage ? (
                            <img 
                                src={driver.profileImage} 
                                alt={driver.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <span>{driver.name.slice(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{driver.name}</h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                #{driver.licenseNumber}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            NIC: {driver.nic} • Joined on {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button 
                        variant={driver.licenseStatus === 'ACTIVE' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={handleToggleStatus}
                        className={driver.licenseStatus === 'ACTIVE' ? '' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'}
                    >
                        {driver.licenseStatus === 'ACTIVE' ? (
                            <>
                                <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                                Suspend License
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Activate License (24 Pts)
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* 4 Quick KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Demerit Points */}
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-1 pt-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demerit Points</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className={`text-2xl font-bold font-mono ${
                            driver.demeritPoints <= 4 ? 'text-rose-600' : driver.demeritPoints <= 10 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                            {driver.demeritPoints} / 24
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Remaining driving balance</p>
                    </CardContent>
                </Card>

                {/* Driver Rating */}
                <Card className="shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="pb-1 pt-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Rating</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-gray-900">{(driver.ratingScore ?? 5.0).toFixed(1)}</div>
                            <Star className="h-5 w-5 text-amber-500 fill-current" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Calculated compliance score</p>
                    </CardContent>
                </Card>

                {/* License Status */}
                <Card className={`shadow-sm border-l-4 ${driver.licenseStatus === 'ACTIVE' ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                    <CardHeader className="pb-1 pt-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">License Status</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className={`text-2xl font-bold ${driver.licenseStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {driver.licenseStatus}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {driver.licenseStatus === 'ACTIVE' ? 'Authorized driving privileges' : 'Suspended by admin command'}
                        </p>
                    </CardContent>
                </Card>

                {/* Demerit Level Risk */}
                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="pb-1 pt-4">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="text-xl font-bold text-purple-700">
                            {driver.demeritLevel || 'EXCELLENT'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Current compliance tier</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Driver Information & KYC Photos */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Driver Information */}
                    <Card className="shadow-sm border">
                        <CardHeader className="pb-3 border-b bg-gray-50/50">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                                <User className="h-4 w-4 text-blue-600" />
                                Driver Particulars
                            </CardTitle>
                            <CardDescription className="text-xs">Official motorist records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 pt-4 text-xs">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">National Identity (NIC)</p>
                                    <p className="font-semibold text-gray-900">{driver.nic}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Official Email</p>
                                    <p className="font-semibold text-gray-900">{driver.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Contact Mobile</p>
                                    <p className="font-semibold text-gray-900">{driver.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Registered Vehicle</p>
                                    <p className="font-semibold text-gray-900">{driver.vehicleNumber || 'None registered'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-gray-400">Residential Address</p>
                                    <p className="font-semibold text-gray-900">
                                        {driver.addressLine1 || 'Address not recorded'}
                                        {driver.city && `, ${driver.city}`}
                                        {driver.postalCode && ` (${driver.postalCode})`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">KYC Verification</p>
                                    <p className="font-semibold text-emerald-600">
                                        {driver.kycVerified ? 'Face-match verified' : 'Pending identity verification'}
                                    </p>
                                </div>
                            </div>

                            {/* Vehicle Classes */}
                            <div className="pt-3 border-t">
                                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Authorized Driving Classes
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {driver.vehicleClasses && driver.vehicleClasses.length > 0 ? (
                                        driver.vehicleClasses.map((cls, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded text-xs font-bold border">
                                                {cls.category}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic">No specific classes recorded</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KYC Document Images Preview */}
                    {(driver.licenseFrontImage || driver.licenseBackImage) && (
                        <Card className="shadow-sm border">
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                                    <ImageIcon className="h-4 w-4 text-purple-600" />
                                    KYC License Card Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-3">
                                {driver.licenseFrontImage && (
                                    <div>
                                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">License Front</span>
                                        <div className="rounded-lg overflow-hidden border bg-gray-50 max-h-40 flex items-center justify-center">
                                            <img src={driver.licenseFrontImage} alt="License Front" className="w-full object-contain" />
                                        </div>
                                    </div>
                                )}
                                {driver.licenseBackImage && (
                                    <div>
                                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">License Back</span>
                                        <div className="rounded-lg overflow-hidden border bg-gray-50 max-h-40 flex items-center justify-center">
                                            <img src={driver.licenseBackImage} alt="License Back" className="w-full object-contain" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Violation History Ledger */}
                <Card className="lg:col-span-2 shadow-sm border">
                    <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                                <FileText className="h-4 w-4 text-amber-600" />
                                Violation & Citation History ({violations.length} tickets)
                            </CardTitle>
                            <CardDescription className="text-xs">Official traffic offenses recorded against this license</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="px-4 py-3">Offense / Violation</th>
                                        <th className="px-4 py-3">Date & Time</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3 text-right">Fine Amount</th>
                                        <th className="px-4 py-3 text-center">Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700">
                                    {violations.length > 0 ? (
                                        violations.map((fine) => (
                                            <tr key={fine._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {fine.offenseName || fine.offenseId?.offenseName || 'Traffic Violation'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    {formatDateTime(fine.date)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {fine.place || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                    {formatCurrency(fine.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge 
                                                        className={
                                                            (fine.status || '').toUpperCase() === 'PAID' 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }
                                                    >
                                                        {fine.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-gray-400">
                                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                                                <p className="font-semibold text-gray-600">Clean Traffic Record</p>
                                                <p className="text-xs text-gray-400 mt-0.5">No traffic violations or unpaid citations on file.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
