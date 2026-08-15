// types/systemConfig.types.ts

export interface SystemConfigData {
    _id?: string;
    // Alert & Emergency
    accidentNotificationRadiusKm: number;
    officerLogoutGracePeriodMinutes: number;
    sosBroadcastRadiusKm: number;
    emergencyEmailAlerts: boolean;
    emergencyPushAlerts: boolean;

    // Demerit Points
    defaultDemeritPoints: number;
    monthlyRecoveryPoints: number;
    recoveryPeriodMonths: number;
    cleanRecordDays: number;
    recoveryEnabled: boolean;
    lastRecoveryRunAt: string | null;

    // Payment Policy
    finePaymentGracePeriodDays: number;
    minFineAmount: number;
    maxFineAmount: number;

    // Security Policy
    adminSessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    enforceAdmin2FA: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export interface SystemHealthStatus {
    database: 'HEALTHY' | 'DISCONNECTED';
    databaseLatencyMs: number;
    serverUptimeSeconds: number;
    serverTime: string;
    fcmConfigured: boolean;
    mailConfigured: boolean;
}

export interface SystemConfigResponse {
    success: boolean;
    data: SystemConfigData;
    health?: SystemHealthStatus;
    message?: string;
}

export interface UpdateSystemConfigDTO {
    // Alert & Emergency
    accidentNotificationRadiusKm?: number;
    officerLogoutGracePeriodMinutes?: number;
    sosBroadcastRadiusKm?: number;
    emergencyEmailAlerts?: boolean;
    emergencyPushAlerts?: boolean;

    // Demerit
    defaultDemeritPoints?: number;
    monthlyRecoveryPoints?: number;
    recoveryPeriodMonths?: number;
    cleanRecordDays?: number;

    // Payment
    finePaymentGracePeriodDays?: number;
    minFineAmount?: number;
    maxFineAmount?: number;

    // Security
    adminSessionTimeoutMinutes?: number;
    maxLoginAttempts?: number;
    enforceAdmin2FA?: boolean;
}

export interface ManualRecoveryResult {
    updatedCount: number;
    eligibleCount: number;
    recoveryPoints: number;
    ceiling: number;
    executedAt: string;
}
