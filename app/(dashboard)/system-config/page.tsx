'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { USER_ROLES } from '@/lib/constants';
import { AlertsConfigCard } from '@/components/system-config/AlertsConfigCard';
import { DemeritConfigCard } from '@/components/system-config/DemeritConfigCard';
import { PaymentConfigCard } from '@/components/system-config/PaymentConfigCard';
import { SecurityConfigCard } from '@/components/system-config/SecurityConfigCard';
import { SystemHealthCard } from '@/components/system-config/SystemHealthCard';
import { ResetDemeritModal } from '@/components/system-config/ResetDemeritModal';
import { ManualRecoveryModal } from '@/components/system-config/ManualRecoveryModal';
import { Button } from '@/components/ui/button';
import {
    Settings2,
    Bell,
    Award,
    CreditCard,
    Lock,
    Activity,
    RefreshCw
} from 'lucide-react';

type ConfigTab = 'alerts' | 'demerit' | 'payment' | 'security' | 'health';

export default function SystemConfigPage() {
    const { user } = useAuth();
    const {
        config,
        health,
        loading,
        saving,
        fetchConfig,
        updateConfig,
        toggleRecovery,
        resetDemerit
    } = useSystemConfig();

    const [activeTab, setActiveTab] = useState<ConfigTab>('alerts');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

    const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
    const isAdminOfficer = user?.role === 'admin_officer';

    const handleConfirmReset = async () => {
        const ok = await resetDemerit();
        if (ok) {
            setIsResetModalOpen(false);
        }
    };

    const tabs: Array<{ id: ConfigTab; label: string; icon: React.ElementType }> = [
        { id: 'alerts', label: 'Alerts & Emergency', icon: Bell },
        { id: 'demerit', label: 'Driver Demerit Rules', icon: Award },
        { id: 'payment', label: 'Payment Rules', icon: CreditCard },
        { id: 'security', label: 'Security Policy', icon: Lock },
        { id: 'health', label: 'System Health', icon: Activity },
    ];

    return (
        <div className="space-y-6 pb-12 max-w-5xl">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <Settings2 className="h-8 w-8 text-blue-600" />
                        System Configuration
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage global parameters, emergency dispatch thresholds, demerit point recovery, and security policies
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchConfig}
                        disabled={loading}
                        className="text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Settings
                    </Button>
                </div>
            </div>

            {/* Tab Navigation Strip */}
            <div className="flex items-center gap-1 border-b pb-px overflow-x-auto bg-gray-50/50 p-1.5 rounded-xl border">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-white text-blue-700 shadow-sm border border-gray-200/80 font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Panels */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading system configurations...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tab 1: Alerts & Emergency */}
                    {activeTab === 'alerts' && (
                        <AlertsConfigCard
                            config={config}
                            onSave={updateConfig}
                            isSuperAdmin={isSuperAdmin}
                            saving={saving}
                        />
                    )}

                    {/* Tab 2: Driver Demerit Rules */}
                    {activeTab === 'demerit' && (
                        <DemeritConfigCard
                            config={config}
                            onSave={updateConfig}
                            onToggleRecovery={toggleRecovery}
                            onOpenResetModal={() => setIsResetModalOpen(true)}
                            onOpenManualRecoveryModal={() => setIsRecoveryModalOpen(true)}
                            isSuperAdmin={isSuperAdmin}
                            isAdminOfficer={isAdminOfficer}
                            saving={saving}
                        />
                    )}

                    {/* Tab 3: Payment Rules */}
                    {activeTab === 'payment' && (
                        <PaymentConfigCard
                            config={config}
                            onSave={updateConfig}
                            isSuperAdmin={isSuperAdmin}
                            saving={saving}
                        />
                    )}

                    {/* Tab 4: Security Policy */}
                    {activeTab === 'security' && (
                        <SecurityConfigCard
                            config={config}
                            onSave={updateConfig}
                            isSuperAdmin={isSuperAdmin}
                            saving={saving}
                        />
                    )}

                    {/* Tab 5: System Health */}
                    {activeTab === 'health' && (
                        <SystemHealthCard
                            health={health}
                            onRefresh={fetchConfig}
                            onOpenManualRecovery={() => setIsRecoveryModalOpen(true)}
                            isSuperAdmin={isSuperAdmin}
                            loading={loading}
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <ResetDemeritModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmReset}
                loading={saving}
            />

            <ManualRecoveryModal
                isOpen={isRecoveryModalOpen}
                onClose={() => setIsRecoveryModalOpen(false)}
                onSuccess={fetchConfig}
            />
        </div>
    );
}
