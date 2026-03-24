// User & Authentication Types
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin_officer' | 'finance_officer';
    phone?: string;
    profileImage?: string;
    isTwoFactorEnabled?: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: AdminUser;
}

// Driver Types
export interface Driver {
    _id: string;
    name: string;
    nic: string;
    licenseNumber: string;
    email: string;
    phone: string;
    role: string;
    demeritPoints: number;
    licenseStatus: 'ACTIVE' | 'SUSPENDED';
    isVerified: boolean;
    licenseExpiryDate?: string;
    licenseIssueDate?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    vehicleClasses?: VehicleClass[];
    createdAt: string;
    updatedAt: string;
}

export interface VehicleClass {
    category: string;
    issueDate: string;
    expiryDate: string;
}

// Police Officer Types
export interface Officer {
    _id: string;
    name: string;
    email: string;
    badgeNumber: string;
    policeStation: string;
    position: string;
    profileImage?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

// Offense Types
export interface Offense {
    _id: string;
    offenseName: string;
    amount: number;
    description?: string;
    sectionOfAct?: string;
    createdAt: string;
    updatedAt: string;
}

// Issued Fine Types
export interface IssuedFine {
    _id: string;
    licenseNumber: string;
    vehicleNumber: string;
    offenseId: Offense | string;
    offenseName: string;
    amount: number;
    place: string;
    policeOfficerId: string;
    status: 'Paid' | 'Unpaid';
    paymentId?: string;
    paidAt?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}

// Dashboard Stats Types
export interface DashboardStats {
    totalFines: number;
    finesThisMonth: number;
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    totalDrivers: number;
    activeDrivers: number;
    suspendedDrivers: number;
    totalOfficers: number;
    totalOffenseTypes: number;
}

export interface RecentActivity {
    recentFines: IssuedFine[];
    recentPayments: IssuedFine[];
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
    total?: number;
    page?: number;
    pages?: number;
}

// Report Types
export interface MonthlyReportData {
    month: number;
    year: number;
    period: string;
    summary: {
        totalFines: number;
        paidFines: number;
        unpaidFines: number;
        totalAmount: number;
        paidAmount: number;
        unpaidAmount: number;
    };
    offenseBreakdown: Record<string, { count: number; amount: number }>;
    fines: IssuedFine[];
}

export interface PaymentReportData {
    period: string;
    summary: {
        totalPayments: number;
        totalRevenue: number;
    };
    payments: IssuedFine[];
}
