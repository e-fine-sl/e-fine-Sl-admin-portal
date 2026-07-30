'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MONTHS, YEAR_RANGE } from '@/lib/constants';
import { Download, FileText } from 'lucide-react';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'monthly' | 'payment' | 'driver'>('monthly');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [licenseNumber, setLicenseNumber] = useState('');

    const generateMonthlyReport = async () => {
        try {
            setLoading(true);
            const response = await api.post('/admin/reports/monthly-fines', {
                month,
                year
            }, { responseType: 'blob' });

            toast.success('Report generated successfully');

            // Create PDF download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `monthly-fines-${year}-${month}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const generatePaymentReport = async () => {
        try {
            setLoading(true);
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

            const response = await api.post('/admin/reports/payments', {
                startDate,
                endDate
            }, { responseType: 'blob' });

            toast.success('Report generated successfully');

            // Create PDF download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payment-report-${year}-${month}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const generateDriverReport = async () => {
        if (!licenseNumber.trim()) {
            toast.error('Please enter a driver license number');
            return;
        }
        try {
            setLoading(true);
            const response = await api.post('/admin/reports/driver-violations', {
                licenseNumber: licenseNumber.trim()
            }, { responseType: 'blob' });

            toast.success('Driver report generated successfully');

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `driver-violations-${licenseNumber.trim()}.pdf`;
            link.click();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate driver report');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        if (reportType === 'monthly') {
            generateMonthlyReport();
        } else if (reportType === 'payment') {
            generatePaymentReport();
        } else if (reportType === 'driver') {
            generateDriverReport();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-gray-500 mt-1">Generate and download executive reports</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Fines Report */}
                <Card className={reportType === 'monthly' ? 'ring-2 ring-blue-600' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Monthly Fines Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Detailed monthly fine counts, paid ratio, and LKR revenue breakdown
                        </p>
                        <Button
                            className="w-full"
                            variant={reportType === 'monthly' ? 'default' : 'outline'}
                            onClick={() => setReportType('monthly')}
                        >
                            Select
                        </Button>
                    </CardContent>
                </Card>

                {/* Payment Report */}
                <Card className={reportType === 'payment' ? 'ring-2 ring-blue-600' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Reconciliation report for all settled fine payments and revenue
                        </p>
                        <Button
                            className="w-full"
                            variant={reportType === 'payment' ? 'default' : 'outline'}
                            onClick={() => setReportType('payment')}
                        >
                            Select
                        </Button>
                    </CardContent>
                </Card>

                {/* Driver Violations Report */}
                <Card className={reportType === 'driver' ? 'ring-2 ring-blue-600' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-600" />
                            Driver Violations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Individual driver offense history, demerit score, and suspension record
                        </p>
                        <Button
                            className="w-full"
                            variant={reportType === 'driver' ? 'default' : 'outline'}
                            onClick={() => setReportType('driver')}
                        >
                            Select
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Report Generation Form */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {reportType === 'monthly' && 'Generate Monthly Fines Report'}
                        {reportType === 'payment' && 'Generate Payment Summary Report'}
                        {reportType === 'driver' && 'Generate Driver Violation History'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {reportType === 'driver' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Driving License Number
                            </label>
                            <input
                                type="text"
                                placeholder="Enter License Number (e.g., B5395114)"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md uppercase font-mono"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Month
                                </label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    {YEAR_RANGE.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Generate & Download PDF
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-md">
                        <p className="font-medium text-blue-900 mb-1">Note:</p>
                        <p>Reports will be downloaded as PDF files containing well-formatted tables and summary statistics.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
