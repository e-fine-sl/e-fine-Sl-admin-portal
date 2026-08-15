'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfficerDTO } from '@/types/officer.types';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { 
    Users, 
    Eye, 
    Pencil, 
    ArrowRightLeft, 
    KeyRound, 
    ShieldCheck, 
    ShieldAlert, 
    Trash2, 
    ArrowUpDown, 
    Radio,
    FileText,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OfficerTableProps {
    officers: OfficerDTO[];
    loading: boolean;
    page: number;
    pages: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (col: string) => void;
    onSelectOfficer: (officer: OfficerDTO) => void;
    onEditOfficer: (officer: OfficerDTO) => void;
    onTransferOfficer: (officer: OfficerDTO) => void;
    onResetCredentials: (officer: OfficerDTO) => void;
    onToggleStatus: (officer: OfficerDTO) => void;
    onDeleteOfficer: (officer: OfficerDTO) => void;
}

export const OfficerTable: React.FC<OfficerTableProps> = ({
    officers,
    loading,
    page,
    pages,
    total,
    limit,
    onPageChange,
    sortBy,
    sortOrder,
    onSort,
    onSelectOfficer,
    onEditOfficer,
    onTransferOfficer,
    onResetCredentials,
    onToggleStatus,
    onDeleteOfficer,
}) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
    const canManage = isSuperAdmin || user?.role === USER_ROLES.ADMIN_OFFICER;

    const renderPositionBadge = (pos: string) => {
        switch (pos) {
            case 'OIC':
                return <Badge className="bg-purple-50 text-purple-700 border-purple-200">OIC</Badge>;
            case 'Inspector (IP)':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Inspector (IP)</Badge>;
            case 'Sub-Inspector (SI)':
                return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Sub-Inspector (SI)</Badge>;
            case 'Sergeant':
                return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Sergeant</Badge>;
            case 'Constable':
            default:
                return <Badge variant="outline" className="text-gray-700">{pos || 'Constable'}</Badge>;
        }
    };

    const renderDutyStateBadge = (appState?: string) => {
        switch (appState) {
            case 'FOREGROUND':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        On Duty
                    </span>
                );
            case 'BACKGROUND':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Standby
                    </span>
                );
            case 'LOGGED_OUT':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Offline
                    </span>
                );
        }
    };

    return (
        <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-gray-50/50">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Police Officer Directory ({total.toLocaleString()} officers)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-500 font-medium">Loading officer records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/75 text-xs uppercase font-semibold text-gray-600 tracking-wider">
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('badgeNumber')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Badge No
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => onSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Officer Name
                                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">Rank / Position</th>
                                    <th className="px-4 py-3">Station Assignment</th>
                                    <th className="px-4 py-3 text-center">Duty Presence</th>
                                    <th className="px-4 py-3 text-center">Account Status</th>
                                    <th className="px-4 py-3 text-center">Citations</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm text-gray-700">
                                {officers.map((officer) => (
                                    <tr 
                                        key={officer._id} 
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectOfficer(officer)}
                                    >
                                        {/* Badge Number */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <Badge variant="outline" className="font-mono text-xs font-bold text-gray-900 bg-white">
                                                {officer.badgeNumber}
                                            </Badge>
                                        </td>

                                        {/* Officer Name & Contact */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {officer.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{officer.name}</div>
                                                    <div className="text-xs text-gray-500">{officer.email} • {officer.phone}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Position */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            {renderPositionBadge(officer.position)}
                                        </td>

                                        {/* Station */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-gray-800">
                                            {officer.policeStation}
                                        </td>

                                        {/* Duty Presence */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {renderDutyStateBadge(officer.appState)}
                                        </td>

                                        {/* Account Status */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {officer.isActive ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                                                    Suspended
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Citations Count */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <span className="font-bold text-xs text-gray-800">
                                                {officer.finesCount || 0}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                {/* View Dossier Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                    title="View Full Profile Dossier"
                                                    onClick={() => onSelectOfficer(officer)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Dropdown Menu for Management Actions */}
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
                                                        <DropdownMenuContent align="end" className="w-48 text-xs">
                                                            <DropdownMenuLabel>Officer Operations</DropdownMenuLabel>
                                                            
                                                            <DropdownMenuItem onClick={() => onEditOfficer(officer)}>
                                                                <Pencil className="h-3.5 w-3.5 mr-2 text-blue-600" />
                                                                Edit Profile Details
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => onTransferOfficer(officer)}>
                                                                <ArrowRightLeft className="h-3.5 w-3.5 mr-2 text-purple-600" />
                                                                Station Transfer
                                                            </DropdownMenuItem>

                                                            {isSuperAdmin && (
                                                                <DropdownMenuItem onClick={() => onResetCredentials(officer)}>
                                                                    <KeyRound className="h-3.5 w-3.5 mr-2 text-amber-600" />
                                                                    Reset Mobile PIN / Pass
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem onClick={() => onToggleStatus(officer)}>
                                                                {officer.isActive ? (
                                                                    <>
                                                                        <ShieldAlert className="h-3.5 w-3.5 mr-2 text-rose-600" />
                                                                        Suspend Officer
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShieldCheck className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                                                                        Activate Account
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem 
                                                                onClick={() => onDeleteOfficer(officer)}
                                                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                Delete Officer
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

                        {officers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
                                <h3 className="text-base font-semibold text-gray-700">No police officers found</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1">
                                    Try adjusting your search criteria, station filter, or rank filter.
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
                            <strong className="text-gray-900">{total.toLocaleString()}</strong> officers
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
