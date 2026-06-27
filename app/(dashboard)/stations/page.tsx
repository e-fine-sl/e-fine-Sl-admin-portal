'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { PoliceStation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Pencil, Building2, MapPin, Map, Table } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { SL_DISTRICTS, SL_PROVINCES, PROVINCE_DISTRICTS_MAP } from '@/types';

// Dynamically import map component to prevent SSR hydration errors with Leaflet
const DynamicMapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-500">Loading Map...</div>
});

const DynamicGlobalMap = dynamic(() => import('./GlobalStationsMap'), {
    ssr: false,
    loading: () => <div className="h-[650px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500 border border-gray-200">Loading Island-Wide Map...</div>
});

export default function StationsPage() {
    const { user } = useAuth();
    const [stations, setStations] = useState<PoliceStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

    const [filterProvince, setFilterProvince] = useState<string>('All');
    const [filterDistrict, setFilterDistrict] = useState<string>('All');
    const [page, setPage] = useState(1);
    const limit = 15;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

    const [formData, setFormData] = useState<{
        stationCode: string;
        name: string;
        province: string;
        district: string;
        officialEmail: string;
        location: [number, number] | null;
    }>({
        stationCode: '',
        name: '',
        province: '',
        district: '',
        officialEmail: '',
        location: null
    });

    const canManageStations = user?.role === USER_ROLES.SUPER_ADMIN;

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/stations');
            const stationData = response.data.data ? response.data.data : response.data;
            setStations(stationData);
        } catch (error) {
            console.error('Failed to fetch stations:', error);
            toast.error('Failed to load police stations');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setIsEditMode(false);
        setFormData({
            stationCode: '',
            name: '',
            province: '',
            district: '',
            officialEmail: '',
            location: null
        });
        setSelectedStationId(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (station: PoliceStation) => {
        setIsEditMode(true);
        setFormData({
            stationCode: station.stationCode,
            name: station.name,
            province: station.province || '',
            district: station.district,
            officialEmail: station.officialEmail,
            location: station.location?.coordinates ? [station.location.coordinates[1], station.location.coordinates[0]] : null 
            // Note: DB stores as [longitude, latitude], Leaflet uses [latitude, longitude]
        });
        setSelectedStationId(station._id);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.stationCode || !formData.name || !formData.province || !formData.district || !formData.officialEmail) {
            toast.error('Please fill in all required fields');
            return;
        }

        const payload = {
            stationCode: formData.stationCode,
            name: formData.name,
            province: formData.province,
            district: formData.district,
            officialEmail: formData.officialEmail,
            location: formData.location ? {
                type: 'Point',
                coordinates: [formData.location[1], formData.location[0]] // [longitude, latitude]
            } : undefined
        };

        try {
            if (isEditMode && selectedStationId) {
                await api.put(`/admin/stations/${selectedStationId}`, payload);
                toast.success('Station updated successfully');
            } else {
                await api.post('/admin/stations', payload);
                toast.success('Station added successfully');
            }
            fetchStations();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!selectedStationId) return;

        try {
            await api.delete(`/admin/stations/${selectedStationId}`);
            toast.success('Station deleted successfully');
            fetchStations();
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete station');
        }
    };

    const filteredStations = stations.filter(station => {
        const matchesProvince = filterProvince === 'All' || station.province === filterProvince;
        const matchesDistrict = filterDistrict === 'All' || station.district === filterDistrict;
        return matchesProvince && matchesDistrict;
    });

    useEffect(() => {
        setPage(1);
    }, [filterProvince, filterDistrict]);

    const paginatedStations = filteredStations.slice((page - 1) * limit, page * limit);

    const filterDistrictsList = filterProvince === 'All' 
        ? SL_DISTRICTS 
        : PROVINCE_DISTRICTS_MAP[filterProvince] || [];

    const formDistrictsList = formData.province 
        ? PROVINCE_DISTRICTS_MAP[formData.province] || []
        : SL_DISTRICTS;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        Police Stations
                    </h1>
                    <p className="text-gray-500 mt-1">View and manage police stations across Sri Lanka</p>
                </div>
                {canManageStations && (
                    <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Station
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Directory ({filteredStations.length})</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select 
                                value={filterProvince} 
                                onValueChange={(val) => {
                                    setFilterProvince(val);
                                    setFilterDistrict('All');
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Provinces" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Provinces</SelectItem>
                                    {SL_PROVINCES?.map((prov: string) => (
                                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Districts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Districts</SelectItem>
                                    {filterDistrictsList?.map((dist: string) => (
                                        <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200 sm:ml-2">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1 h-8 rounded-md transition-all ${viewMode === 'table' ? 'shadow-sm bg-white text-gray-900 hover:bg-white border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <Table className="h-4 w-4 mr-1.5" /> Table
                                </Button>
                                <Button
                                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('map')}
                                    className={`px-3 py-1 h-8 rounded-md transition-all ${viewMode === 'map' ? 'shadow-sm bg-white text-gray-900 hover:bg-white border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <Map className="h-4 w-4 mr-1.5" /> Map
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredStations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                            <p>No police stations found.</p>
                            {canManageStations && <p className="text-sm mt-2">Use the "Add Station" button to register one.</p>}
                        </div>
                    ) : viewMode === 'map' ? (
                        <div className="pt-2 animate-in fade-in duration-300">
                            <DynamicGlobalMap
                                stations={filteredStations}
                                onEdit={handleOpenEditDialog}
                                onDelete={(id) => {
                                    setSelectedStationId(id);
                                    setIsDeleteDialogOpen(true);
                                }}
                                canManageStations={canManageStations}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto animate-in fade-in duration-300">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Province</th>
                                        <th className="px-4 py-3">District</th>
                                        <th className="px-4 py-3">Official Email</th>
                                        <th className="px-4 py-3">Location</th>
                                        {canManageStations && <th className="px-4 py-3 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStations.map((station) => (
                                        <tr key={station._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">
                                                <Badge variant="outline">{station.stationCode}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">{station.name}</td>
                                            <td className="px-4 py-3">{station.province || '-'}</td>
                                            <td className="px-4 py-3">{station.district}</td>
                                            <td className="px-4 py-3 text-gray-600">{station.officialEmail}</td>
                                            <td className="px-4 py-3">
                                                {station.location ? (
                                                    <Badge variant="secondary" className="flex w-fit items-center gap-1 bg-blue-50 text-blue-700">
                                                        <MapPin className="h-3 w-3" /> Set
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not set</span>
                                                )}
                                            </td>
                                            {canManageStations && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleOpenEditDialog(station)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedStationId(station._id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredStations.length > limit && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t px-2">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredStations.length)} of {filteredStations.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page * limit >= filteredStations.length}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Police Station' : 'Add New Police Station'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the details and location of the station.' : 'Fill in the details to register a new police station.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stationCode">Station Code <span className="text-red-500">*</span></Label>
                                <Input
                                    id="stationCode"
                                    placeholder="e.g. MAT-HQ"
                                    value={formData.stationCode}
                                    onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Station Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Matara Headquarters"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">Province <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(val) => setFormData({ ...formData, province: val, district: '' })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SL_PROVINCES?.map((prov: string) => (
                                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.district}
                                    onValueChange={(val) => setFormData({ ...formData, district: val })}
                                    required
                                    disabled={!formData.province}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.province ? "Select District" : "Select Province First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formDistrictsList?.map((district: string) => (
                                            <SelectItem key={district} value={district}>{district}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Official Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="station@police.lk"
                                value={formData.officialEmail}
                                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex justify-between">
                                <span>Location (Map)</span>
                                {formData.location && <span className="text-xs text-blue-600 font-medium">Location selected</span>}
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">Click on the map to pin the exact location of the station.</p>
                            <DynamicMapComponent 
                                position={formData.location} 
                                onChange={(pos) => setFormData({ ...formData, location: pos })} 
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600">
                                {isEditMode ? 'Save Changes' : 'Add Station'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this police station? This action cannot be undone and may affect associated officer accounts.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Station</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
