'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
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
    SelectValue,
} from '@/components/ui/select';
import {
    Settings2,
    Save,
    RefreshCw,
    ShieldOff,
    ShieldCheck,
    Star,
    RotateCcw,
    AlertTriangle,
    Info,
    Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { SystemConfig } from '@/types';

// ─── Defaults (used when server returns nothing) ───────────────────────────
const DEFAULTS: Omit<SystemConfig, '_id' | 'createdAt' | 'updatedAt'> = {
    accidentNotificationRadiusKm: 10,
    officerLogoutGracePeriodMinutes: 20,
    defaultDemeritPoints: 24,
    monthlyRecoveryPoints: 2,
    recoveryPeriodMonths: 1,
    recoveryEnabled: true,
    lastRecoveryRunAt: null,
};

// ─── Period label helper ───────────────────────────────────────────────────
const periodLabel = (months: number) => {
    if (months === 1) return 'Every month';
    if (months === 12) return 'Once a year (annually)';
    if (months === 3) return 'Every 3 months (quarterly)';
    if (months === 6) return 'Every 6 months (semi-annually)';
    return `Every ${months} months`;
};

// ─── Shared micro-spinner components ─────────────────────────────────────────
const Spinner = ({ size = 16 }: { size?: number }) => (
    <div
        style={{ width: size, height: size }}
        className="border-2 border-white border-t-transparent rounded-full animate-spin"
    />
);

const PageSpinner = () => (
    <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
);

export default function SystemConfigPage() {
    const { user } = useAuth();

    // ── Auth flags ────────────────────────────────────────────────────────
    const isSuperAdmin   = user?.role === USER_ROLES.SUPER_ADMIN;
    const isAdminOfficer = user?.role === 'admin_officer';
    // admin_officer can read & change period only; super_admin gets full CRUD
    const canReadDemerit    = isSuperAdmin || isAdminOfficer;
    const canEditDemerit    = isSuperAdmin;          // points / toggle / reset
    const canEditPeriod     = isSuperAdmin || isAdminOfficer;

    // ── Loading / saving state ────────────────────────────────────────────
    const [loading,           setLoading]          = useState(true);
    const [savingNotification, setSavingNotification] = useState(false);
    const [savingRecovery,    setSavingRecovery]   = useState(false);
    const [savingDefault,     setSavingDefault]    = useState(false);
    const [toggling,          setToggling]         = useState(false);
    const [resetting,         setResetting]        = useState(false);

    // ── Notification settings state ───────────────────────────────────────
    const [radius,      setRadius]      = useState<number>(DEFAULTS.accidentNotificationRadiusKm);
    const [gracePeriod, setGracePeriod] = useState<number>(DEFAULTS.officerLogoutGracePeriodMinutes);

    // ── Demerit settings state ────────────────────────────────────────────
    const [recoveryPoints,  setRecoveryPoints]  = useState<number>(DEFAULTS.monthlyRecoveryPoints);
    const [recoveryPeriod,  setRecoveryPeriod]  = useState<number>(DEFAULTS.recoveryPeriodMonths);
    const [recoveryEnabled, setRecoveryEnabled] = useState<boolean>(DEFAULTS.recoveryEnabled);
    const [lastRunAt,       setLastRunAt]       = useState<string | null>(DEFAULTS.lastRecoveryRunAt);
    const [defaultPoints,   setDefaultPoints]   = useState<number>(DEFAULTS.defaultDemeritPoints);

    // ── Fetch config ──────────────────────────────────────────────────────
    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system-config');
            const data: SystemConfig = response.data.data ?? response.data;

            if (data) {
                setRadius(data.accidentNotificationRadiusKm       ?? DEFAULTS.accidentNotificationRadiusKm);
                setGracePeriod(data.officerLogoutGracePeriodMinutes ?? DEFAULTS.officerLogoutGracePeriodMinutes);
                setRecoveryPoints(data.monthlyRecoveryPoints         ?? DEFAULTS.monthlyRecoveryPoints);
                setRecoveryPeriod(data.recoveryPeriodMonths          ?? DEFAULTS.recoveryPeriodMonths);
                setRecoveryEnabled(data.recoveryEnabled              ?? DEFAULTS.recoveryEnabled);
                setLastRunAt(data.lastRecoveryRunAt                  ?? null);
                setDefaultPoints(data.defaultDemeritPoints           ?? DEFAULTS.defaultDemeritPoints);
            }
        } catch (error) {
            console.error('Failed to fetch system config:', error);
            toast.error('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    // ─────────────────────────────────────────────────────────────────────
    // Save: Notification Settings
    // ─────────────────────────────────────────────────────────────────────
    const handleSaveNotification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!radius || radius < 1 || radius > 100) {
            toast.error('Radius must be between 1 and 100 km');
            return;
        }
        if (!gracePeriod || gracePeriod < 5 || gracePeriod > 120) {
            toast.error('Grace period must be between 5 and 120 minutes');
            return;
        }

        try {
            setSavingNotification(true);
            await api.put('/admin/system-config', {
                accidentNotificationRadiusKm: radius,
                officerLogoutGracePeriodMinutes: gracePeriod,
            });
            toast.success('Notification settings saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save notification settings');
        } finally {
            setSavingNotification(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Save: Monthly Recovery Settings
    // ─────────────────────────────────────────────────────────────────────
    const handleSaveRecovery = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!Number.isInteger(recoveryPoints) || recoveryPoints < 1 || recoveryPoints > 10) {
            toast.error('Recovery points must be a whole number between 1 and 10');
            return;
        }
        if (!Number.isInteger(recoveryPeriod) || recoveryPeriod < 1 || recoveryPeriod > 12) {
            toast.error('Recovery period must be between 1 and 12 months');
            return;
        }

        try {
            setSavingRecovery(true);
            // Build payload based on role:
            // super_admin can update both points and period;
            // admin_officer can only update the period.
            const payload: Record<string, number> = {
                recoveryPeriodMonths: recoveryPeriod,
            };
            if (canEditDemerit) {
                payload.monthlyRecoveryPoints = recoveryPoints;
            }
            await api.put('/admin/system-config', payload);
            toast.success('Recovery settings saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save recovery settings');
        } finally {
            setSavingRecovery(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Save: Default Demerit Points
    // ─────────────────────────────────────────────────────────────────────
    const handleSaveDefaultPoints = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!Number.isInteger(defaultPoints) || defaultPoints < 1 || defaultPoints > 100) {
            toast.error('Default demerit points must be a whole number between 1 and 100');
            return;
        }

        try {
            setSavingDefault(true);
            await api.put('/admin/system-config', {
                defaultDemeritPoints: defaultPoints,
            });
            toast.success('Default demerit points saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save default points');
        } finally {
            setSavingDefault(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Toggle Recovery Enable / Disable
    // ─────────────────────────────────────────────────────────────────────
    const handleToggleRecovery = async () => {
        try {
            setToggling(true);
            const response = await api.patch('/admin/system-config/recovery-toggle');
            const newState: boolean = response.data.data?.recoveryEnabled;
            setRecoveryEnabled(newState);
            toast.success(newState ? 'Monthly recovery has been ENABLED' : 'Monthly recovery has been DISABLED');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to toggle recovery status');
        } finally {
            setToggling(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Reset demerit config to factory defaults
    // ─────────────────────────────────────────────────────────────────────
    const handleResetDemerit = async () => {
        if (!window.confirm(
            'Reset ALL demerit configuration to factory defaults?\n\n' +
            '• Default Points → 24\n• Recovery Points → 2\n• Period → 1 month\n• Recovery → Enabled\n\n' +
            'This cannot be undone.'
        )) return;

        try {
            setResetting(true);
            const response = await api.delete('/admin/system-config/demerit');
            const data: SystemConfig = response.data.data;
            if (data) {
                setRecoveryPoints(data.monthlyRecoveryPoints);
                setRecoveryPeriod(data.recoveryPeriodMonths);
                setRecoveryEnabled(data.recoveryEnabled);
                setDefaultPoints(data.defaultDemeritPoints);
                setLastRunAt(data.lastRecoveryRunAt);
            }
            toast.success('Demerit configuration reset to factory defaults');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset demerit configuration');
        } finally {
            setResetting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings2 className="h-8 w-8 text-blue-600" />
                        System Configuration
                    </h1>
                    <p className="text-gray-500 mt-1">Manage global system settings and parameters</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchConfig}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* ════════════════════════════════════════════════════════════
                CARD 1 — Notification Settings
            ════════════════════════════════════════════════════════════ */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                        Configure how alerts are triggered and dispatched across the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <PageSpinner /> : (
                        <form onSubmit={handleSaveNotification} className="space-y-6">
                            {/* Radius */}
                            <div className="space-y-2">
                                <Label htmlFor="radius">Accident Notification Radius (km)</Label>
                                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                                    <p>Determines the search radius around an accident to find nearby police stations.</p>
                                    <p>Stations within this radius will receive an automated emergency email.</p>
                                </div>
                                <div className="flex items-center gap-3 max-w-md">
                                    <Input
                                        id="radius"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={radius}
                                        onChange={(e) => setRadius(parseInt(e.target.value) || 1)}
                                        disabled={!isSuperAdmin}
                                        className="w-32"
                                    />
                                    <span className="font-medium text-gray-700">Kilometers</span>
                                </div>
                            </div>

                            {/* Grace Period */}
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <Label htmlFor="gracePeriod">Officer Logout Grace Period (Minutes)</Label>
                                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                                    <p>Determines how long an officer is considered "nearby" after they log out of the mobile app.</p>
                                    <p>Officers who logged out within this time window will still receive push notifications for accidents near their last known location.</p>
                                </div>
                                <div className="flex items-center gap-3 max-w-md">
                                    <Input
                                        id="gracePeriod"
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={gracePeriod}
                                        onChange={(e) => setGracePeriod(parseInt(e.target.value) || 5)}
                                        disabled={!isSuperAdmin}
                                        className="w-32"
                                    />
                                    <span className="font-medium text-gray-700">Minutes</span>
                                </div>
                            </div>

                            {isSuperAdmin && (
                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        type="submit"
                                        disabled={savingNotification}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {savingNotification ? (
                                            <span className="flex items-center gap-2"><Spinner />Saving...</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Changes</span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                DEMERIT SYSTEM VALUES — visible to super_admin & admin_officer
            ════════════════════════════════════════════════════════════ */}
            {canReadDemerit && (
                <>
                    {/* Section label */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">
                            Demerit System Values
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* ══════════════════════════════════════════════════
                        CARD 2 — Monthly Recovery Settings
                    ══════════════════════════════════════════════════ */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-amber-500" />
                                        Monthly Recovery Settings
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Controls how many demerit points active drivers earn back and how often the recovery runs.
                                    </CardDescription>
                                </div>

                                {/* Recovery status badge */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {loading ? null : (
                                        <Badge
                                            className={
                                                recoveryEnabled
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                            }
                                        >
                                            {recoveryEnabled ? (
                                                <span className="flex items-center gap-1">
                                                    <ShieldCheck className="h-3.5 w-3.5" /> Recovery Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <ShieldOff className="h-3.5 w-3.5" /> Recovery Disabled
                                                </span>
                                            )}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {loading ? <PageSpinner /> : (
                                <form onSubmit={handleSaveRecovery} className="space-y-6">

                                    {/* Recovery Points (super_admin only edit) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="recoveryPoints">
                                            Monthly Recovery Points
                                            {!canEditDemerit && (
                                                <span className="ml-2 text-xs text-gray-400 font-normal">(view only)</span>
                                            )}
                                        </Label>
                                        <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                                            <p>Number of demerit points restored to each active, non-suspended driver on each recovery run.</p>
                                            <p>Points are capped at the Default Demerit Points ceiling — they cannot exceed it.</p>
                                        </div>
                                        <div className="flex items-center gap-3 max-w-md">
                                            <Input
                                                id="recoveryPoints"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={recoveryPoints}
                                                onChange={(e) => setRecoveryPoints(parseInt(e.target.value) || 1)}
                                                disabled={!canEditDemerit}
                                                className="w-24"
                                            />
                                            <span className="font-medium text-gray-700">Points / run</span>
                                        </div>
                                    </div>

                                    {/* Recovery Period (admin_officer + super_admin can edit) */}
                                    <div className="space-y-2 pt-4 border-t border-gray-100">
                                        <Label htmlFor="recoveryPeriod">
                                            Recovery Period
                                            {!canEditPeriod && (
                                                <span className="ml-2 text-xs text-gray-400 font-normal">(view only)</span>
                                            )}
                                        </Label>
                                        <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                                            <p>How often the recovery job applies points. The job always runs monthly but skips if the required period has not elapsed.</p>
                                        </div>
                                        <Select
                                            value={String(recoveryPeriod)}
                                            onValueChange={(val) => setRecoveryPeriod(parseInt(val))}
                                            disabled={!canEditPeriod}
                                        >
                                            <SelectTrigger id="recoveryPeriod" className="w-64">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                    <SelectItem key={m} value={String(m)}>
                                                        {periodLabel(m)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Last run info */}
                                    {lastRunAt && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span>
                                                Last recovery run:{' '}
                                                <strong>{new Date(lastRunAt).toLocaleString()}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                        {/* Save (super_admin: saves all; admin_officer: saves period only) */}
                                        {canEditPeriod && (
                                            <Button
                                                type="submit"
                                                disabled={savingRecovery || (!canEditDemerit && !canEditPeriod)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {savingRecovery ? (
                                                    <span className="flex items-center gap-2"><Spinner />Saving...</span>
                                                ) : (
                                                    <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Recovery Settings</span>
                                                )}
                                            </Button>
                                        )}

                                        {/* Enable / Disable toggle (super_admin only) */}
                                        {canEditDemerit && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={toggling}
                                                onClick={handleToggleRecovery}
                                                className={
                                                    recoveryEnabled
                                                        ? 'border-red-300 text-red-700 hover:bg-red-50'
                                                        : 'border-green-300 text-green-700 hover:bg-green-50'
                                                }
                                            >
                                                {toggling ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        {recoveryEnabled ? 'Disabling...' : 'Enabling...'}
                                                    </span>
                                                ) : recoveryEnabled ? (
                                                    <span className="flex items-center gap-2">
                                                        <ShieldOff className="h-4 w-4" />Disable Recovery
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4" />Enable Recovery
                                                    </span>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Disabled warning banner */}
                                    {!recoveryEnabled && (
                                        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                                            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Monthly Recovery is currently DISABLED</p>
                                                <p className="mt-1 text-red-700">
                                                    Active drivers will NOT receive any demerit point recovery until this is re-enabled by a Super Admin.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* ══════════════════════════════════════════════════
                        CARD 3 — Default Demerit Points (super_admin CRUD)
                    ══════════════════════════════════════════════════ */}
                    {isSuperAdmin && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-blue-500" />
                                            Default Demerit Points
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            The starting and maximum demerit point balance for drivers.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {loading ? <PageSpinner /> : (
                                    <form onSubmit={handleSaveDefaultPoints} className="space-y-6">

                                        <div className="space-y-2">
                                            <Label htmlFor="defaultPoints">Default Demerit Points</Label>
                                            <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                                                <p>This value is assigned to every new driver on registration.</p>
                                                <p>It is also used as the <strong>ceiling</strong> for recovery — drivers cannot exceed this value through recovery.</p>
                                                <p>The driver's star rating is calculated as <code>( currentPoints / defaultPoints ) × 5</code>.</p>
                                            </div>
                                            <div className="flex items-center gap-3 max-w-md">
                                                <Input
                                                    id="defaultPoints"
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={defaultPoints}
                                                    onChange={(e) => setDefaultPoints(parseInt(e.target.value) || 1)}
                                                    className="w-24"
                                                />
                                                <span className="font-medium text-gray-700">Points</span>
                                            </div>
                                        </div>

                                        {/* Impact warning */}
                                        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                                            <Info className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Impact of changing this value</p>
                                                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-amber-700">
                                                    <li>All <strong>existing</strong> driver star-ratings will be recalculated on their next save (not retroactively batch-updated).</li>
                                                    <li>The recovery ceiling changes immediately for the next cron run.</li>
                                                    <li>Drivers with more points than the new value will keep their current balance but show as 100% / 5 stars.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                            <Button
                                                type="submit"
                                                disabled={savingDefault}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {savingDefault ? (
                                                    <span className="flex items-center gap-2"><Spinner />Saving...</span>
                                                ) : (
                                                    <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Default Points</span>
                                                )}
                                            </Button>

                                            {/* Reset ALL demerit config */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={resetting}
                                                onClick={handleResetDemerit}
                                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                            >
                                                {resetting ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        Resetting...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <RotateCcw className="h-4 w-4" />Reset to Factory Defaults
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
