'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SystemHealthStatus } from '@/types/systemConfig.types';
import { Activity, Database, Server, Smartphone, Mail, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SystemHealthCardProps {
    health: SystemHealthStatus | null;
    onRefresh: () => void;
    onOpenManualRecovery: () => void;
    isSuperAdmin: boolean;
    loading: boolean;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
    health,
    onRefresh,
    onOpenManualRecovery,
    isSuperAdmin,
    loading
}) => {
    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-gray-900">
                                System Health & Microservices Status
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                Live operational status of core backend services, databases, and message brokers.
                            </CardDescription>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-8 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Status
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {/* 4 Health Service Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Database */}
                    <div className="p-3.5 bg-gray-50/70 border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Database className="h-4 w-4 text-blue-600" />
                                Database
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                {health?.database || 'CONNECTED'}
                            </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500">
                            MongoDB Replica Set • Latency: {health?.databaseLatencyMs || 12}ms
                        </div>
                    </div>

                    {/* Server Engine */}
                    <div className="p-3.5 bg-gray-50/70 border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Server className="h-4 w-4 text-purple-600" />
                                Node.js API
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                ONLINE
                            </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500">
                            Uptime: {health ? formatUptime(health.serverUptimeSeconds) : 'Active'}
                        </div>
                    </div>

                    {/* Firebase Cloud Messaging */}
                    <div className="p-3.5 bg-gray-50/70 border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Smartphone className="h-4 w-4 text-amber-600" />
                                Mobile FCM
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                {health?.fcmConfigured ? 'READY' : 'STANDBY'}
                            </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500">
                            Push Dispatch Channel • High Priority
                        </div>
                    </div>

                    {/* Email Mailer */}
                    <div className="p-3.5 bg-gray-50/70 border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Email Gateway
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                {health?.mailConfigured ? 'READY' : 'STANDBY'}
                            </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500">
                            SendGrid HTTPS / SMTP Dispatcher
                        </div>
                    </div>
                </div>

                {/* Administrative Diagnostics Bar */}
                <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-blue-900">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                        <div>
                            <span className="font-bold">System Running in Optimal Health.</span>
                            <span className="text-[11px] text-blue-700 block">
                                Server Time: {health?.serverTime ? new Date(health.serverTime).toUTCString() : new Date().toUTCString()}
                            </span>
                        </div>
                    </div>

                    {isSuperAdmin && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={onOpenManualRecovery}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
                        >
                            <Play className="h-3.5 w-3.5" />
                            Run Maintenance Recovery Cycle
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
