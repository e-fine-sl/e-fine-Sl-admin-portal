// services/systemConfigService.ts
import api from '@/lib/api';
import {
    SystemConfigResponse,
    UpdateSystemConfigDTO,
    ManualRecoveryResult
} from '@/types/systemConfig.types';

export class SystemConfigService {
    /**
     * Get system configuration and live service diagnostics
     */
    static async getConfig(): Promise<SystemConfigResponse> {
        const response = await api.get<SystemConfigResponse>('/admin/system-config');
        return response.data;
    }

    /**
     * Update system configuration parameters
     */
    static async updateConfig(dto: UpdateSystemConfigDTO): Promise<SystemConfigResponse> {
        const response = await api.put<SystemConfigResponse>('/admin/system-config', dto);
        return response.data;
    }

    /**
     * Toggle monthly recovery master switch
     */
    static async toggleRecovery(): Promise<{ success: boolean; message: string; data: { recoveryEnabled: boolean } }> {
        const response = await api.patch<{ success: boolean; message: string; data: { recoveryEnabled: boolean } }>(
            '/admin/system-config/recovery-toggle'
        );
        return response.data;
    }

    /**
     * Trigger manual demerit points recovery cycle on demand
     */
    static async triggerManualRecovery(): Promise<{ success: boolean; message: string; data: ManualRecoveryResult }> {
        const response = await api.post<{ success: boolean; message: string; data: ManualRecoveryResult }>(
            '/admin/system-config/trigger-recovery'
        );
        return response.data;
    }

    /**
     * Reset demerit configuration to official factory defaults
     */
    static async resetDemeritConfig(): Promise<SystemConfigResponse> {
        const response = await api.delete<SystemConfigResponse>('/admin/system-config/demerit');
        return response.data;
    }
}
