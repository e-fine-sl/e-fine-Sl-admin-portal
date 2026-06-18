'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

export default function SystemConfigPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [radius, setRadius] = useState<number>(10);

    const canEdit = user?.role === USER_ROLES.SUPER_ADMIN;

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system-config');
            const data = response.data.data ? response.data.data : response.data;
            if (data && data.accidentNotificationRadiusKm) {
                setRadius(data.accidentNotificationRadiusKm);
            }
        } catch (error) {
            console.error('Failed to fetch system config:', error);
            toast.error('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!radius || radius < 1 || radius > 100) {
            toast.error('Radius must be between 1 and 100 km');
            return;
        }

        try {
            setSaving(true);
            await api.put('/admin/system-config', {
                accidentNotificationRadiusKm: radius
            });
            toast.success('System configuration saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings2 className="h-8 w-8 text-blue-600" />
                        System Configuration
                    </h1>
                    <p className="text-gray-500 mt-1">Manage global system settings and parameters</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                        Configure how alerts are triggered and dispatched across the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
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
                                        onChange={(e) => setRadius(parseInt(e.target.value))}
                                        disabled={!canEdit}
                                        className="w-32"
                                    />
                                    <span className="font-medium text-gray-700">Kilometers</span>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="pt-4 border-t border-gray-100">
                                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
