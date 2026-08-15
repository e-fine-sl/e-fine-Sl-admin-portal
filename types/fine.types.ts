export type FineStatus = 'PAID' | 'UNPAID' | 'DISPUTED' | 'REFUNDED' | 'PENDING';

export interface FineOffenseDTO {
    _id: string;
    offenseName: string;
    sectionOfAct?: string;
    amount?: number;
    demeritPoints?: number;
    category?: string;
    description?: string;
}

export interface FineDriverDetailsDTO {
    id: string;
    name: string;
    nic: string;
    phone: string;
    email: string;
    demeritPoints: number;
    demeritLevel: string;
    licenseStatus: string;
    profileImage?: string;
}

export interface FineOfficerDetailsDTO {
    id: string;
    name: string;
    badgeNumber: string;
    policeStation: string;
    position?: string;
    phone?: string;
    email?: string;
}

export interface FineDTO {
    _id: string;
    licenseNumber: string;
    vehicleNumber: string;
    offenseId?: FineOffenseDTO | string;
    offenseName: string;
    amount: number;
    place: string;
    province?: string;
    district?: string;
    policeStation?: string;
    policeOfficerId?: string;
    status: FineStatus;
    paymentId?: string;
    paymentMethod?: string;
    gatewayFee?: number;
    netAmount?: number;
    gatewayPaymentId?: string;
    paidAt?: string;
    demeritPoints?: number;
    date: string;
    disputeReason?: string;
    paymentNotes?: string;
    createdAt?: string;
    updatedAt?: string;

    // Populated details for deep modal
    driverDetails?: FineDriverDetailsDTO | null;
    officerDetails?: FineOfficerDetailsDTO | null;
}

export interface FineMetricsDTO {
    totalFines: number;
    totalAmount: number;
    paidFines: number;
    paidAmount: number;
    unpaidFines: number;
    unpaidAmount: number;
    disputedFines: number;
    refundedFines: number;
    collectionRate: number;
    statusBreakdown?: Array<{ _id: string; count: number; totalAmount: number }>;
}

export interface FineQueryDTO {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ALL' | FineStatus;
    offenseId?: string;
    policeStation?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'date' | 'amount' | 'licenseNumber' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface CreateFineDTO {
    licenseNumber: string;
    vehicleNumber: string;
    offenseId: string;
    place: string;
    policeStation?: string;
    policeOfficerId?: string;
    date?: string;
    notes?: string;
}

export interface UpdateFineStatusDTO {
    status: FineStatus;
    notes?: string;
    restoreDemerit?: boolean;
}

export interface FineListResponseDTO {
    success: boolean;
    data: FineDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    count: number;
}
