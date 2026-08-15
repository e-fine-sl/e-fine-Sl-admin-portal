'use client';

import React, { useState } from 'react';
import { useOfficers } from '@/hooks/useOfficers';
import { OfficerMetricsCards } from '@/components/officers/OfficerMetricsCards';
import { OfficerFilters } from '@/components/officers/OfficerFilters';
import { OfficerTable } from '@/components/officers/OfficerTable';
import { OfficerDetailModal } from '@/components/officers/OfficerDetailModal';
import { OfficerCreateModal } from '@/components/officers/OfficerCreateModal';
import { OfficerEditModal } from '@/components/officers/OfficerEditModal';
import { OfficerTransferModal } from '@/components/officers/OfficerTransferModal';
import { OfficerResetCredentialsModal } from '@/components/officers/OfficerResetCredentialsModal';
import { OfficerExportModal } from '@/components/officers/OfficerExportModal';
import { OfficerService } from '@/services/officerService';
import { OfficerDTO } from '@/types/officer.types';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfficersPage() {
    const { user } = useAuth();
    const canCreate = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN_OFFICER;

    const {
        officers,
        metrics,
        stations,
        loading,
        metricsLoading,
        page,
        setPage,
        limit,
        total,
        pages,
        search,
        setSearch,
        station,
        setStation,
        position,
        setPosition,
        status,
        setStatus,
        dutyState,
        setDutyState,
        sortBy,
        sortOrder,
        toggleSort,
        refetchOfficers,
        refetchMetrics,
        resetFilters
    } = useOfficers();

    // Modals State
    const [selectedOfficer, setSelectedOfficer] = useState<OfficerDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Modal Triggers
    const handleOpenDetail = (officer: OfficerDTO) => {
        setSelectedOfficer(officer);
        setIsDetailModalOpen(true);
    };

    const handleOpenEdit = (officer: OfficerDTO) => {
        setSelectedOfficer(officer);
        setIsEditModalOpen(true);
    };

    const handleOpenTransfer = (officer: OfficerDTO) => {
        setSelectedOfficer(officer);
        setIsTransferModalOpen(true);
    };

    const handleOpenReset = (officer: OfficerDTO) => {
        setSelectedOfficer(officer);
        setIsResetModalOpen(true);
    };

    // Toggle Active/Suspended Status
    const handleToggleStatus = async (officer: OfficerDTO) => {
        const newStatus = !officer.isActive;
        const actionLabel = newStatus ? 'activate' : 'suspend';
        
        if (!confirm(`Are you sure you want to ${actionLabel} account for Officer ${officer.name} (Badge: ${officer.badgeNumber})?`)) {
            return;
        }

        try {
            const res = await OfficerService.toggleStatus({
                officerId: officer._id,
                isActive: newStatus,
                reason: newStatus ? 'Account reactivated by administrator' : 'Suspended by admin command'
            });

            toast.success(res.message || `Officer status updated successfully`);
            refetchOfficers();
            refetchMetrics();
        } catch (error: any) {
            console.error('Failed to toggle officer status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    // Safe Delete Officer
    const handleDeleteOfficer = async (officer: OfficerDTO) => {
        if (!confirm(`Are you sure you want to delete Officer "${officer.name}" (Badge: ${officer.badgeNumber})?`)) {
            return;
        }

        try {
            const res = await OfficerService.deleteOfficer(officer._id);
            if (res.isSoftDeleted) {
                toast.warning(res.message);
            } else {
                toast.success(res.message || 'Officer removed successfully');
            }
            refetchOfficers();
            refetchMetrics();
        } catch (error: any) {
            console.error('Failed to delete officer:', error);
            toast.error(error.response?.data?.message || 'Failed to delete officer');
        }
    };

    const handleRefreshAll = () => {
        refetchOfficers();
        refetchMetrics();
        toast.info('Officer directory refreshed');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Police Officers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage traffic enforcement workforce, station assignments, and duty rosters
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
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* 1. Workforce KPI Metrics */}
            <OfficerMetricsCards metrics={metrics} loading={metricsLoading} />

            {/* 2. Multi-Dimensional Filters */}
            <OfficerFilters
                search={search}
                onSearchChange={setSearch}
                station={station}
                onStationChange={setStation}
                position={position}
                onPositionChange={setPosition}
                status={status}
                onStatusChange={setStatus}
                dutyState={dutyState}
                onDutyStateChange={setDutyState}
                stations={stations}
                onResetFilters={resetFilters}
                onOpenExport={() => setIsExportModalOpen(true)}
                onOpenCreate={() => setIsCreateModalOpen(true)}
                canCreate={canCreate}
                totalResults={total}
            />

            {/* 3. Officer Roster Table */}
            <OfficerTable
                officers={officers}
                loading={loading}
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={toggleSort}
                onSelectOfficer={handleOpenDetail}
                onEditOfficer={handleOpenEdit}
                onTransferOfficer={handleOpenTransfer}
                onResetCredentials={handleOpenReset}
                onToggleStatus={handleToggleStatus}
                onDeleteOfficer={handleDeleteOfficer}
            />

            {/* 4. Officer Dossier Modal */}
            <OfficerDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                officer={selectedOfficer}
                onEdit={handleOpenEdit}
                onTransfer={handleOpenTransfer}
            />

            {/* 5. Create Officer Modal */}
            <OfficerCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                stations={stations}
                onSuccess={() => {
                    refetchOfficers();
                    refetchMetrics();
                }}
            />

            {/* 6. Edit Officer Modal */}
            <OfficerEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                officer={selectedOfficer}
                stations={stations}
                onSuccess={() => {
                    refetchOfficers();
                    refetchMetrics();
                }}
            />

            {/* 7. Station Transfer Modal */}
            <OfficerTransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                officer={selectedOfficer}
                stations={stations}
                onSuccess={() => {
                    refetchOfficers();
                    refetchMetrics();
                }}
            />

            {/* 8. Reset Credentials Modal */}
            <OfficerResetCredentialsModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                officer={selectedOfficer}
                onSuccess={() => {
                    refetchOfficers();
                }}
            />

            {/* 9. Export Modal */}
            <OfficerExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentFilters={{
                    search: search.trim() || undefined,
                    station: station !== 'ALL' ? station : undefined,
                    position: position !== 'ALL' ? position : undefined,
                    status: status !== 'ALL' ? status : undefined,
                    dutyState: dutyState !== 'ALL' ? dutyState : undefined
                }}
                totalRecords={total}
            />
        </div>
    );
}
