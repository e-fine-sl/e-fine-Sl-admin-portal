// ─────────────────────────────────────────────────────────────
// types/payment.types.ts
// Enterprise DTOs and Data Contracts for Payments Module
// ─────────────────────────────────────────────────────────────

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'REFUNDED' | 'DISPUTED';

export type PaymentMethod = 
    | 'PAYHERE_GATEWAY' 
    | 'VISA_MASTER_CARD' 
    | 'EZ_CASH' 
    | 'GENIE' 
    | 'BANK_TRANSFER' 
    | 'OVER_THE_COUNTER';

export interface PaymentOffenseInfo {
    _id: string;
    offenseName: string;
    amount?: number;
    sectionOfAct?: string;
    demeritValue?: number;
}

export interface PaymentDriverInfo {
    name: string;
    nic: string;
    email?: string;
    phone?: string;
    licenseStatus?: 'ACTIVE' | 'SUSPENDED';
    demeritPoints?: number;
    vehicleClasses?: Array<{ category: string; issueDate: string; expiryDate: string }>;
}

export interface PaymentTransactionLog {
    _id: string;
    orderId: string;
    gatewayPaymentId: string;
    merchantId: string;
    amount: number;
    currency: string;
    statusCode: string;
    statusMessage?: string;
    paymentMethod?: string;
    cardHolderName?: string;
    cardNoMasked?: string;
    md5sig?: string;
    rawPayload?: any;
    processedAt: string;
    isVerified: boolean;
}

export interface PaymentRecord {
    _id: string;
    licenseNumber: string;
    vehicleNumber: string;
    offenseId: PaymentOffenseInfo | string;
    offenseName: string;
    amount: number;
    place: string;
    province?: string;
    district?: string;
    policeStation?: string;
    policeOfficerId: string;
    status: PaymentStatus;
    paymentId?: string;           // PayHere Payment ID
    paymentMethod?: PaymentMethod;
    gatewayFee?: number;
    netAmount?: number;
    gatewayPaymentId?: string;
    paidAt?: string;              // ISO Date String
    date: string;                 // Issuance Date
    demeritPoints: number;
    disputeReason?: string;
    refundedAt?: string;
    refundedBy?: string;
    refundTreasuryRef?: string;
    paymentNotes?: string;
    createdAt: string;
    updatedAt: string;
    // Populated fields from deep inspection
    driver?: PaymentDriverInfo | null;
    transactionLog?: PaymentTransactionLog | null;
}

export interface PaymentQueryDTO {
    page?: number;
    limit?: number;
    search?: string;
    status?: PaymentStatus | 'ALL';
    paymentMethod?: PaymentMethod | 'ALL';
    province?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: 'paidAt' | 'amount' | 'licenseNumber' | 'date';
    sortOrder?: 'asc' | 'desc';
}

export interface PaymentMetricsDTO {
    totalRevenue: number;
    totalPaymentsCount: number;
    todayRevenue: number;
    todayPaymentsCount: number;
    thisMonthRevenue: number;
    thisMonthPaymentsCount: number;
    unpaidRevenue?: number;
    unpaidPaymentsCount?: number;
    averagePayment: number;
    collectionEfficiencyRate: number; // e.g. 84.5%
    revenueByProvince: Array<{ province: string; amount: number; count: number }>;
}

export interface PaymentListResponseDTO {
    success: boolean;
    data: PaymentRecord[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    count: number;
}

export interface GatewayVerificationDTO {
    success: boolean;
    isVerified: boolean;
    gatewayStatus: string;
    payherePaymentId: string;
    payhereAmount: number;
    payhereCurrency: string;
    cardHolderName?: string;
    cardNoMasked?: string;
    settlementDate?: string;
    message: string;
}

export interface ProcessRefundDTO {
    paymentId: string;
    reason: string;
    treasuryReference?: string;
    restoreDemeritPoints: boolean;
}
