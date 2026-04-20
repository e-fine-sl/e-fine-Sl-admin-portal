'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { Driver, IssuedFine } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
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
    Info
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DriverDetailsResponse {
    success: boolean;
    driver: Driver;
    violations: IssuedFine[];
}

export default function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [violations, setViolations] = useState<IssuedFine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get<DriverDetailsResponse>(`/admin/drivers/${id}`);
                setDriver(response.data.driver);
                setViolations(response.data.violations);
            } catch (error) {
                console.error('Failed to fetch driver details:', error);
                toast.error('Failed to load driver details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Fetching driver dossier...</p>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Driver Not Found</h2>
                <p className="text-gray-500 mt-2">The driver you are looking for does not exist or has been removed.</p>
                <Button asChild className="mt-6">
                    <Link href="/drivers">Back to Drivers List</Link>
                </Button>
            </div>
        );
    }

    const levelStyles: Record<string, { bg: string, text: string, icon: any }> = {
        'EXCELLENT': { bg: 'bg-blue-50',  text: 'text-blue-700',  icon: CheckCircle2 },
        'GOOD':      { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
        'FAIR':      { bg: 'bg-yellow-50',text: 'text-yellow-700',icon: Info },
        'WARNING':   { bg: 'bg-orange-50',text: 'text-orange-700',icon: AlertCircle },
        'DANGER':    { bg: 'bg-red-50',   text: 'text-red-700',   icon: ShieldAlert },
        'SUSPENDED': { bg: 'bg-gray-50',  text: 'text-gray-700',  icon: XCircle },
    };

    const currentLevel = levelStyles[driver.demeritLevel] || levelStyles['EXCELLENT'];
    const StatusIcon = currentLevel.icon;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/drivers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{driver.name}</h1>
                        <p className="text-gray-500">License: {driver.licenseNumber} • Joined {formatDate(driver.createdAt)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Download Report</Button>
                    <Button variant={driver.licenseStatus === 'ACTIVE' ? 'destructive' : 'default'}
                            className={driver.licenseStatus === 'ACTIVE' ? '' : 'bg-green-600 hover:bg-green-700'}>
                        {driver.licenseStatus === 'ACTIVE' ? 'Suspend License' : 'Activate License'}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demerit Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{driver.demeritPoints} / 24</div>
                        <p className="text-xs text-gray-400 mt-1">Remaining balance</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold">{driver.ratingScore?.toFixed(1) || '0.0'}</div>
                            <Star className="h-6 w-6 text-amber-500 fill-current" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Based on compliance</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${driver.licenseStatus === 'ACTIVE' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">License Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${driver.licenseStatus === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                            {driver.licenseStatus}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Current standing</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4`} style={{ borderLeftColor: currentLevel.text }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demerit Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${currentLevel.bg} ${currentLevel.text}`}>
                            <StatusIcon className="h-4 w-4" />
                            {driver.demeritLevel}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Safety tier</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Driver Information</CardTitle>
                        <CardDescription>Official government records</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-gray-500 text-xs">NIC Number</p>
                                <p className="font-medium text-gray-900">{driver.nic}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-gray-500 text-xs">Email Address</p>
                                <p className="font-medium text-gray-900">{driver.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-gray-500 text-xs">Mobile Number</p>
                                <p className="font-medium text-gray-900">{driver.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-gray-500 text-xs">Residential Address</p>
                                <p className="font-medium text-gray-900">
                                    {driver.address || 'Address not provided'}<br />
                                    {driver.city && `${driver.city} `}
                                    {driver.postalCode && `(${driver.postalCode})`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-gray-500 text-xs">Account Created</p>
                                <p className="font-medium text-gray-900">{formatDate(driver.createdAt)}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vehicle Classes</h4>
                            <div className="flex flex-wrap gap-2">
                                {driver.vehicleClasses && driver.vehicleClasses.length > 0 ? (
                                    driver.vehicleClasses.map((cls, idx) => (
                                        <div key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-bold border border-gray-200">
                                            {cls.category}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-xs italic">No classes listed</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Violation History */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Violation History</CardTitle>
                        <CardDescription>Recent traffic offenses and fines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500 text-left">
                                        <th className="pb-3 font-medium">Offense</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {violations.length > 0 ? (
                                        violations.map((fine) => (
                                            <tr key={fine._id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-4">
                                                    <p className="font-medium text-gray-900">{fine.offenseName}</p>
                                                    <p className="text-xs text-gray-500">{fine.place}</p>
                                                </td>
                                                <td className="py-4 text-gray-600">
                                                    {formatDate(fine.date)}
                                                </td>
                                                <td className="py-4 font-semibold">
                                                    LKR {fine.amount.toLocaleString()}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                        fine.status.toUpperCase() === 'PAID' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {fine.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/fines/${fine._id}`}>View</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                                                No traffic violations recorded for this driver.
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
