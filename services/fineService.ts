import api from '@/lib/api';
import {
    FineDTO,
    FineMetricsDTO,
    FineQueryDTO,
    CreateFineDTO,
    UpdateFineStatusDTO,
    FineListResponseDTO
} from '@/types/fine.types';

export class FineService {
    /**
     * Fetch paginated list of traffic fines with filters and sorting
     */
    static async getFines(query: FineQueryDTO = {}): Promise<FineListResponseDTO> {
        const response = await api.get<FineListResponseDTO>('/admin/fines', {
            params: query
        });
        return response.data;
    }

    /**
     * Get executive KPI summary metrics for traffic citations
     */
    static async getFineMetrics(): Promise<FineMetricsDTO> {
        const response = await api.get<{ success: boolean; data: FineMetricsDTO }>('/admin/fines/metrics');
        return response.data.data;
    }

    /**
     * Get deep citation enforcement record by ID
     */
    static async getFineById(id: string): Promise<FineDTO> {
        const response = await api.get<{ success: boolean; data: FineDTO }>(`/admin/fines/${id}`);
        return response.data.data;
    }

    /**
     * Issue manual court / admin citation
     */
    static async createFine(payload: CreateFineDTO): Promise<{ success: boolean; message: string; data: FineDTO }> {
        const response = await api.post<{ success: boolean; message: string; data: FineDTO }>('/admin/fines', payload);
        return response.data;
    }

    /**
     * Update fine status / resolve dispute
     */
    static async updateFineStatus(id: string, payload: UpdateFineStatusDTO): Promise<{ success: boolean; message: string; data: FineDTO }> {
        const response = await api.patch<{ success: boolean; message: string; data: FineDTO }>(`/admin/fines/${id}/status`, payload);
        return response.data;
    }

    /**
     * Download individual single fine receipt PDF
     */
    static async downloadReceiptPdf(fineId: string): Promise<Blob> {
        const response = await api.get(`/fines/${fineId}/pdf`, {
            responseType: 'blob'
        });
        return new Blob([response.data], { type: 'application/pdf' });
    }

    /**
     * Export filtered citations directory as CSV or PDF
     */
    static async exportFines(query: FineQueryDTO = {}, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
        const response = await api.get('/admin/fines/export', {
            params: { ...query, format },
            responseType: 'blob'
        });
        const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
        return new Blob([response.data], { type: contentType });
    }

    /**
     * Safe deletion of citation record
     */
    static async deleteFine(id: string): Promise<{ success: boolean; message: string }> {
        const response = await api.delete<{ success: boolean; message: string }>(`/admin/fines/${id}`);
        return response.data;
    }

    /**
     * Get all traffic offenses list
     */
    static async getOffenses(): Promise<any[]> {
        try {
            const response = await api.get('/admin/fines/offenses').catch(() => api.get('/fines/offenses'));
            const data = response.data?.data || response.data;
            if (Array.isArray(data)) {
                return data.map((o: any) => ({
                    ...o,
                    demeritPoints: o.demeritPoints ?? o.demeritValue ?? 0
                }));
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch offenses:', error);
            return [];
        }
    }

    /**
     * Get all police stations list from database
     */
    static async getStations(): Promise<Array<{ _id: string; name: string; stationCode?: string; district?: string }>> {
        try {
            const response = await api.get('/admin/stations').catch(() => api.get('/stations'));
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Failed to fetch stations:', error);
            return [];
        }
    }
}

