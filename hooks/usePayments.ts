import { useState, useEffect, useCallback, useRef } from 'react';
import { PaymentService } from '@/services/paymentService';
import { PaymentRecord, PaymentMetricsDTO, PaymentQueryDTO, PaymentStatus } from '@/types/payment.types';
import { toast } from 'sonner';

export type DatePresetType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';

export function usePayments() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [metrics, setMetrics] = useState<PaymentMetricsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [metricsLoading, setMetricsLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL');
    const [province, setProvince] = useState<string>('ALL');
    const [datePreset, setDatePreset] = useState<DatePresetType>('ALL');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    // Sorting
    const [sortBy, setSortBy] = useState<'paidAt' | 'amount' | 'licenseNumber' | 'date'>('paidAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search effect (350ms)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 350);
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, [search]);

    // Handle Quick Date Preset Changes
    const applyDatePreset = useCallback((preset: DatePresetType) => {
        setDatePreset(preset);
        const now = new Date();
        const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

        switch (preset) {
            case 'TODAY': {
                const todayStr = formatDateStr(now);
                setStartDate(todayStr);
                setEndDate(todayStr);
                break;
            }
            case 'YESTERDAY': {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yestStr = formatDateStr(yesterday);
                setStartDate(yestStr);
                setEndDate(yestStr);
                break;
            }
            case 'LAST_7_DAYS': {
                const past7 = new Date(now);
                past7.setDate(now.getDate() - 7);
                setStartDate(formatDateStr(past7));
                setEndDate(formatDateStr(now));
                break;
            }
            case 'THIS_MONTH': {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                setStartDate(formatDateStr(firstDay));
                setEndDate(formatDateStr(now));
                break;
            }
            case 'ALL':
            default:
                setStartDate('');
                setEndDate('');
                break;
        }
        setPage(1);
    }, []);

    // Fetch Payments
    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const params: PaymentQueryDTO = {
                page,
                limit,
                search: debouncedSearch.trim() || undefined,
                status: status !== 'ALL' ? status : undefined,
                province: province !== 'ALL' ? province : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortBy,
                sortOrder
            };

            const res = await PaymentService.getPayments(params);
            if (res.success) {
                setPayments(res.data);
                setTotal(res.total);
                setPages(res.pages);
            }
        } catch (error: any) {
            console.error('[usePayments] Error loading payments:', error);
            toast.error('Failed to load payment transactions');
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, status, province, startDate, endDate, sortBy, sortOrder]);

    // Fetch Global Metrics
    const fetchMetrics = useCallback(async () => {
        try {
            setMetricsLoading(true);
            const data = await PaymentService.getPaymentMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('[usePayments] Error loading metrics:', error);
        } finally {
            setMetricsLoading(false);
        }
    }, []);

    // Initial load & dependencies
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setSearch('');
        setDebouncedSearch('');
        setStatus('ALL');
        setProvince('ALL');
        setDatePreset('ALL');
        setStartDate('');
        setEndDate('');
        setSortBy('paidAt');
        setSortOrder('desc');
        setPage(1);
    }, []);

    const toggleSort = (column: 'paidAt' | 'amount' | 'licenseNumber' | 'date') => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setPage(1);
    };

    return {
        payments,
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
        setStatus: (st: PaymentStatus | 'ALL') => { setStatus(st); setPage(1); },
        province,
        setProvince: (pr: string) => { setProvince(pr); setPage(1); },
        datePreset,
        applyDatePreset,
        startDate,
        setStartDate: (sd: string) => { setStartDate(sd); setDatePreset('CUSTOM'); setPage(1); },
        endDate,
        setEndDate: (ed: string) => { setEndDate(ed); setDatePreset('CUSTOM'); setPage(1); },
        sortBy,
        sortOrder,
        toggleSort,
        refetchPayments: fetchPayments,
        refetchMetrics: fetchMetrics,
        resetFilters
    };
}
