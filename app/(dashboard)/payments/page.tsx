'use client';

import React, { useState } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { PaymentMetricsCards } from '@/components/payments/PaymentMetricsCards';
import { PaymentFilters } from '@/components/payments/PaymentFilters';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { PaymentDetailModal } from '@/components/payments/PaymentDetailModal';
import { PaymentExportModal } from '@/components/payments/PaymentExportModal';
import { PaymentRefundModal } from '@/components/payments/PaymentRefundModal';
import { PaymentReconcileModal } from '@/components/payments/PaymentReconcileModal';
import { PaymentService } from '@/services/paymentService';
import { PaymentRecord } from '@/types/payment.types';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
    const {
        payments,
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
        province,
        setProvince,
        datePreset,
        applyDatePreset,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sortBy,
        sortOrder,
        toggleSort,
        refetchPayments,
        refetchMetrics,
        resetFilters
    } = usePayments();

    // Modal Active States
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);

    // Download Official PDF Receipt
    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            toast.loading('Generating official e-Fine receipt...');
            const blob = await PaymentService.downloadReceipt(paymentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `e-Fine-Receipt-${paymentId.slice(-8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.dismiss();
            toast.success('e-Fine Receipt downloaded successfully');
        } catch (error) {
            toast.dismiss();
            console.error('Failed to download payment receipt:', error);
            toast.error('Failed to generate e-Fine Receipt PDF');
        }
    };

    // Modal Triggers
    const handleOpenDetail = (payment: PaymentRecord) => {
        setSelectedPayment(payment);
        setIsDetailModalOpen(true);
    };

    const handleOpenReconcile = (payment: PaymentRecord) => {
        setSelectedPayment(payment);
        setIsReconcileModalOpen(true);
    };

    const handleOpenRefund = (payment: PaymentRecord) => {
        setSelectedPayment(payment);
        setIsRefundModalOpen(true);
    };

    const handleRefreshAll = () => {
        refetchPayments();
        refetchMetrics();
        toast.info('Ledger & metrics refreshed');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments & Revenue</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track, reconcile, and audit national traffic fine collections & treasury settlements
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

            {/* 1. KPI Financial Overview */}
            <PaymentMetricsCards metrics={metrics} loading={metricsLoading} />

            {/* 2. Multi-Dimensional Filters */}
            <PaymentFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                province={province}
                onProvinceChange={setProvince}
                datePreset={datePreset}
                onDatePresetChange={applyDatePreset}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                onResetFilters={resetFilters}
                onOpenExport={() => setIsExportModalOpen(true)}
                totalResults={total}
            />

            {/* 3. Data Table */}
            <PaymentTable
                payments={payments}
                loading={loading}
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={toggleSort}
                onSelectPayment={handleOpenDetail}
                onDownloadReceipt={handleDownloadReceipt}
                onOpenReconcile={handleOpenReconcile}
                onOpenRefund={handleOpenRefund}
            />

            {/* 4. Deep Inspection Modal */}
            <PaymentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                payment={selectedPayment}
                onDownloadReceipt={handleDownloadReceipt}
                onOpenReconcile={handleOpenReconcile}
            />

            {/* 5. Treasury Export Modal */}
            <PaymentExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentFilters={{
                    search: search.trim() || undefined,
                    status: status !== 'ALL' ? status : undefined,
                    province: province !== 'ALL' ? province : undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }}
                totalRecords={total}
            />

            {/* 6. PayHere Gateway Reconciliation Modal */}
            <PaymentReconcileModal
                isOpen={isReconcileModalOpen}
                onClose={() => setIsReconcileModalOpen(false)}
                payment={selectedPayment}
                onVerifiedSuccess={() => {
                    refetchPayments();
                    refetchMetrics();
                }}
            />

            {/* 7. Super Admin Refund Modal */}
            <PaymentRefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                payment={selectedPayment}
                onRefundSuccess={() => {
                    refetchPayments();
                    refetchMetrics();
                }}
            />
        </div>
    );
}
