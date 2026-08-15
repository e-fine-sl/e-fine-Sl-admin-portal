'use client';

import React, { useState } from 'react';
import { useDrivers } from '@/hooks/useDrivers';
import { DriverMetricsCards } from '@/components/drivers/DriverMetricsCards';
import { DriverFilters } from '@/components/drivers/DriverFilters';
import { DriverTable } from '@/components/drivers/DriverTable';
import { DriverDetailModal } from '@/components/drivers/DriverDetailModal';
import { DriverCreateModal } from '@/components/drivers/DriverCreateModal';
import { DriverEditModal } from '@/components/drivers/DriverEditModal';
import { DriverSuspendModal } from '@/components/drivers/DriverSuspendModal';
import { DriverAdjustDemeritModal } from '@/components/drivers/DriverAdjustDemeritModal';
import { DriverResetPasswordModal } from '@/components/drivers/DriverResetPasswordModal';
import { DriverExportModal } from '@/components/drivers/DriverExportModal';
import { DriverService } from '@/services/driverService';
import { DriverDTO } from '@/types/driver.types';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DriversPage() {
    const { user } = useAuth();
    const canCreate = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN_OFFICER;

    const {
        drivers,
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
        demeritLevel,
        setDemeritLevel,
        kycStatus,
        setKycStatus,
        sortBy,
        sortOrder,
        toggleSort,
        refetchDrivers,
        refetchMetrics,
        resetFilters
    } = useDrivers();

    // Modals State
    const [selectedDriver, setSelectedDriver] = useState<DriverDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isAdjustDemeritOpen, setIsAdjustDemeritOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Modal Handlers
    const handleOpenDetail = (driver: DriverDTO) => {
        setSelectedDriver(driver);
        setIsDetailModalOpen(true);
    };

    const handleOpenEdit = (driver: DriverDTO) => {
        setSelectedDriver(driver);
        setIsEditModalOpen(true);
    };

    const handleOpenSuspend = (driver: DriverDTO) => {
        setSelectedDriver(driver);
        setIsSuspendModalOpen(true);
    };

    const handleOpenAdjustDemerit = (driver: DriverDTO) => {
        setSelectedDriver(driver);
        setIsAdjustDemeritOpen(true);
    };

    const handleOpenResetPassword = (driver: DriverDTO) => {
        setSelectedDriver(driver);
        setIsResetPasswordOpen(true);
    };

    // License Activation
    const handleActivateLicense = async (driver: DriverDTO) => {
        if (!confirm(`Are you sure you want to restore driving license for "${driver.name}" (License: ${driver.licenseNumber}) with full 24 demerit points?`)) {
            return;
        }

        try {
            const res = await DriverService.activateDriver(driver._id);
            toast.success(res.message || 'Driver license activated and restored to 24 points');
            refetchDrivers();
            refetchMetrics();
        } catch (error: any) {
            console.error('Activation failed:', error);
            toast.error(error.response?.data?.message || 'Failed to activate driver license');
        }
    };

    // Safe Delete Driver
    const handleDeleteDriver = async (driver: DriverDTO) => {
        if (!confirm(`Are you sure you want to delete driver record "${driver.name}" (License: ${driver.licenseNumber})?`)) {
            return;
        }

        try {
            const res = await DriverService.deleteDriver(driver._id);
            if (res.isSoftDeleted) {
                toast.warning(res.message);
            } else {
                toast.success(res.message || 'Driver record removed');
            }
            refetchDrivers();
            refetchMetrics();
        } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete driver');
        }
    };

    const handleRefreshAll = () => {
        refetchDrivers();
        refetchMetrics();
        toast.info('Driver directory refreshed');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Drivers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage licensed motorists, demerit points registry, KYC verification, and driving suspensions
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
                        Refresh Directory
                    </Button>
                </div>
            </div>

            {/* 1. Executive Driver KPI Metrics */}
            <DriverMetricsCards metrics={metrics} loading={metricsLoading} />

            {/* 2. Multi-Dimensional Filter Bar */}
            <DriverFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                demeritLevel={demeritLevel}
                onDemeritLevelChange={setDemeritLevel}
                kycStatus={kycStatus}
                onKycStatusChange={setKycStatus}
                onResetFilters={resetFilters}
                onOpenExport={() => setIsExportModalOpen(true)}
                onOpenCreate={() => setIsCreateModalOpen(true)}
                canCreate={canCreate}
                totalResults={total}
            />

            {/* 3. Driver Directory Table */}
            <DriverTable
                drivers={drivers}
                loading={loading}
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={toggleSort}
                onSelectDriver={handleOpenDetail}
                onEditDriver={handleOpenEdit}
                onSuspendDriver={handleOpenSuspend}
                onActivateDriver={handleActivateLicense}
                onAdjustDemerit={handleOpenAdjustDemerit}
                onResetPassword={handleOpenResetPassword}
                onDeleteDriver={handleDeleteDriver}
            />

            {/* 4. Driver Dossier Modal */}
            <DriverDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                driver={selectedDriver}
                onEdit={handleOpenEdit}
            />

            {/* 5. Create Driver Modal */}
            <DriverCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetchDrivers();
                    refetchMetrics();
                }}
            />

            {/* 6. Edit Driver Modal */}
            <DriverEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                driver={selectedDriver}
                onSuccess={() => {
                    refetchDrivers();
                    refetchMetrics();
                }}
            />

            {/* 7. License Suspension Modal */}
            <DriverSuspendModal
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                driver={selectedDriver}
                onSuccess={() => {
                    refetchDrivers();
                    refetchMetrics();
                }}
            />

            {/* 8. Demerit Points Adjustment Modal */}
            <DriverAdjustDemeritModal
                isOpen={isAdjustDemeritOpen}
                onClose={() => setIsAdjustDemeritOpen(false)}
                driver={selectedDriver}
                onSuccess={() => {
                    refetchDrivers();
                    refetchMetrics();
                }}
            />

            {/* 9. Reset Mobile Password Modal */}
            <DriverResetPasswordModal
                isOpen={isResetPasswordOpen}
                onClose={() => setIsResetPasswordOpen(false)}
                driver={selectedDriver}
                onSuccess={() => {
                    refetchDrivers();
                }}
            />

            {/* 10. Download Driver List Modal */}
            <DriverExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentFilters={{
                    search: search.trim() || undefined,
                    status: status !== 'ALL' ? status : undefined,
                    demeritLevel: demeritLevel !== 'ALL' ? demeritLevel : undefined,
                    kycStatus: kycStatus !== 'ALL' ? kycStatus : undefined
                }}
                totalRecords={total}
            />
        </div>
    );
}
