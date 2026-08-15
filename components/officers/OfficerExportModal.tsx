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
import { OfficerService } from '@/services/officerService';
import { OfficerQueryDTO } from '@/types/officer.types';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: OfficerQueryDTO;
    totalRecords: number;
}

export const OfficerExportModal: React.FC<OfficerExportModalProps> = ({
    isOpen,
    onClose,
    currentFilters,
    totalRecords
}) => {
    const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await OfficerService.exportOfficers(currentFilters, format);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `eFine_Officer_List_${new Date().toISOString().slice(0, 10)}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success(`Download completed (${format.toUpperCase()})`);
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to download officer list');
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
                                Download Police Officer List
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Download filtered police officer list and station assignments.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-3 text-sm">
                    {/* Filter Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                        <div className="font-semibold text-gray-700">Active Download Scope:</div>
                        <div className="text-gray-600">Total matched officers: <strong className="text-gray-900">{totalRecords.toLocaleString()}</strong></div>
                        <div className="text-gray-600">Station filter: <span className="font-mono">{currentFilters.station || 'All Stations'}</span></div>
                        <div className="text-gray-600">Rank filter: <span className="font-mono">{currentFilters.position || 'All Ranks'}</span></div>
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
                                onClick={() => setFormat('pdf')}
                                className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                                    format === 'pdf' 
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-sm' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <FileText className="h-6 w-6 text-rose-600" />
                                <span className="text-xs">PDF Document / Ledger</span>
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
                        {exporting ? 'Generating...' : 'Download File'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
