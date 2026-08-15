import api from '@/lib/api';
import {
    OfficerDTO,
    OfficerQueryDTO,
    OfficerMetricsDTO,
    OfficerDetailDTO,
    CreateOfficerDTO,
    UpdateOfficerDTO,
    TransferStationDTO,
    ResetOfficerCredentialsDTO,
    OfficerStatusToggleDTO,
    OfficerListResponseDTO
} from '@/types/officer.types';

/**
 * Police Officer Service
 * Clean service layer encapsulating all workforce management, status toggles, transfers, and exports.
 */
export const OfficerService = {
    /**
     * Get paginated & filtered officer directory
     */
    async getOfficers(params: OfficerQueryDTO): Promise<OfficerListResponseDTO> {
        const response = await api.get<OfficerListResponseDTO>('/admin/officers', { params });
        return response.data;
    },

    /**
     * Get workforce KPI metrics
     */
    async getOfficerMetrics(): Promise<OfficerMetricsDTO> {
        const response = await api.get<{ success: boolean; data: OfficerMetricsDTO }>('/admin/officers/metrics');
        return response.data.data;
    },

    /**
     * Get deep officer profile dossier with citations history
     */
    async getOfficerById(id: string): Promise<OfficerDetailDTO> {
        const response = await api.get<{ success: boolean; data: OfficerDetailDTO }>(`/admin/officers/${id}`);
        return response.data.data;
    },

    /**
     * Register a new police officer
     */
    async createOfficer(dto: CreateOfficerDTO): Promise<{ success: boolean; message: string; data?: OfficerDTO }> {
        const response = await api.post('/admin/officers', dto);
        return response.data;
    },

    /**
     * Update officer particulars
     */
    async updateOfficer(id: string, dto: UpdateOfficerDTO): Promise<{ success: boolean; message: string; data?: OfficerDTO }> {
        const response = await api.put(`/admin/officers/${id}`, dto);
        return response.data;
    },

    /**
     * Toggle officer account status (Active vs Suspended)
     */
    async toggleStatus(dto: OfficerStatusToggleDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await api.patch(`/admin/officers/${dto.officerId}/status`, {
            isActive: dto.isActive,
            reason: dto.reason
        });
        return response.data;
    },

    /**
     * Execute police station transfer
     */
    async transferStation(dto: TransferStationDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await api.post(`/admin/officers/${dto.officerId}/transfer`, {
            targetStation: dto.targetStation,
            transferReason: dto.transferReason,
            effectiveDate: dto.effectiveDate
        });
        return response.data;
    },

    /**
     * Admin-assisted password/PIN reset
     */
    async resetCredentials(dto: ResetOfficerCredentialsDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await api.post(`/admin/officers/${dto.officerId}/reset-credentials`, {
            newPassword: dto.newPassword
        });
        return response.data;
    },

    /**
     * Export officer roster to CSV or PDF
     */
    async exportOfficers(params: OfficerQueryDTO, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
        const response = await api.get('/admin/officers/export', {
            params: { ...params, format },
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Safe delete officer record
     */
    async deleteOfficer(id: string): Promise<{ success: boolean; message: string; isSoftDeleted?: boolean }> {
        const response = await api.delete(`/admin/officers/${id}`);
        return response.data;
    }
};
