/**
 * Police Officer Types & DTOs
 */

export type OfficerPosition = 'Constable' | 'Sergeant' | 'Sub-Inspector (SI)' | 'Inspector (IP)' | 'OIC' | string;

export type OfficerAppState = 'FOREGROUND' | 'BACKGROUND' | 'LOGGED_OUT';

export interface OfficerDTO {
    _id: string;
    name: string;
    badgeNumber: string;
    email: string;
    nic: string;
    phone: string;
    policeStation: string;
    position: OfficerPosition;
    profileImage?: string;
    role: string;
    isActive: boolean;
    appState?: OfficerAppState;
    lastActiveTime?: string | null;
    lastLoginTime?: string | null;
    finesCount?: number;
    finesRevenue?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface OfficerQueryDTO {
    page?: number;
    limit?: number;
    search?: string;
    station?: string;
    position?: string;
    status?: 'ALL' | 'ACTIVE' | 'SUSPENDED';
    dutyState?: 'ALL' | 'FOREGROUND' | 'BACKGROUND' | 'LOGGED_OUT';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface OfficerMetricsDTO {
    totalOfficers: number;
    activeOfficers: number;
    suspendedOfficers: number;
    onDutyOfficers: number;
    stationsCoveredCount: number;
    totalCitationsIssued: number;
    rankDistribution: Array<{ position: string; count: number }>;
}

export interface OfficerDetailDTO extends OfficerDTO {
    stationDetails?: {
        stationCode?: string;
        name?: string;
        district?: string;
        officialEmail?: string;
        telephone?: string;
    } | null;
    enforcementStats: {
        totalFines: number;
        totalAmount: number;
        paidFines: number;
        paidAmount: number;
        unpaidFines: number;
        collectionRate: number;
    };
    recentFines: Array<{
        _id: string;
        date: string;
        paidAt?: string;
        licenseNumber: string;
        vehicleNumber: string;
        offenseName: string;
        amount: number;
        status: string;
    }>;
}

export interface CreateOfficerDTO {
    name: string;
    email: string;
    badgeNumber: string;
    nic: string;
    phone: string;
    password: string;
    policeStation: string;
    position: string;
    profileImage?: string;
}

export interface UpdateOfficerDTO {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    policeStation?: string;
    profileImage?: string;
}

export interface TransferStationDTO {
    officerId: string;
    targetStation: string;
    transferReason?: string;
    effectiveDate?: string;
}

export interface ResetOfficerCredentialsDTO {
    officerId: string;
    newPassword: string;
}

export interface OfficerStatusToggleDTO {
    officerId: string;
    isActive: boolean;
    reason?: string;
}

export interface OfficerListResponseDTO {
    success: boolean;
    data: OfficerDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    count: number;
}
