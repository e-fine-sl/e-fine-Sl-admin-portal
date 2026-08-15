'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemConfigData, UpdateSystemConfigDTO } from '@/types/systemConfig.types';
import { CreditCard, Save, Clock, Banknote, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentConfigCardProps {
    config: SystemConfigData;
    onSave: (dto: UpdateSystemConfigDTO, label: string) => Promise<boolean>;
    isSuperAdmin: boolean;
    saving: boolean;
}

export const PaymentConfigCard: React.FC<PaymentConfigCardProps> = ({
    config,
    onSave,
    isSuperAdmin,
    saving
}) => {
    const [graceDays, setGraceDays] = useState<number>(config.finePaymentGracePeriodDays || 14);
    const [minAmount, setMinAmount] = useState<number>(config.minFineAmount || 500);
    const [maxAmount, setMaxAmount] = useState<number>(config.maxFineAmount || 100000);

    useEffect(() => {
        setGraceDays(config.finePaymentGracePeriodDays || 14);
        setMinAmount(config.minFineAmount || 500);
        setMaxAmount(config.maxFineAmount || 100000);
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (graceDays < 1 || graceDays > 90) {
            toast.error('Payment grace period must be between 1 and 90 days');
            return;
        }
        if (minAmount < 100) {
            toast.error('Minimum fine amount must be at least LKR 100');
            return;
        }
        if (maxAmount <= minAmount) {
            toast.error('Maximum fine amount must be greater than minimum amount');
            return;
        }

        await onSave(
            {
                finePaymentGracePeriodDays: graceDays,
                minFineAmount: minAmount,
                maxFineAmount: maxAmount
            },
            'Payment & Fine Rules'
        );
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">
                            Fine Payment & Grace Period Rules
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">
                            Configure statutory payment deadlines, penalty limits, and settlement parameters.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Statutory Grace Period */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Payment Grace Period
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Days motorists have to settle a fine before overdue notice or court referral.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={graceDays}
                                    onChange={(e) => setGraceDays(parseInt(e.target.value) || 1)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-24 h-8 text-xs font-semibold"
                                />
                                <span className="text-gray-700 font-medium">Days</span>
                            </div>
                        </div>

                        {/* Minimum Fine Limit */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Banknote className="h-4 w-4 text-emerald-600" />
                                Minimum Fine Limit
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Lowest legal penalty amount permitted for minor traffic violations.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={100}
                                    step={100}
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(parseInt(e.target.value) || 100)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-28 h-8 text-xs font-semibold font-mono"
                                />
                                <span className="text-gray-700 font-medium">LKR</span>
                            </div>
                        </div>

                        {/* Maximum Fine Limit */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50/70 border rounded-xl">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Banknote className="h-4 w-4 text-purple-600" />
                                Maximum Fine Limit
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Upper monetary cap allowed for severe traffic citations.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Input
                                    type="number"
                                    min={1000}
                                    step={500}
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(parseInt(e.target.value) || 1000)}
                                    disabled={!isSuperAdmin || saving}
                                    className="w-28 h-8 text-xs font-semibold font-mono"
                                />
                                <span className="text-gray-700 font-medium">LKR</span>
                            </div>
                        </div>
                    </div>

                    {/* Gateway Status Note */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-900 font-medium">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>Payment Gateway Status: <strong>PayHere Direct IPN (Live Production Active)</strong></span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold bg-white px-2 py-0.5 rounded border border-emerald-200">
                            Verified
                        </span>
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
                                {saving ? 'Saving Changes...' : 'Save Payment Rules'}
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};
