'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { SystemConfigData, UpdateSystemConfigDTO } from '@/types/systemConfig.types';
import { ShieldCheck, ShieldOff, Save, RotateCcw, Play, Award, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DemeritConfigCardProps {
    config: SystemConfigData;
    onSave: (dto: UpdateSystemConfigDTO, label: string) => Promise<boolean>;
    onToggleRecovery: () => Promise<boolean>;
    onOpenResetModal: () => void;
    onOpenManualRecoveryModal: () => void;
    isSuperAdmin: boolean;
    isAdminOfficer: boolean;
    saving: boolean;
}

export const DemeritConfigCard: React.FC<DemeritConfigCardProps> = ({
    config,
    onSave,
    onToggleRecovery,
    onOpenResetModal,
    onOpenManualRecoveryModal,
    isSuperAdmin,
    isAdminOfficer,
    saving
}) => {
    const [defaultPoints, setDefaultPoints] = useState<number>(config.defaultDemeritPoints);
    const [recoveryPoints, setRecoveryPoints] = useState<number>(config.monthlyRecoveryPoints);
    const [recoveryPeriod, setRecoveryPeriod] = useState<number>(config.recoveryPeriodMonths);
    const [cleanRecordDays, setCleanRecordDays] = useState<number>(config.cleanRecordDays);

    useEffect(() => {
        setDefaultPoints(config.defaultDemeritPoints);
        setRecoveryPoints(config.monthlyRecoveryPoints);
        setRecoveryPeriod(config.recoveryPeriodMonths);
        setCleanRecordDays(config.cleanRecordDays);
    }, [config]);

    const canEditDemerit = isSuperAdmin;
    const canEditPeriod = isSuperAdmin || isAdminOfficer;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (defaultPoints < 1 || defaultPoints > 100) {
            toast.error('Default points must be between 1 and 100');
            return;
        }
        if (recoveryPoints < 1 || recoveryPoints > 10) {
            toast.error('Recovery points must be between 1 and 10');
            return;
        }
        if (recoveryPeriod < 1 || recoveryPeriod > 12) {
            toast.error('Recovery period must be between 1 and 12 months');
            return;
        }
        if (cleanRecordDays < 0 || cleanRecordDays > 365) {
            toast.error('Clean record requirement must be between 0 and 365 days');
            return;
        }

        const dto: UpdateSystemConfigDTO = {
            recoveryPeriodMonths: recoveryPeriod,
            cleanRecordDays: cleanRecordDays
        };

        if (canEditDemerit) {
            dto.defaultDemeritPoints = defaultPoints;
            dto.monthlyRecoveryPoints = recoveryPoints;
        }

        await onSave(dto, 'Driver Demerit & Safety Rules');
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Award className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-gray-900">
                                Driver Demerit & Point Recovery Rules
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                Set starting point balances, monthly good-driver recovery rates, and safety thresholds.
                            </CardDescription>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        {config.recoveryEnabled ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Recovery Active
                            </Badge>
                        ) : (
                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1">
                                <ShieldOff className="h-3.5 w-3.5" />
                                Recovery Disabled
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                    {/* Grid of parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Default Demerit Points Ceiling */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <Label className="font-semibold text-gray-900 block">Starting Point Balance</Label>
                            <p className="text-[11px] text-gray-500">
                                Maximum points allocated to new drivers upon registration (Ceiling).
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={defaultPoints}
                                    onChange={(e) => setDefaultPoints(parseInt(e.target.value) || 1)}
                                    disabled={!canEditDemerit || saving}
                                    className="w-20 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Points</span>
                            </div>
                        </div>

                        {/* 2. Monthly Recovery Points */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <Label className="font-semibold text-gray-900 block">Recovery Points Rate</Label>
                            <p className="text-[11px] text-gray-500">
                                Points restored to eligible active drivers on each recovery run.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={recoveryPoints}
                                    onChange={(e) => setRecoveryPoints(parseInt(e.target.value) || 1)}
                                    disabled={!canEditDemerit || saving}
                                    className="w-20 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Pts / run</span>
                            </div>
                        </div>

                        {/* 3. Recovery Cycle Interval */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <Label className="font-semibold text-gray-900 block">Recovery Cycle Period</Label>
                            <p className="text-[11px] text-gray-500">
                                How often the automated recovery system awards points.
                            </p>
                            <div className="pt-1">
                                <Select
                                    value={String(recoveryPeriod)}
                                    onValueChange={(val) => setRecoveryPeriod(parseInt(val))}
                                    disabled={!canEditPeriod || saving}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Every Month</SelectItem>
                                        <SelectItem value="3">Every 3 Months (Quarterly)</SelectItem>
                                        <SelectItem value="6">Every 6 Months (Semi-Annually)</SelectItem>
                                        <SelectItem value="12">Once a Year (Annually)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 4. Clean Record Requirement Period */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <Label className="font-semibold text-gray-900 block">Clean Record Requirement</Label>
                            <p className="text-[11px] text-gray-500">
                                Days without new offenses required to qualify for recovery.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={cleanRecordDays}
                                    onChange={(e) => setCleanRecordDays(parseInt(e.target.value) || 0)}
                                    disabled={!canEditPeriod || saving}
                                    className="w-20 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Last Run Info & Recovery Switch */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-blue-900">
                            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>
                                Last automated run:{' '}
                                <strong>
                                    {config.lastRecoveryRunAt ? new Date(config.lastRecoveryRunAt).toLocaleString() : 'Never executed'}
                                </strong>
                            </span>
                        </div>

                        {isSuperAdmin && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpenManualRecoveryModal}
                                    className="h-7 text-[11px] font-semibold text-blue-700 border-blue-300 hover:bg-blue-100 flex items-center gap-1"
                                >
                                    <Play className="h-3 w-3 text-blue-600" /> Run Recovery Cycle Now
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Disabled Warning */}
                    {!config.recoveryEnabled && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Automated point recovery is paused.</span>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Eligible drivers will not receive monthly bonus points until recovery is re-enabled.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t">
                        <div className="flex items-center gap-2">
                            {isSuperAdmin && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={onToggleRecovery}
                                        disabled={saving}
                                        className={`h-8 text-xs font-semibold ${
                                            config.recoveryEnabled
                                                ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                        }`}
                                    >
                                        {config.recoveryEnabled ? 'Disable Recovery Job' : 'Enable Recovery Job'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onOpenResetModal}
                                        disabled={saving}
                                        className="h-8 text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
                                    </Button>
                                </>
                            )}
                        </div>

                        {canEditPeriod && (
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? 'Saving...' : 'Save Demerit Rules'}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
