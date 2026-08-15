import { useState, useEffect, useCallback } from 'react';
import { FineDTO, FineMetricsDTO, FineQueryDTO, FineStatus } from '@/types/fine.types';
import { FineService } from '@/services/fineService';
import { toast } from 'sonner';

export function useFines() {
    const [fines, setFines] = useState<FineDTO[]>([]);
    const [metrics, setMetrics] = useState<FineMetricsDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(15);
    const [total, setTotal] = useState<number>(0);
    const [pages, setPages] = useState<number>(1);

    // Filters
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<'ALL' | FineStatus>('ALL');
    const [policeStation, setPoliceStation] = useState<string>('ALL');
    const [offenseId, setOffenseId] = useState<string>('ALL');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Sorting
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'licenseNumber' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Fetch Metrics
    const fetchMetrics = useCallback(async () => {
        try {
            setMetricsLoading(true);
            const data = await FineService.getFineMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load fine metrics:', error);
        } finally {
            setMetricsLoading(false);
        }
    }, []);

    // Fetch Fines
    const fetchFines = useCallback(async () => {
        try {
            setLoading(true);
            const query: FineQueryDTO = {
                page,
                limit,
                search: search.trim() || undefined,
                status: status !== 'ALL' ? status : undefined,
                policeStation: policeStation !== 'ALL' ? policeStation : undefined,
                offenseId: offenseId !== 'ALL' ? offenseId : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortBy,
                sortOrder
            };

            const res = await FineService.getFines(query);
            setFines(res.data || []);
            setTotal(res.total || 0);
            setPages(res.pages || 1);
        } catch (error) {
            console.error('Failed to load fines:', error);
            toast.error('Failed to load traffic citations');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status, policeStation, offenseId, startDate, endDate, sortBy, sortOrder]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    useEffect(() => {
        fetchFines();
    }, [fetchFines]);

    const toggleSort = (field: 'date' | 'amount' | 'licenseNumber' | 'status') => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('ALL');
        setPoliceStation('ALL');
        setOffenseId('ALL');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    return {
        fines,
        metrics,
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
        status,
        setStatus,
        policeStation,
        setPoliceStation,
        offenseId,
        setOffenseId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sortBy,
        sortOrder,
        toggleSort,
        refetchFines: fetchFines,
        refetchMetrics: fetchMetrics,
        resetFilters
    };
}
