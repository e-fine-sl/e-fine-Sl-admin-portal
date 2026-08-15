'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FineService } from '@/services/fineService';
import { CreateFineDTO, FineOffenseDTO } from '@/types/fine.types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Scale, Search, Building2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

interface FineCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const FineCreateModal: React.FC<FineCreateModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [offenseId, setOffenseId] = useState('');
    const [place, setPlace] = useState('');
    const [policeStation, setPoliceStation] = useState('');
    const [policeOfficerId, setPoliceOfficerId] = useState('ADMIN-DESK');
    const [notes, setNotes] = useState('');

    // Offenses state & search
    const [offenses, setOffenses] = useState<FineOffenseDTO[]>([]);
    const [loadingOffenses, setLoadingOffenses] = useState(false);
    const [offenseSearch, setOffenseSearch] = useState('');

    // Stations state & search
    const [stations, setStations] = useState<Array<{ _id: string; name: string; stationCode?: string; district?: string }>>([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [stationSearch, setStationSearch] = useState('');
    const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoadingOffenses(true);
            setLoadingStations(true);

            // Load offenses
            FineService.getOffenses()
                .then((data) => setOffenses(data || []))
                .catch((err) => console.error('Failed to load offenses:', err))
                .finally(() => setLoadingOffenses(false));

            // Load stations
            FineService.getStations()
                .then((data) => {
                    setStations(data || []);
                    if (data && data.length > 0 && !policeStation) {
                        setPoliceStation(data[0].name);
                    }
                })
                .catch((err) => console.error('Failed to load stations:', err))
                .finally(() => setLoadingStations(false));
        }
    }, [isOpen]);

    // Filter offenses by search
    const filteredOffenses = useMemo(() => {
        if (!offenseSearch.trim()) return offenses;
        const q = offenseSearch.toLowerCase();
        return offenses.filter(
            (o) =>
                (o.offenseName || '').toLowerCase().includes(q) ||
                (o.sectionOfAct || '').toLowerCase().includes(q)
        );
    }, [offenses, offenseSearch]);

    // Filter stations by search
    const filteredStations = useMemo(() => {
        if (!stationSearch.trim()) return stations;
        const q = stationSearch.toLowerCase();
        return stations.filter(
            (s) =>
                (s.name || '').toLowerCase().includes(q) ||
                (s.stationCode || '').toLowerCase().includes(q) ||
                (s.district || '').toLowerCase().includes(q)
        );
    }, [stations, stationSearch]);

    const selectedOffense = offenses.find((o) => o._id === offenseId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!licenseNumber.trim() || !vehicleNumber.trim() || !offenseId || !place.trim()) {
            toast.error('Please fill in all mandatory citation fields');
            return;
        }

        try {
            setSubmitting(true);
            const dto: CreateFineDTO = {
                licenseNumber: licenseNumber.toUpperCase().trim(),
                vehicleNumber: vehicleNumber.toUpperCase().trim(),
                offenseId,
                place: place.trim(),
                policeStation: policeStation.trim() || 'Court Administration',
                policeOfficerId: policeOfficerId.trim() || 'ADMIN-DESK',
                notes: notes.trim() || undefined
            };

            const res = await FineService.createFine(dto);
            toast.success(res.message || 'Traffic citation issued successfully');

            // Reset form
            setLicenseNumber('');
            setVehicleNumber('');
            setOffenseId('');
            setPlace('');
            setNotes('');
            setOffenseSearch('');
            setStationSearch('');

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to issue citation:', error);
            toast.error(error.response?.data?.message || 'Failed to issue traffic citation');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Issue Traffic Citation
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Register manual paper citation or court-mandated fine penalty.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
                    {/* License Number & Vehicle Number */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Driving License # *</Label>
                            <Input
                                placeholder="e.g. B1234567"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Vehicle Number Plate *</Label>
                            <Input
                                placeholder="e.g. WP-CAB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-8 text-xs font-mono uppercase"
                                required
                            />
                        </div>
                    </div>

                    {/* Offense Selector with Search */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-700">
                                Traffic Offense / Violation * ({offenses.length} available)
                            </Label>
                            {loadingOffenses && (
                                <span className="text-[10px] text-blue-600 font-medium animate-pulse">Loading offenses...</span>
                            )}
                        </div>

                        {/* Search Input for Offenses */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search offense by name or legal section..."
                                value={offenseSearch}
                                onChange={(e) => setOffenseSearch(e.target.value)}
                                className="h-7 text-xs pl-8 mb-1 bg-gray-50"
                            />
                        </div>

                        {/* Offenses list box */}
                        <div className="border rounded-lg max-h-36 overflow-y-auto divide-y bg-white text-xs">
                            {filteredOffenses.map((offense) => (
                                <div
                                    key={offense._id}
                                    onClick={() => setOffenseId(offense._id)}
                                    className={`p-2 cursor-pointer flex justify-between items-center transition-colors ${
                                        offenseId === offense._id
                                            ? 'bg-blue-50/80 border-l-4 border-l-blue-600 font-medium'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="pr-2">
                                        <div className="text-gray-900 font-semibold">{offense.offenseName}</div>
                                        <div className="text-[10px] text-gray-500">{offense.sectionOfAct || 'Motor Traffic Act'}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-mono font-bold text-gray-900">{formatCurrency(offense.amount || 0)}</div>
                                        <div className="text-[10px] text-rose-600 font-medium">-{offense.demeritPoints || 0} pts</div>
                                    </div>
                                </div>
                            ))}

                            {filteredOffenses.length === 0 && (
                                <div className="p-3 text-center text-gray-400 text-xs">
                                    No offenses match "{offenseSearch}"
                                </div>
                            )}
                        </div>

                        {/* Selected Offense Highlight */}
                        {selectedOffense && (
                            <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-200 flex justify-between items-center text-xs">
                                <div>
                                    <span className="font-bold text-blue-900">Selected: {selectedOffense.offenseName}</span>
                                    <span className="text-[10px] text-blue-700 block">{selectedOffense.sectionOfAct || 'Motor Traffic Act'}</span>
                                </div>
                                <div className="text-right font-mono font-bold text-blue-900">
                                    {formatCurrency(selectedOffense.amount || 0)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Police Command Station with Live Search */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                Police Command Station *
                            </Label>
                            {loadingStations && (
                                <span className="text-[10px] text-blue-600 animate-pulse">Loading stations...</span>
                            )}
                        </div>

                        {/* Station Selector with search filter */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    placeholder="Search station by name or district..."
                                    value={stationSearch}
                                    onChange={(e) => {
                                        setStationSearch(e.target.value);
                                        setIsStationDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsStationDropdownOpen(true)}
                                    className="h-8 text-xs pl-8 bg-gray-50"
                                />
                            </div>

                            {/* Dropdown station options */}
                            {isStationDropdownOpen && (
                                <div className="border rounded-lg max-h-32 overflow-y-auto divide-y bg-white shadow-sm text-xs">
                                    {filteredStations.map((st) => (
                                        <div
                                            key={st._id}
                                            onClick={() => {
                                                setPoliceStation(st.name);
                                                setStationSearch('');
                                                setIsStationDropdownOpen(false);
                                            }}
                                            className={`p-2 cursor-pointer flex justify-between items-center transition-colors ${
                                                policeStation === st.name ? 'bg-blue-50 font-bold text-blue-700' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div>
                                                <span className="font-semibold">{st.name}</span>
                                                {st.district && <span className="text-[10px] text-gray-500 ml-1.5">({st.district})</span>}
                                            </div>
                                            {st.stationCode && (
                                                <span className="font-mono text-[10px] text-gray-400">{st.stationCode}</span>
                                            )}
                                        </div>
                                    ))}

                                    {filteredStations.length === 0 && (
                                        <div 
                                            onClick={() => {
                                                setPoliceStation(stationSearch);
                                                setIsStationDropdownOpen(false);
                                            }}
                                            className="p-2 text-center text-blue-600 hover:bg-blue-50 cursor-pointer text-xs font-semibold"
                                        >
                                            Use custom station name: "{stationSearch}"
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                                Current Station: <strong className="text-gray-900">{policeStation || 'None selected'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Incident Location & Officer ID */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Incident Location *</Label>
                            <Input
                                placeholder="e.g. Galle Road, Kollupitiya"
                                value={place}
                                onChange={(e) => setPlace(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-gray-700">Officer Badge / ID</Label>
                            <Input
                                value={policeOfficerId}
                                onChange={(e) => setPoliceOfficerId(e.target.value)}
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                    </div>

                    {/* Citation / Court Reference Notes */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-700">Citation / Court Reference Note</Label>
                        <Input
                            placeholder="e.g. Paper Ticket #MT-889 / Court Order TC-12"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={submitting || !offenseId || !licenseNumber || !vehicleNumber}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {submitting ? 'Issuing...' : 'Issue Citation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
