'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemConfigData, UpdateSystemConfigDTO } from '@/types/systemConfig.types';
import { Lock, Save, ShieldAlert, KeyRound, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityConfigCardProps {
    config: SystemConfigData;
    onSave: (dto: UpdateSystemConfigDTO, label: string) => Promise<boolean>;
    isSuperAdmin: boolean;
    saving: boolean;
}

export const SecurityConfigCard: React.FC<SecurityConfigCardProps> = ({
    config,
    onSave,
    isSuperAdmin,
    saving
}) => {
    const [timeout, setTimeoutVal] = useState<number>(config.adminSessionTimeoutMinutes || 60);
    const [maxAttempts, setMaxAttempts] = useState<number>(config.maxLoginAttempts || 5);
    const [enforce2FA, setEnforce2FA] = useState<boolean>(config.enforceAdmin2FA || false);

    useEffect(() => {
        setTimeoutVal(config.adminSessionTimeoutMinutes || 60);
        setMaxAttempts(config.maxLoginAttempts || 5);
        setEnforce2FA(config.enforceAdmin2FA || false);
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (timeout < 15 || timeout > 480) {
            toast.error('Session timeout must be between 15 and 480 minutes');
            return;
        }
        if (maxAttempts < 3 || maxAttempts > 10) {
            toast.error('Max login attempts must be between 3 and 10');
            return;
        }

        await onSave(
            {
                adminSessionTimeoutMinutes: timeout,
                maxLoginAttempts: maxAttempts,
                enforceAdmin2FA: enforce2FA
            },
            'Security & Access Policies'
        );
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">
                            Security & Session Policies
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">
                            Enforce access controls, idle session termination, and authentication policies.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Session Timeout */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Admin Session Timeout
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Automatically log out inactive administrative sessions to prevent unauthorized desk access.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={15}
                                    max={480}
                                    value={timeout}
                                    onChange={(e) => setTimeoutVal(parseInt(e.target.value) || 15)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Minutes</span>
                            </div>
                        </div>

                        {/* Max Login Attempts */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Failed Login Lockout Threshold
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Consecutive invalid password attempts before temporary security lockout.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={3}
                                    max={10}
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 3)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Attempts</span>
                            </div>
                        </div>
                    </div>

                    {/* 2FA Enforcement Switch */}
                    <div className="p-3.5 bg-gray-50/50 border rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enforce2FA}
                                onChange={(e) => setEnforce2FA(e.target.checked)}
                                disabled={!isSuperAdmin || saving}
                                className="h-4 w-4 text-blue-600 rounded mt-0.5"
                            />
                            <div>
                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                    <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                                    Mandatory Two-Factor Authentication (2FA) for All Administrators
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                    When enabled, all administrators and officers must set up and verify with Google Authenticator or Microsoft Authenticator during login.
                                </p>
                            </div>
                        </label>
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
                                {saving ? 'Saving Changes...' : 'Save Security Policies'}
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};
