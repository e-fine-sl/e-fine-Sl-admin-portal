import api from '@/lib/api';
import { 
    PaymentQueryDTO, 
    PaymentListResponseDTO, 
    PaymentMetricsDTO, 
    GatewayVerificationDTO, 
    ProcessRefundDTO,
    PaymentRecord 
} from '@/types/payment.types';

/**
 * Payment Service
 * Clean service layer encapsulating all payment, reconciliation, refund, and export API interactions.
 */
export const PaymentService = {
    /**
     * Fetch paginated and filtered payments
     */
    async getPayments(params: PaymentQueryDTO = {}): Promise<PaymentListResponseDTO> {
        const response = await api.get<PaymentListResponseDTO>('/admin/payments', { params });
        return response.data;
    },

    /**
     * Fetch executive financial overview KPIs (MongoDB Aggregation)
     */
    async getPaymentMetrics(): Promise<PaymentMetricsDTO> {
        const response = await api.get<{ success: boolean; data: PaymentMetricsDTO }>('/admin/payments/metrics');
        return response.data.data;
    },

    /**
     * Fetch single payment details by ID with populated driver & officer info
     */
    async getPaymentById(id: string): Promise<PaymentRecord> {
        const response = await api.get<{ success: boolean; data: PaymentRecord }>(`/admin/payments/${id}`);
        return response.data.data;
    },

    /**
     * Download official PDF payment receipt for fine
     */
    async downloadReceipt(paymentId: string): Promise<Blob> {
        const response = await api.get(`/fines/${paymentId}/pdf`, { responseType: 'blob' });
        return response.data;
    },

    /**
     * Reconcile payment directly with PayHere Gateway API
     */
    async verifyWithGateway(paymentId: string): Promise<GatewayVerificationDTO> {
        const response = await api.post<GatewayVerificationDTO>(`/admin/payments/${paymentId}/verify-gateway`);
        return response.data;
    },

    /**
     * Process refund / dispute status (Super Admin)
     */
    async processRefund(dto: ProcessRefundDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await api.post('/admin/payments/refund', dto);
        return response.data;
    },

    /**
     * Export payments to CSV / JSON format
     */
    async exportPayments(params: PaymentQueryDTO, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
        const response = await api.get('/admin/payments/export', {
            params: { ...params, format },
            responseType: 'blob'
        });
        return response.data;
    }
};
