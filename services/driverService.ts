import api from '@/lib/api';
import {
    DriverDTO,
    DriverQueryDTO,
    DriverMetricsDTO,
    DriverDetailResponseDTO,
    CreateDriverDTO,
    UpdateDriverDTO,
    SuspendDriverDTO,
    AdjustDemeritDTO,
    ResetDriverCredentialsDTO,
    DriverListResponseDTO,
    DmtVerificationResultDTO
} from '@/types/driver.types';

/**
 * Driver Service Layer
 * Clean encapsulation of driver directory, metrics, KYC inspection, demerit adjustments, and license actions.
 */
export const DriverService = {
    /**
     * Get paginated and filtered driver directory
     */
    async getDrivers(params: DriverQueryDTO): Promise<DriverListResponseDTO> {
        const response = await api.get<DriverListResponseDTO>('/admin/drivers', { params });
        return response.data;
    },

    /**
     * Get executive driver registry KPI metrics
     */
    async getDriverMetrics(): Promise<DriverMetricsDTO> {
        const response = await api.get<{ success: boolean; data: DriverMetricsDTO }>('/admin/drivers/metrics');
        return response.data.data;
    },

    /**
     * Get deep driver dossier with violations ledger
     */
    async getDriverById(id: string): Promise<DriverDetailResponseDTO> {
        const response = await api.get<DriverDetailResponseDTO>(`/admin/drivers/${id}`);
        return response.data;
    },

    /**
     * Register a new driver (In-person desk registration)
     */
    async createDriver(dto: CreateDriverDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await api.post('/admin/drivers', dto);
        return response.data;
    },

    /**
     * Update driver demographic & contact details
     */
    async updateDriver(id: string, dto: UpdateDriverDTO): Promise<{ success: boolean; message: string; data?: DriverDTO }> {
        const response = await api.put(`/admin/drivers/${id}`, dto);
        return response.data;
    },

    /**
     * Suspend driver license with official reason note & notification dispatch
     */
    async suspendDriver(dto: SuspendDriverDTO): Promise<{ success: boolean; message: string; driver?: any }> {
        const response = await api.put(`/admin/drivers/${dto.driverId}/suspend`, {
            reason: dto.reason
        });
        return response.data;
    },

    /**
     * Activate driver license and restore default 24 demerit points
     */
    async activateDriver(driverId: string): Promise<{ success: boolean; message: string; driver?: any }> {
        const response = await api.put(`/admin/drivers/${driverId}/activate`);
        return response.data;
    },

    /**
     * Manually adjust demerit points (Court order / Administrative review)
     */
    async adjustDemerit(dto: AdjustDemeritDTO): Promise<{ success: boolean; message: string; driver?: any }> {
        const response = await api.post(`/admin/drivers/${dto.driverId}/adjust-demerit`, {
            newPoints: dto.newPoints,
            reason: dto.reason
        });
        return response.data;
    },

    /**
     * Reset driver portal & mobile terminal password
     */
    async resetCredentials(dto: ResetDriverCredentialsDTO): Promise<{ success: boolean; message: string }> {
        const response = await api.post(`/admin/drivers/${dto.driverId}/reset-credentials`, {
            newPassword: dto.newPassword
        });
        return response.data;
    },

    /**
     * Export filtered driver directory to CSV or PDF
     */
    async exportDrivers(params: DriverQueryDTO, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
        const response = await api.get('/admin/drivers/export', {
            params: { ...params, format },
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Safe delete driver record (checks against historical citations)
     */
    async deleteDriver(id: string): Promise<{ success: boolean; message: string; isSoftDeleted?: boolean }> {
        const response = await api.delete(`/admin/drivers/${id}`);
        return response.data;
    },

    /**
     * Real-time uniqueness check for NIC, License, Email, Phone
     */
    async checkFieldExists(field: string, value: string, role = 'driver'): Promise<{ exists: boolean; message: string }> {
        const response = await api.get<{ success: boolean; exists: boolean; message: string }>('/auth/check-exists', {
            params: { field, value, role }
        });
        return response.data;
    },

    /**
     * Real-time DMT (Department of Motor Traffic) legal driving license verification
     */
    async verifyLicenseWithDMT(licenseNumber: string, nic: string): Promise<DmtVerificationResultDTO> {
        const response = await api.post<DmtVerificationResultDTO>('/auth/verify-dmt', {
            licenseNumber,
            nic
        });
        return response.data;
    }
};
