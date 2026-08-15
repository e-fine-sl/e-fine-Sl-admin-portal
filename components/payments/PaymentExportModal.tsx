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
import { PaymentService } from '@/services/paymentService';
import { PaymentQueryDTO } from '@/types/payment.types';
import { Download, FileSpreadsheet, FileCode, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: PaymentQueryDTO;
    totalRecords: number;
}

export const PaymentExportModal: React.FC<PaymentExportModalProps> = ({
    isOpen,
    onClose,
    currentFilters,
    totalRecords
}) => {
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await PaymentService.exportPayments(currentFilters, format);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `eFine_Payments_Export_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success(`Export completed (${format.toUpperCase()})`);
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export payment dataset');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Download className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">
                                Export Treasury Settlement Ledger
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Download filtered transaction dataset for accounting reconciliation.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-3 text-sm">
                    {/* Filter Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                        <div className="font-semibold text-gray-700">Active Export Scope:</div>
                        <div className="text-gray-600">Total matched records: <strong className="text-gray-900">{totalRecords.toLocaleString()}</strong></div>
                        <div className="text-gray-600">Status filter: <span className="font-mono">{currentFilters.status || 'ALL'}</span></div>
                        {currentFilters.startDate && (
                            <div className="text-gray-600">Date window: {currentFilters.startDate} to {currentFilters.endDate || 'Present'}</div>
                        )}
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                            Select File Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                onClick={() => setFormat('csv')}
                                className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                                    format === 'csv' 
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-sm' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                <span className="text-xs">CSV / Excel Format</span>
                            </div>

                            <div 
                                onClick={() => setFormat('json')}
                                className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                                    format === 'json' 
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-sm' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <FileCode className="h-6 w-6 text-amber-600" />
                                <span className="text-xs">Raw JSON Dataset</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>
                        Cancel
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleExport} 
                        disabled={exporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        {exporting ? 'Exporting...' : 'Download Export'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
