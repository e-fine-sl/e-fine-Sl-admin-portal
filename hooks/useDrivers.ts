import { useState, useEffect, useCallback } from 'react';
import { DriverService } from '@/services/driverService';
import { DriverDTO, DriverMetricsDTO, DriverQueryDTO } from '@/types/driver.types';
import { toast } from 'sonner';

export function useDrivers() {
    const [drivers, setDrivers] = useState<DriverDTO[]>([]);
    const [metrics, setMetrics] = useState<DriverMetricsDTO | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

    // Query Filters
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(15);
    const [total, setTotal] = useState<number>(0);
    const [pages, setPages] = useState<number>(1);

    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
    const [demeritLevel, setDemeritLevel] = useState<'ALL' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'DANGER' | 'HIGH_RISK'>('ALL');
    const [kycStatus, setKycStatus] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchMetrics = useCallback(async () => {
        try {
            setMetricsLoading(true);
            const data = await DriverService.getDriverMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load driver metrics:', error);
        } finally {
            setMetricsLoading(false);
        }
    }, []);

    const fetchDrivers = useCallback(async () => {
        try {
            setLoading(true);
            const params: DriverQueryDTO = {
                page,
                limit,
                search: search.trim() || undefined,
                status: status !== 'ALL' ? status : undefined,
                demeritLevel: demeritLevel !== 'ALL' ? demeritLevel : undefined,
                kycStatus: kycStatus !== 'ALL' ? kycStatus : undefined,
                sortBy,
                sortOrder
            };

            const res = await DriverService.getDrivers(params);
            setDrivers(res.data || []);
            setTotal(res.total || 0);
            setPages(res.pages || 1);
        } catch (error) {
            console.error('Failed to load driver directory:', error);
            toast.error('Failed to fetch licensed driver directory');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status, demeritLevel, kycStatus, sortBy, sortOrder]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

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
        setStatus('ALL');
        setDemeritLevel('ALL');
        setKycStatus('ALL');
        setPage(1);
    };

    return {
        drivers,
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
        demeritLevel,
        setDemeritLevel,
        kycStatus,
        setKycStatus,
        sortBy,
        sortOrder,
        toggleSort,
        refetchDrivers: fetchDrivers,
        refetchMetrics: fetchMetrics,
        resetFilters
    };
}
