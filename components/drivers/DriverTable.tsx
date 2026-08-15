'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DriverDTO } from '@/types/driver.types';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { 
    Car, 
    Eye, 
    Pencil, 
    ShieldAlert, 
    ShieldCheck, 
    SlidersHorizontal, 
    KeyRound, 
    Trash2, 
    ArrowUpDown, 
    Star, 
    CheckCircle2, 
    AlertCircle,
    FileText
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DriverTableProps {
    drivers: DriverDTO[];
    loading: boolean;
    page: number;
    pages: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (col: string) => void;
    onSelectDriver: (driver: DriverDTO) => void;
    onEditDriver: (driver: DriverDTO) => void;
    onSuspendDriver: (driver: DriverDTO) => void;
    onActivateDriver: (driver: DriverDTO) => void;
    onAdjustDemerit: (driver: DriverDTO) => void;
    onResetPassword: (driver: DriverDTO) => void;
    onDeleteDriver: (driver: DriverDTO) => void;
}

export const DriverTable: React.FC<DriverTableProps> = ({
    drivers,
    loading,
    page,
    pages,
    total,
    limit,
    onPageChange,
    sortBy,
    sortOrder,
    onSort,
    onSelectDriver,
    onEditDriver,
    onSuspendDriver,
    onActivateDriver,
    onAdjustDemerit,
    onResetPassword,
    onDeleteDriver
}) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
    const canManage = isSuperAdmin || user?.role === USER_ROLES.ADMIN_OFFICER;

    const renderDemeritLevelBadge = (level: string) => {
        switch (level) {
            case 'EXCELLENT':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200">EXCELLENT</Badge>;
            case 'GOOD':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">GOOD</Badge>;
            case 'FAIR':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200">FAIR</Badge>;
            case 'WARNING':
                return <Badge className="bg-orange-50 text-orange-700 border-orange-200">WARNING</Badge>;
            case 'DANGER':
                return <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold">DANGER</Badge>;
            case 'SUSPENDED':
            default:
                return <Badge className="bg-gray-100 text-gray-700 border-gray-300">SUSPENDED</Badge>;
        }
    };

    return (
        <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-gray-50/50">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    Licensed Driver Directory ({total.toLocaleString()} motorists)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-500 font-medium">Loading driver directory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/75 text-xs uppercase font-semibold text-gray-600 tracking-wider">
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('licenseNumber')}
                                    >
                                        <div className="flex items-center gap-1">
                                            License No
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Driver Name
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">NIC Number</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th 
                                        className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('demeritPoints')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Demerit Pts
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center">Rating</th>
                                    <th className="px-4 py-3 text-center">Risk Tier</th>
                                    <th className="px-4 py-3 text-center">KYC</th>
                                    <th className="px-4 py-3 text-center">Citations</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm text-gray-700">
                                {drivers.map((driver) => (
                                    <tr 
                                        key={driver._id} 
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectDriver(driver)}
                                    >
                                        {/* License Number */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <Badge variant="outline" className="font-mono text-xs font-bold text-gray-900 bg-white">
                                                {driver.licenseNumber}
                                            </Badge>
                                        </td>

                                        {/* Driver Name & Contact */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border">
                                                    {driver.profileImage ? (
                                                        <img 
                                                            src={driver.profileImage} 
                                                            alt={driver.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <span>{driver.name.slice(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{driver.name}</div>
                                                    <div className="text-xs text-gray-500">{driver.email} • {driver.phone}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* NIC */}
                                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-gray-800">
                                            {driver.nic}
                                        </td>

                                        {/* License Status */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {driver.licenseStatus === 'ACTIVE' ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                                                    Suspended
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Demerit Points Meter */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                                driver.demeritPoints <= 4 
                                                    ? 'bg-rose-100 text-rose-800' 
                                                    : driver.demeritPoints <= 10 
                                                        ? 'bg-amber-100 text-amber-800' 
                                                        : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {driver.demeritPoints} / 24
                                            </span>
                                        </td>

                                        {/* Rating Score */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span>{(driver.ratingScore ?? 5.0).toFixed(1)}</span>
                                            </div>
                                        </td>

                                        {/* Risk Tier */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {renderDemeritLevelBadge(driver.demeritLevel)}
                                        </td>

                                        {/* KYC Verified */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {driver.kycVerified ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-medium text-gray-400">
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Citations Count */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <span className="font-bold text-xs text-gray-800">
                                                {driver.finesCount || 0}
                                            </span>
                                        </td>

                                        {/* Action Dropdown Menu */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                    title="View Full Profile Dossier"
                                                    onClick={() => onSelectDriver(driver)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {canManage && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                                            >
                                                                Options
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52 text-xs">
                                                            <DropdownMenuLabel>Motorist Operations</DropdownMenuLabel>
                                                            
                                                            <DropdownMenuItem onClick={() => onEditDriver(driver)}>
                                                                <Pencil className="h-3.5 w-3.5 mr-2 text-blue-600" />
                                                                Edit Profile Details
                                                            </DropdownMenuItem>

                                                            {driver.licenseStatus === 'ACTIVE' ? (
                                                                <DropdownMenuItem 
                                                                    onClick={() => onSuspendDriver(driver)}
                                                                    className="text-rose-600 focus:text-rose-700"
                                                                >
                                                                    <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                                                                    Suspend License
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem 
                                                                    onClick={() => onActivateDriver(driver)}
                                                                    className="text-emerald-600 focus:text-emerald-700"
                                                                >
                                                                    <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                                                                    Activate License (24 Pts)
                                                                </DropdownMenuItem>
                                                            )}

                                                            {isSuperAdmin && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => onAdjustDemerit(driver)}>
                                                                        <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-purple-600" />
                                                                        Adjust Demerit Points
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem onClick={() => onResetPassword(driver)}>
                                                                        <KeyRound className="h-3.5 w-3.5 mr-2 text-amber-600" />
                                                                        Reset Mobile Password
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem 
                                                                onClick={() => onDeleteDriver(driver)}
                                                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                Delete Driver Account
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {drivers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                                <h3 className="text-base font-semibold text-gray-700">No licensed drivers found</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1">
                                    Try adjusting your search criteria or risk tier filter.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination Footer */}
                {total > limit && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                        <p className="text-xs text-gray-600">
                            Showing <strong className="text-gray-900">{(page - 1) * limit + 1}</strong> to{' '}
                            <strong className="text-gray-900">{Math.min(page * limit, total)}</strong> of{' '}
                            <strong className="text-gray-900">{total.toLocaleString()}</strong> motorists
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => onPageChange(page - 1)}
                                className="h-8 text-xs px-3"
                            >
                                Previous
                            </Button>
                            <span className="text-xs font-semibold text-gray-700 px-2">
                                Page {page} of {pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= pages}
                                onClick={() => onPageChange(page + 1)}
                                className="h-8 text-xs px-3"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
