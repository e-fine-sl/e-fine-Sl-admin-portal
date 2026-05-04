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
    ratingScore: number;
    demeritLevel: string;
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
    demeritValue: number;
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
    status: 'PAID' | 'UNPAID';
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

// --- Accident Report Types ---
export type AccidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
export type AccidentType = 'Vehicle Collision' | 'Pedestrian Accident' | 'Hit & Run' | 'Road Hazard / Obstruction' | 'Other';

export interface AccidentReport {
    _id: string;
    driverLicense: string;
    driverName: string;
    driverPhone?: string;
    accidentType: AccidentType;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    province: string;
    district: string;
    policeDivision: string;
    officersNotified: number;
    stationNotified: string;
    emailSent: boolean;
    status: AccidentStatus;
    reportedAt: string;
    images?: string[];
    acknowledgedBy?: string;
    resolvedBy?: string;
}

export interface AccidentStatsResponse {
    success: boolean;
    stats: {
        total: number;
        open: number;
        acknowledged: number;
        resolved: number;
        byProvince: Array<{ _id: string; count: number }>;
        byType: Array<{ _id: string; count: number }>;
    };
}

// SL Geo Constants for Admin Filters
export const SL_PROVINCES = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
] as const;

export const SL_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Trincomalee', 'Batticaloa', 'Ampara',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
] as const;

export const SL_POLICE_DIVISIONS = [
    'Colombo', 'Dehiwela', 'Nugegoda', 'Sri Jayawardenepura Kotte', 'Kelaniya', 'Moratuwa',
    'Homagama', 'Kaduwela', 'Boralesgamuwa', 'Gampaha', 'Negombo', 'Ja-Ela', 'Wattala',
    'Minuwangoda', 'Divulapitiya', 'Mirigama', 'Kalutara', 'Panadura', 'Horana', 'Mathugama',
    'Beruwala', 'Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Akurana',
    'Matale', 'Dambulla', 'Galewela', 'Ukuwela', 'Nuwara Eliya', 'Hatton', 'Talawakelle',
    'Ragala', 'Galle', 'Hikkaduwa', 'Elpitiya', 'Balapitiya', 'Ambalangoda', 'Matara',
    'Weligama', 'Dikwella', 'Akuressa', 'Hambantota', 'Tangalle', 'Tissamaharama', 'Beliatta',
    'Jaffna', 'Chavakachcheri', 'Point Pedro', 'Kilinochchi', 'Paranthan', 'Mannar', 'Murunkan',
    'Vavuniya', 'Nedunkerni', 'Mullaitivu', 'Oddusuddan', 'Trincomalee', 'Kinniya', 'Muttur',
    'Batticaloa', 'Kattankudy', 'Valaichenai', 'Ampara', 'Kalmunai', 'Sammanthurai', 'Pottuvil',
    'Kurunegala', 'Kuliyapitiya', 'Nikaweratiya', 'Maho', 'Wariyapola', 'Puttalam', 'Chilaw',
    'Wennappuwa', 'Marawila', 'Anuradhapura', 'Kekirawa', 'Medawachchiya', 'Mihintale',
    'Polonnaruwa', 'Medirigiriya', 'Hingurakgoda', 'Badulla', 'Bandarawela', 'Haputale',
    'Welimada', 'Mahiyanganaya', 'Monaragala', 'Wellawaya', 'Buttala', 'Ratnapura',
    'Embilipitiya', 'Balangoda', 'Pelmadulla', 'Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana'
] as const;
