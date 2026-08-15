/**
 * Driver Types & DTO Definitions
 */

export type LicenseStatus = 'ACTIVE' | 'SUSPENDED';

export type DemeritLevel = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'DANGER' | 'SUSPENDED';

export interface VehicleClass {
    category: string;
    issueDate?: string;
    expiryDate?: string;
}

export interface DriverDTO {
    _id: string;
    name: string;
    nic: string;
    licenseNumber: string;
    email: string;
    phone: string;
    vehicleNumber?: string;
    role: string;
    demeritPoints: number;
    ratingScore: number;
    licenseStatus: LicenseStatus;
    demeritLevel: DemeritLevel;
    suspendedAt?: string | null;
    suspensionReason?: string | null;
    isVerified: boolean;
    kycVerified: boolean;
    emailIsVerified: boolean;
    profileImage?: string;
    licenseFrontImage?: string;
    licenseBackImage?: string;
    licenseExpiryDate?: string;
    licenseIssueDate?: string;
    dateOfBirth?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    vehicleClasses?: VehicleClass[];
    finesCount?: number;
    unpaidFinesCount?: number;
    totalFineAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DriverQueryDTO {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ALL' | 'ACTIVE' | 'SUSPENDED';
    demeritLevel?: 'ALL' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'DANGER' | 'HIGH_RISK';
    kycStatus?: 'ALL' | 'VERIFIED' | 'PENDING';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DriverMetricsDTO {
    totalDrivers: number;
    activeDrivers: number;
    suspendedDrivers: number;
    highRiskDrivers: number;
    kycVerifiedCount: number;
    averageRating: number;
    riskBreakdown: Array<{ level: string; count: number }>;
}

export interface DriverDetailDTO extends DriverDTO {
    enforcementSummary?: {
        totalFines: number;
        paidFines: number;
        unpaidFines: number;
        totalAmount: number;
        unpaidAmount: number;
    };
}

export interface DriverDetailResponseDTO {
    success: boolean;
    driver: DriverDetailDTO;
    violations: Array<{
        _id: string;
        date: string;
        paidAt?: string;
        offenseName: string;
        offenseId?: {
            offenseName?: string;
            sectionOfAct?: string;
        };
        place?: string;
        amount: number;
        status: string;
        vehicleNumber?: string;
    }>;
}

export interface CreateDriverDTO {
    name: string;
    nic: string;
    licenseNumber: string;
    email: string;
    phone: string;
    password: string;
    vehicleNumber?: string;
    city?: string;
    addressLine1?: string;
    licenseExpiryDate?: string;
    dateOfBirth?: string;
}

export interface UpdateDriverDTO {
    name?: string;
    phone?: string;
    email?: string;
    vehicleNumber?: string;
    addressLine1?: string;
    city?: string;
    postalCode?: string;
}

export interface SuspendDriverDTO {
    driverId: string;
    reason: string;
}

export interface AdjustDemeritDTO {
    driverId: string;
    newPoints: number;
    reason?: string;
}

export interface ResetDriverCredentialsDTO {
    driverId: string;
    newPassword: string;
}

export interface DriverListResponseDTO {
    success: boolean;
    data: DriverDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    count: number;
}
