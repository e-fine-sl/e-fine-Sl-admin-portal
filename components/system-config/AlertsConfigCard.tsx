'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemConfigData, UpdateSystemConfigDTO } from '@/types/systemConfig.types';
import { Bell, Save, ShieldAlert, Radio, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface AlertsConfigCardProps {
    config: SystemConfigData;
    onSave: (dto: UpdateSystemConfigDTO, label: string) => Promise<boolean>;
    isSuperAdmin: boolean;
    saving: boolean;
}

export const AlertsConfigCard: React.FC<AlertsConfigCardProps> = ({
    config,
    onSave,
    isSuperAdmin,
    saving
}) => {
    const [radius, setRadius] = useState<number>(config.accidentNotificationRadiusKm);
    const [gracePeriod, setGracePeriod] = useState<number>(config.officerLogoutGracePeriodMinutes);
    const [sosRadius, setSosRadius] = useState<number>(config.sosBroadcastRadiusKm);
    const [emailAlerts, setEmailAlerts] = useState<boolean>(config.emergencyEmailAlerts);
    const [pushAlerts, setPushAlerts] = useState<boolean>(config.emergencyPushAlerts);

    useEffect(() => {
        setRadius(config.accidentNotificationRadiusKm);
        setGracePeriod(config.officerLogoutGracePeriodMinutes);
        setSosRadius(config.sosBroadcastRadiusKm);
        setEmailAlerts(config.emergencyEmailAlerts);
        setPushAlerts(config.emergencyPushAlerts);
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!radius || radius < 1 || radius > 100) {
            toast.error('Accident radius must be between 1 and 100 km');
            return;
        }
        if (!gracePeriod || gracePeriod < 5 || gracePeriod > 120) {
            toast.error('Officer grace period must be between 5 and 120 minutes');
            return;
        }
        if (!sosRadius || sosRadius < 1 || sosRadius > 100) {
            toast.error('SOS broadcast radius must be between 1 and 100 km');
            return;
        }

        await onSave(
            {
                accidentNotificationRadiusKm: radius,
                officerLogoutGracePeriodMinutes: gracePeriod,
                sosBroadcastRadiusKm: sosRadius,
                emergencyEmailAlerts: emailAlerts,
                emergencyPushAlerts: pushAlerts
            },
            'Alert & Emergency Settings'
        );
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">
                            Emergency & Alert Dispatch Settings
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">
                            Configure proximity thresholds and automated notifications for road accidents and SOS incidents.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                    {/* Grid of numeric parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Accident Notification Radius */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Radio className="h-4 w-4 text-blue-600" />
                                Accident Search Radius
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Distance around an incident to locate and alert nearby police stations.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value) || 1)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Kilometers</span>
                            </div>
                        </div>

                        {/* Officer Logout Grace Period */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Officer Standby Window
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Time recently logged-out officers remain eligible for emergency alerts.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={5}
                                    max={120}
                                    value={gracePeriod}
                                    onChange={(e) => setGracePeriod(parseInt(e.target.value) || 5)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Minutes</span>
                            </div>
                        </div>

                        {/* SOS Broadcast Radius */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Radio className="h-4 w-4 text-rose-600" />
                                SOS Broadcast Radius
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Maximum range to dispatch high-priority SOS distress alerts to patrol units.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={sosRadius}
                                    onChange={(e) => setSosRadius(parseInt(e.target.value) || 1)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Kilometers</span>
                            </div>
                        </div>
                    </div>

                    {/* Dispatch Channels */}
                    <div className="p-3.5 bg-gray-50/50 border rounded-xl space-y-3">
                        <Label className="text-xs font-bold text-gray-900 block">Automated Dispatch Channels</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center gap-2.5 p-2.5 bg-white border rounded-lg cursor-pointer hover:bg-blue-50/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={emailAlerts}
                                    onChange={(e) => setEmailAlerts(e.target.checked)}
                                    disabled={!isSuperAdmin || saving}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-blue-600" /> Email Notifications
                                    </div>
                                    <div className="text-[11px] text-gray-500">Send emergency summary emails to regional police command.</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-2.5 p-2.5 bg-white border rounded-lg cursor-pointer hover:bg-blue-50/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={pushAlerts}
                                    onChange={(e) => setPushAlerts(e.target.checked)}
                                    disabled={!isSuperAdmin || saving}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                        <Smartphone className="h-3.5 w-3.5 text-blue-600" /> Mobile Push Notifications
                                    </div>
                                    <div className="text-[11px] text-gray-500">Send instant high-priority alerts to on-duty police app.</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    {isSuperAdmin && (
                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? 'Saving Changes...' : 'Save Alert Settings'}
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};
