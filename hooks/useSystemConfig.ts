// hooks/useSystemConfig.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SystemConfigService } from '@/services/systemConfigService';
import {
    SystemConfigData,
    SystemHealthStatus,
    UpdateSystemConfigDTO
} from '@/types/systemConfig.types';
import { toast } from 'sonner';

const DEFAULTS: SystemConfigData = {
    accidentNotificationRadiusKm: 10,
    officerLogoutGracePeriodMinutes: 20,
    sosBroadcastRadiusKm: 15,
    emergencyEmailAlerts: true,
    emergencyPushAlerts: true,
    defaultDemeritPoints: 24,
    monthlyRecoveryPoints: 2,
    recoveryPeriodMonths: 1,
    cleanRecordDays: 30,
    recoveryEnabled: true,
    lastRecoveryRunAt: null,
    finePaymentGracePeriodDays: 14,
    minFineAmount: 500,
    maxFineAmount: 100000,
    adminSessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    enforceAdmin2FA: false
};

export const useSystemConfig = () => {
    const [config, setConfig] = useState<SystemConfigData>(DEFAULTS);
    const [health, setHealth] = useState<SystemHealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const response = await SystemConfigService.getConfig();
            if (response.data) {
                setConfig({
                    ...DEFAULTS,
                    ...response.data
                });
            }
            if (response.health) {
                setHealth(response.health);
            }
        } catch (error: any) {
            console.error('Failed to load system config:', error);
            toast.error(error.response?.data?.message || 'Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const updateConfig = async (dto: UpdateSystemConfigDTO, domainLabel = 'Settings') => {
        try {
            setSaving(true);
            const response = await SystemConfigService.updateConfig(dto);
            if (response.data) {
                setConfig((prev) => ({ ...prev, ...response.data }));
            }
            toast.success(`${domainLabel} saved successfully`);
            return true;
        } catch (error: any) {
            console.error(`Failed to update ${domainLabel}:`, error);
            toast.error(error.response?.data?.message || `Failed to save ${domainLabel}`);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const toggleRecovery = async () => {
        try {
            setSaving(true);
            const response = await SystemConfigService.toggleRecovery();
            const newState = response.data?.recoveryEnabled;
            setConfig((prev) => ({ ...prev, recoveryEnabled: newState }));
            toast.success(newState ? 'Monthly recovery has been enabled' : 'Monthly recovery has been disabled');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to toggle recovery status');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const resetDemerit = async () => {
        try {
            setSaving(true);
            const response = await SystemConfigService.resetDemeritConfig();
            if (response.data) {
                setConfig((prev) => ({ ...prev, ...response.data }));
            }
            toast.success('Demerit configuration reset to factory defaults');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset demerit defaults');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        config,
        health,
        loading,
        saving,
        fetchConfig,
        updateConfig,
        toggleRecovery,
        resetDemerit
    };
};
