'use client';

import React, { useState } from 'react';
import { useFines } from '@/hooks/useFines';
import { FineMetricsCards } from '@/components/fines/FineMetricsCards';
import { FineFilters } from '@/components/fines/FineFilters';
import { FineTable } from '@/components/fines/FineTable';
import { FineDetailModal } from '@/components/fines/FineDetailModal';
import { FineCreateModal } from '@/components/fines/FineCreateModal';
import { FineStatusModal } from '@/components/fines/FineStatusModal';
import { FineExportModal } from '@/components/fines/FineExportModal';
import { FineService } from '@/services/fineService';
import { FineDTO } from '@/types/fine.types';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinesPage() {
    const { user } = useAuth();
    const canCreate = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN_OFFICER;

    const {
        fines,
        metrics,
        loading,
        metricsLoading,
        page,
        setPage,
        limit,
        total,
        pages,
        search,
        setSearch,
        status,
        setStatus,
        policeStation,
        setPoliceStation,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sortBy,
        sortOrder,
        toggleSort,
        refetchFines,
        refetchMetrics,
        resetFilters
    } = useFines();

    // Modals State
    const [selectedFine, setSelectedFine] = useState<FineDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Handlers
    const handleOpenDetail = (fine: FineDTO) => {
        setSelectedFine(fine);
        setIsDetailModalOpen(true);
    };

    const handleOpenStatus = (fine: FineDTO) => {
        setSelectedFine(fine);
        setIsStatusModalOpen(true);
    };

    const handleDownloadSinglePdf = async (fine: FineDTO) => {
        try {
            const blob = await FineService.downloadReceiptPdf(fine._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `e-Fine-Receipt-${fine._id.slice(-8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('e-Fine Receipt downloaded');
        } catch (error) {
            console.error('Failed to download PDF:', error);
            toast.error('Failed to download e-Fine Receipt');
        }
    };

    const handleDeleteFine = async (fine: FineDTO) => {
        if (!confirm(`Are you sure you want to delete citation #${fine._id.slice(-8).toUpperCase()} (License: ${fine.licenseNumber})?`)) {
            return;
        }

        try {
            const res = await FineService.deleteFine(fine._id);
            toast.success(res.message || 'Citation removed from registry');
            refetchFines();
            refetchMetrics();
        } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete citation');
        }
    };

    const handleRefreshAll = () => {
        refetchFines();
        refetchMetrics();
        toast.info('Traffic citations directory refreshed');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Traffic Fines</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review, issue, and manage traffic fines, dispute claims, and revenue settlement
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshAll}
                        className="text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh Fines
                    </Button>
                </div>
            </div>

            {/* 1. Executive Citation Metrics */}
            <FineMetricsCards metrics={metrics} loading={metricsLoading} />

            {/* 2. Multi-Dimensional Filter Bar */}
            <FineFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                policeStation={policeStation}
                onPoliceStationChange={setPoliceStation}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                onResetFilters={resetFilters}
                onOpenExport={() => setIsExportModalOpen(true)}
                onOpenCreate={() => setIsCreateModalOpen(true)}
                canCreate={canCreate}
                totalResults={total}
            />

            {/* 3. Citations Table */}
            <FineTable
                fines={fines}
                loading={loading}
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={toggleSort}
                onSelectFine={handleOpenDetail}
                onUpdateStatus={handleOpenStatus}
                onDownloadPdf={handleDownloadSinglePdf}
                onDeleteFine={handleDeleteFine}
            />

            {/* 4. Fine Dossier Modal */}
            <FineDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                fine={selectedFine}
                onUpdateStatus={handleOpenStatus}
            />

            {/* 5. Issue Fine Modal */}
            <FineCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetchFines();
                    refetchMetrics();
                }}
            />

            {/* 6. Update Status / Dispute Modal */}
            <FineStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                fine={selectedFine}
                onSuccess={() => {
                    refetchFines();
                    refetchMetrics();
                }}
            />

            {/* 7. Download Fines Ledger Modal */}
            <FineExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentFilters={{
                    search: search.trim() || undefined,
                    status: status !== 'ALL' ? status : undefined,
                    policeStation: policeStation !== 'ALL' ? policeStation : undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }}
                totalRecords={total}
            />
        </div>
    );
}
