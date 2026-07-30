'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MONTHS, YEAR_RANGE } from '@/lib/constants';
import { Download, FileText, Search, CheckCircle2, AlertTriangle, ShieldAlert, Globe, MapPin, Car, UserCheck } from 'lucide-react';

const PROVINCES = [
    { label: 'Whole Country (All Island)', value: 'ALL' },
    { label: 'Western Province', value: 'Western' },
    { label: 'Central Province', value: 'Central' },
    { label: 'Southern Province', value: 'Southern' },
    { label: 'Northern Province', value: 'Northern' },
    { label: 'Eastern Province', value: 'Eastern' },
    { label: 'North Western Province', value: 'North Western' },
    { label: 'North Central Province', value: 'North Central' },
    { label: 'Uva Province', value: 'Uva' },
    { label: 'Sabaragamuwa Province', value: 'Sabaragamuwa' }
];

const DISTRICTS_MAP: Record<string, string[]> = {
    Western: ['Colombo', 'Gampaha', 'Kalutara'],
    Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
    Southern: ['Galle', 'Matara', 'Hambantota'],
    Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
    Eastern: ['Batticaloa', 'Ampara', 'Trincomalee'],
    'North Western': ['Kurunegala', 'Puttalam'],
    'North Central': ['Anuradhapura', 'Polonnaruwa'],
    Uva: ['Badulla', 'Moneragala'],
    Sabaragamuwa: ['Ratnapura', 'Kegalle']
};

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'fines' | 'payment' | 'driver' | 'vehicle' | 'officer'>('fines');
    
    // Timeframe States
    const [periodType, setPeriodType] = useState<'monthly' | 'annual' | 'custom'>('monthly');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Regional Filter States
    const [province, setProvince] = useState('ALL');
    const [district, setDistrict] = useState('ALL');

    // Target Query Input States
    const [driverScope, setDriverScope] = useState<'individual' | 'nationwide'>('individual');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [policeOfficerId, setPoliceOfficerId] = useState('');

    // Pre-validation Driver States
    const [verifyingDriver, setVerifyingDriver] = useState(false);
    const [verifiedDriver, setVerifiedDriver] = useState<any>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    // Pre-validation Vehicle States
    const [verifyingVehicle, setVerifyingVehicle] = useState(false);
    const [verifiedVehicle, setVerifiedVehicle] = useState<any>(null);
    const [vehicleVerificationError, setVehicleVerificationError] = useState<string | null>(null);

    // Pre-validation Officer States
    const [verifyingOfficer, setVerifyingOfficer] = useState(false);
    const [verifiedOfficer, setVerifiedOfficer] = useState<any>(null);
    const [officerVerificationError, setOfficerVerificationError] = useState<string | null>(null);

    // Available Districts based on Province
    const availableDistricts = province !== 'ALL' && DISTRICTS_MAP[province] ? DISTRICTS_MAP[province] : [];

    // Reset District if Province changes
    const handleProvinceChange = (newProvince: string) => {
        setProvince(newProvince);
        setDistrict('ALL');
    };

    // 1. Pre-validate Driver Search
    const handleVerifyDriver = async () => {
        if (!licenseNumber.trim()) {
            toast.error('Please enter a driving license number to search');
            return;
        }
        try {
            setVerifyingDriver(true);
            setVerificationError(null);
            setVerifiedDriver(null);
            const res = await api.post('/admin/reports/verify-driver', {
                licenseNumber: licenseNumber.trim()
            });
            if (res.data.success) {
                setVerifiedDriver(res.data.driver);
                toast.success(`Driver Verified: ${res.data.driver.name}`);
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.message || 'Driver search failed';
            setVerificationError(errMsg);
            toast.error(errMsg);
        } finally {
            setVerifyingDriver(false);
        }
    };

    // 2. Pre-validate Vehicle Search
    const handleVerifyVehicle = async () => {
        if (!vehicleNumber.trim()) {
            toast.error('Please enter a vehicle registration plate number to search');
            return;
        }
        try {
            setVerifyingVehicle(true);
            setVehicleVerificationError(null);
            setVerifiedVehicle(null);
            const res = await api.post('/admin/reports/verify-vehicle', {
                vehicleNumber: vehicleNumber.trim()
            });
            if (res.data.success) {
                setVerifiedVehicle(res.data.vehicle);
                toast.success(`Vehicle Verified: ${res.data.vehicle.vehicleNumber}`);
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.message || 'Vehicle search failed';
            setVehicleVerificationError(errMsg);
            toast.error(errMsg);
        } finally {
            setVerifyingVehicle(false);
        }
    };

    // 3. Pre-validate Police Officer Search
    const handleVerifyOfficer = async () => {
        if (!policeOfficerId.trim()) {
            toast.error('Please enter Police Officer Badge Number or ID to search');
            return;
        }
        try {
            setVerifyingOfficer(true);
            setOfficerVerificationError(null);
            setVerifiedOfficer(null);
            const res = await api.post('/admin/reports/verify-officer', {
                policeOfficerId: policeOfficerId.trim()
            });
            if (res.data.success) {
                setVerifiedOfficer(res.data.officer);
                toast.success(`Officer Verified: ${res.data.officer.name}`);
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.message || 'Officer search failed';
            setOfficerVerificationError(errMsg);
            toast.error(errMsg);
        } finally {
            setVerifyingOfficer(false);
        }
    };

    // Generate Fine Audit Report
    const generateFinesReport = async () => {
        try {
            setLoading(true);
            const response = await api.post('/admin/reports/monthly-fines', {
                periodType,
                month,
                year,
                startDate,
                endDate,
                province,
                district
            }, { responseType: 'blob' });

            toast.success('Fines Audit PDF generated successfully');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Fine_Audit_${periodType}_${Date.now()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate fine audit report');
        } finally {
            setLoading(false);
        }
    };

    // Generate Payment Summary Report
    const generatePaymentReport = async () => {
        try {
            setLoading(true);
            const response = await api.post('/admin/reports/payments', {
                periodType,
                month,
                year,
                startDate,
                endDate,
                province,
                district
            }, { responseType: 'blob' });

            toast.success('Payment Summary PDF generated successfully');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Payment_Summary_${periodType}_${Date.now()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate payment summary report');
        } finally {
            setLoading(false);
        }
    };

    // Generate Driver Violations Report
    const generateDriverReport = async () => {
        if (driverScope === 'individual' && !verifiedDriver) {
            toast.error('Please search and verify the driver license number before generating report.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/admin/reports/driver-violations', {
                reportScope: driverScope,
                licenseNumber: licenseNumber.trim(),
                province,
                district
            }, { responseType: 'blob' });

            toast.success('Driver Violation PDF generated successfully');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = driverScope === 'individual' 
                ? `Driver_Violations_${licenseNumber.trim()}.pdf` 
                : `Nationwide_Driver_Audit_${Date.now()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate driver violation report');
        } finally {
            setLoading(false);
        }
    };

    // Generate Vehicle Violations Report
    const generateVehicleReport = async () => {
        if (!verifiedVehicle) {
            toast.error('Please search and verify the vehicle registration plate number before generating report.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/admin/reports/vehicle-violations', {
                vehicleNumber: vehicleNumber.trim()
            }, { responseType: 'blob' });

            toast.success('Vehicle Report PDF generated successfully');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Vehicle_Report_${vehicleNumber.trim()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate vehicle report');
        } finally {
            setLoading(false);
        }
    };

    // Generate Officer Performance Report
    const generateOfficerReport = async () => {
        if (!verifiedOfficer) {
            toast.error('Please search and verify the police officer badge ID before generating report.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/admin/reports/officer-performance', {
                policeOfficerId: policeOfficerId.trim()
            }, { responseType: 'blob' });

            toast.success('Officer Performance PDF generated successfully');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Officer_Performance_${policeOfficerId.trim()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate officer performance report');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        if (reportType === 'fines') {
            generateFinesReport();
        } else if (reportType === 'payment') {
            generatePaymentReport();
        } else if (reportType === 'driver') {
            generateDriverReport();
        } else if (reportType === 'vehicle') {
            generateVehicleReport();
        } else if (reportType === 'officer') {
            generateOfficerReport();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Executive Reports Module</h1>
                <p className="text-gray-500 mt-1">Generate multi-dimensional, regional, and national PDF audit reports</p>
            </div>

            {/* Top Report Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Fine Audit Report */}
                <Card className={`cursor-pointer transition ${reportType === 'fines' ? 'ring-2 ring-blue-600 shadow-md bg-blue-50/20' : 'hover:border-blue-300'}`} onClick={() => setReportType('fines')}>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Fines & Enforcement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-slate-500">
                        Monthly, Annual (12-Mo), or Custom fine counts & LKR liabilities.
                    </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card className={`cursor-pointer transition ${reportType === 'payment' ? 'ring-2 ring-emerald-600 shadow-md bg-emerald-50/20' : 'hover:border-emerald-300'}`} onClick={() => setReportType('payment')}>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            Payment Reconciliation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-slate-500">
                        Settled revenue reconciliation across provinces & custom dates.
                    </CardContent>
                </Card>

                {/* Driver Violations */}
                <Card className={`cursor-pointer transition ${reportType === 'driver' ? 'ring-2 ring-amber-600 shadow-md bg-amber-50/20' : 'hover:border-amber-300'}`} onClick={() => setReportType('driver')}>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            Driver Violations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-slate-500">
                        Individual driver demerit status or Nationwide driver audit roster.
                    </CardContent>
                </Card>

                {/* Vehicle Audit */}
                <Card className={`cursor-pointer transition ${reportType === 'vehicle' ? 'ring-2 ring-purple-600 shadow-md bg-purple-50/20' : 'hover:border-purple-300'}`} onClick={() => setReportType('vehicle')}>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <Car className="h-4 w-4 text-purple-600" />
                            Vehicle Citation History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-slate-500">
                        Violations tied to specific vehicle plate numbers (e.g. WP CAS-1234).
                    </CardContent>
                </Card>

                {/* Officer Performance */}
                <Card className={`cursor-pointer transition ${reportType === 'officer' ? 'ring-2 ring-indigo-600 shadow-md bg-indigo-50/20' : 'hover:border-indigo-300'}`} onClick={() => setReportType('officer')}>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <UserCheck className="h-4 w-4 text-indigo-600" />
                            Officer Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-slate-500">
                        Citation logs and fine settlement rate per Police Badge ID.
                    </CardContent>
                </Card>
            </div>

            {/* Main Configuration & Filtering Card */}
            <Card className="border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                        <span>
                            {reportType === 'fines' && '📊 Fines & Enforcement Audit Options'}
                            {reportType === 'payment' && '💳 Payment & Revenue Summary Options'}
                            {reportType === 'driver' && '👤 Driver Violation & Demerit Audit Options'}
                            {reportType === 'vehicle' && '🚗 Vehicle Citation History Options'}
                            {reportType === 'officer' && '👮 Police Officer Performance Audit Options'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* SECTION 1: VEHICLE CITATION PRE-VALIDATION */}
                    {reportType === 'vehicle' && (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-800">
                                Search & Verify Vehicle Registration Plate Number
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter Vehicle Plate Number (e.g., WP CAS-1234)"
                                    value={vehicleNumber}
                                    onChange={(e) => {
                                        setVehicleNumber(e.target.value);
                                        setVerifiedVehicle(null);
                                        setVehicleVerificationError(null);
                                    }}
                                    className="flex-1 px-4 py-2 border rounded-md uppercase font-mono text-sm shadow-sm focus:ring-2 focus:ring-purple-500"
                                />
                                <Button
                                    type="button"
                                    onClick={handleVerifyVehicle}
                                    disabled={verifyingVehicle || !vehicleNumber.trim()}
                                    className="bg-purple-700 hover:bg-purple-800 text-white"
                                >
                                    {verifyingVehicle ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Search & Verify Vehicle
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Vehicle Verification Success Box */}
                            {verifiedVehicle && (
                                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-md flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div className="text-sm">
                                        <div className="font-bold text-emerald-900">Vehicle Verified: {verifiedVehicle.vehicleNumber}</div>
                                        <div className="text-emerald-700 text-xs mt-1">
                                            Total Citations: <span className="font-bold">{verifiedVehicle.totalViolations}</span> | Paid: <span className="font-bold text-emerald-800">{verifiedVehicle.paidCount}</span> | Unpaid: <span className="font-bold text-red-700">{verifiedVehicle.unpaidCount}</span> | Total Liability: <span className="font-bold">LKR {verifiedVehicle.totalFineValue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Verification Error Alert */}
                            {vehicleVerificationError && (
                                <div className="bg-red-50 border border-red-300 p-4 rounded-md flex items-center gap-3 text-red-800 text-sm">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span>{vehicleVerificationError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: POLICE OFFICER PRE-VALIDATION */}
                    {reportType === 'officer' && (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-800">
                                Search & Verify Police Officer Badge Number / ID
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter Police Officer Badge ID (e.g., Officer-001 or POL-9921)"
                                    value={policeOfficerId}
                                    onChange={(e) => {
                                        setPoliceOfficerId(e.target.value);
                                        setVerifiedOfficer(null);
                                        setOfficerVerificationError(null);
                                    }}
                                    className="flex-1 px-4 py-2 border rounded-md font-mono text-sm shadow-sm focus:ring-2 focus:ring-indigo-500"
                                />
                                <Button
                                    type="button"
                                    onClick={handleVerifyOfficer}
                                    disabled={verifyingOfficer || !policeOfficerId.trim()}
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white"
                                >
                                    {verifyingOfficer ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Search & Verify Officer
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Officer Verification Success Box */}
                            {verifiedOfficer && (
                                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-md flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div className="text-sm">
                                        <div className="font-bold text-emerald-900">{verifiedOfficer.name} ({verifiedOfficer.badgeNumber})</div>
                                        <div className="text-emerald-700 text-xs mt-1">
                                            Station: <span className="font-bold">{verifiedOfficer.policeStation}</span> | Rank: <span className="font-bold">{verifiedOfficer.position}</span> | Issued Citations: <span className="font-bold">{verifiedOfficer.totalIssued}</span> | Revenue: <span className="font-bold">LKR {verifiedOfficer.totalRevenue.toLocaleString()}</span> ({verifiedOfficer.settlementRate}% Settled)
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Officer Verification Error Alert */}
                            {officerVerificationError && (
                                <div className="bg-red-50 border border-red-300 p-4 rounded-md flex items-center gap-3 text-red-800 text-sm">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span>{officerVerificationError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 3: DRIVER REPORT SPECIFIC OPTIONS */}
                    {reportType === 'driver' && (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-800">
                                Report Target Scope
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setDriverScope('individual'); setVerifiedDriver(null); }}
                                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition ${driverScope === 'individual' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                                >
                                    <Search className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="text-sm">Individual Driver Report</div>
                                        <div className="text-xs font-normal text-slate-500">Search & verify specific license number</div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDriverScope('nationwide'); setVerifiedDriver(null); }}
                                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition ${driverScope === 'nationwide' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                                >
                                    <Globe className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <div className="text-sm">Nationwide / Regional Audit</div>
                                        <div className="text-xs font-normal text-slate-500">All high-risk & suspended drivers in country</div>
                                    </div>
                                </button>
                            </div>

                            {/* Individual Driver Search & Pre-Validation Box */}
                            {driverScope === 'individual' && (
                                <div className="space-y-3 pt-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                                        Search Driving License Number
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Enter License Number (e.g., B5395114)"
                                            value={licenseNumber}
                                            onChange={(e) => {
                                                setLicenseNumber(e.target.value);
                                                setVerifiedDriver(null);
                                                setVerificationError(null);
                                            }}
                                            className="flex-1 px-4 py-2 border rounded-md uppercase font-mono text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleVerifyDriver}
                                            disabled={verifyingDriver || !licenseNumber.trim()}
                                            className="bg-slate-800 hover:bg-slate-900 text-white"
                                        >
                                            {verifyingDriver ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Search & Verify Driver
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Driver Verification Success Box */}
                                    {verifiedDriver && (
                                        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-md flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                                            <div className="text-sm">
                                                <div className="font-bold text-emerald-900">{verifiedDriver.name}</div>
                                                <div className="text-emerald-700 text-xs mt-1">
                                                    License: <span className="font-mono">{verifiedDriver.licenseNumber}</span> | Status: <span className="font-bold">{verifiedDriver.licenseStatus}</span> | Demerit Balance: <span className="font-bold">{verifiedDriver.demeritPoints} Pts</span> | Violations: {verifiedDriver.offenseCount}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Driver Verification Error Alert */}
                                    {verificationError && (
                                        <div className="bg-red-50 border border-red-300 p-4 rounded-md flex items-center gap-3 text-red-800 text-sm">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            <span>{verificationError}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMEFRAME OPTIONS FOR FINES & PAYMENTS */}
                    {(reportType === 'fines' || reportType === 'payment') && (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-800">
                                📅 Timeframe & Granularity Option
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPeriodType('monthly')}
                                    className={`p-3 rounded-lg border text-left transition ${periodType === 'monthly' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                                >
                                    <div className="text-sm">Monthly Report</div>
                                    <div className="text-xs font-normal text-slate-500">Specific month breakdown</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriodType('annual')}
                                    className={`p-3 rounded-lg border text-left transition ${periodType === 'annual' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                                >
                                    <div className="text-sm">Annual Full Report</div>
                                    <div className="text-xs font-normal text-slate-500">Entire 12-month summary</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriodType('custom')}
                                    className={`p-3 rounded-lg border text-left transition ${periodType === 'custom' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                                >
                                    <div className="text-sm">Custom Date Range</div>
                                    <div className="text-xs font-normal text-slate-500">Specific start to end dates</div>
                                </button>
                            </div>

                            {/* Time Inputs */}
                            {periodType === 'monthly' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        >
                                            {MONTHS.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        >
                                            {YEAR_RANGE.map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {periodType === 'annual' && (
                                <div className="pt-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Select Full Audit Year</label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="w-full md:w-1/2 px-3 py-2 border rounded-md text-sm bg-white"
                                    >
                                        {YEAR_RANGE.map((y) => (
                                            <option key={y} value={y}>{y} Annual Report</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {periodType === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* REGIONAL PROVINCE & DISTRICT FILTERS */}
                    {(reportType === 'fines' || reportType === 'payment' || (reportType === 'driver' && driverScope === 'nationwide')) && (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                Regional Geographic Filters
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Province Filter</label>
                                    <select
                                        value={province}
                                        onChange={(e) => handleProvinceChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    >
                                        {PROVINCES.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">District Filter</label>
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        disabled={province === 'ALL'}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        <option value="ALL">All Districts in {province === 'ALL' ? 'Selected Province' : province}</option>
                                        {availableDistricts.map((d) => (
                                            <option key={d} value={d}>{d} District</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={
                                loading || 
                                (reportType === 'driver' && driverScope === 'individual' && !verifiedDriver) ||
                                (reportType === 'vehicle' && !verifiedVehicle) ||
                                (reportType === 'officer' && !verifiedOfficer)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-base font-semibold shadow-md disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Building Executive PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="h-5 w-5 mr-2" />
                                    Generate & Download PDF Report
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
