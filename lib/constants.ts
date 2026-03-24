// User Roles
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN_OFFICER: 'admin_officer',
    FINANCE_OFFICER: 'finance_officer'
} as const;

// License Status
export const LICENSE_STATUS = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED'
} as const;

// Fine Status
export const FINE_STATUS = {
    PAID: 'Paid',
    UNPAID: 'Unpaid'
} as const;

// Police Positions
export const POLICE_POSITIONS = [
    'OIC',
    'Sergeant',
    'Constable'
] as const;

// Month Names
export const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
] as const;

// Current year range for reports
export const YEAR_RANGE = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
);

// Report Types
export const REPORT_TYPES = [
    { value: 'monthly-fines', label: 'Monthly Fine Report' },
    { value: 'payments', label: 'Payment Summary Report' },
    { value: 'driver-violations', label: 'Driver Violation Report' }
] as const;
