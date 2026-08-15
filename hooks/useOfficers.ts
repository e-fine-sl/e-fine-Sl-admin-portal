import { useState, useEffect, useCallback } from 'react';
import { OfficerService } from '@/services/officerService';
import { OfficerDTO, OfficerMetricsDTO, OfficerQueryDTO } from '@/types/officer.types';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface StationSimple {
    _id: string;
    stationCode: string;
    name: string;
    district?: string;
}

export function useOfficers() {
    const [officers, setOfficers] = useState<OfficerDTO[]>([]);
    const [metrics, setMetrics] = useState<OfficerMetricsDTO | null>(null);
    const [stations, setStations] = useState<StationSimple[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

    // Query Filters
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(15);
    const [total, setTotal] = useState<number>(0);
    const [pages, setPages] = useState<number>(1);

    const [search, setSearch] = useState<string>('');
    const [station, setStation] = useState<string>('ALL');
    const [position, setPosition] = useState<string>('ALL');
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
    const [dutyState, setDutyState] = useState<'ALL' | 'FOREGROUND' | 'BACKGROUND' | 'LOGGED_OUT'>('ALL');

    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchStations = useCallback(async () => {
        try {
            const res = await api.get('/stations');
            if (res.data?.data) {
                setStations(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stations:', error);
        }
    }, []);

    const fetchMetrics = useCallback(async () => {
        try {
            setMetricsLoading(true);
            const data = await OfficerService.getOfficerMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load officer metrics:', error);
        } finally {
            setMetricsLoading(false);
        }
    }, []);

    const fetchOfficers = useCallback(async () => {
        try {
            setLoading(true);
            const params: OfficerQueryDTO = {
                page,
                limit,
                search: search.trim() || undefined,
                station: station !== 'ALL' ? station : undefined,
                position: position !== 'ALL' ? position : undefined,
                status: status !== 'ALL' ? status : undefined,
                dutyState: dutyState !== 'ALL' ? dutyState : undefined,
                sortBy,
                sortOrder
            };

            const res = await OfficerService.getOfficers(params);
            setOfficers(res.data || []);
            setTotal(res.total || 0);
            setPages(res.pages || 1);
        } catch (error) {
            console.error('Failed to load officers:', error);
            toast.error('Failed to fetch police officer directory');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, station, position, status, dutyState, sortBy, sortOrder]);

    useEffect(() => {
        fetchStations();
        fetchMetrics();
    }, [fetchStations, fetchMetrics]);

    useEffect(() => {
        fetchOfficers();
    }, [fetchOfficers]);

    const toggleSort = (col: string) => {
        if (sortBy === col) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(col);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const resetFilters = () => {
        setSearch('');
        setStation('ALL');
        setPosition('ALL');
        setStatus('ALL');
        setDutyState('ALL');
        setPage(1);
    };

    return {
        officers,
        metrics,
        stations,
        loading,
        metricsLoading,
        page,
        setPage,
        limit,
        setLimit,
        total,
        pages,
        search,
        setSearch,
        station,
        setStation,
        position,
        setPosition,
        status,
        setStatus,
        dutyState,
        setDutyState,
        sortBy,
        sortOrder,
        toggleSort,
        refetchOfficers: fetchOfficers,
        refetchMetrics: fetchMetrics,
        resetFilters
    };
}
