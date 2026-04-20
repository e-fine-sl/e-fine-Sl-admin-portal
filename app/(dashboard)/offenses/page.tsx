'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Offense } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from "@/components/ui/select";
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';

export default function OffensesPage() {
    const { user } = useAuth();
    const [offenses, setOffenses] = useState<Offense[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOffense, setEditingOffense] = useState<Offense | null>(null);
    const [formData, setFormData] = useState({
        offenseName: '',
        amount: '',
        description: '',
        sectionOfAct: '',
        demeritValue: '2' // Default to P1_MINOR
    });

    const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
    const limit = 20; // Items per page

    const fetchOffenses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/fines/offenses');

            // Handle both paginated and non-paginated responses
            if (Array.isArray(response.data)) {
                // Client-side pagination for non-paginated API
                const allOffenses = response.data;

                // Filter by search
                const filtered = search
                    ? allOffenses.filter((offense: Offense) =>
                        offense.offenseName.toLowerCase().includes(search.toLowerCase()) ||
                        offense.description?.toLowerCase().includes(search.toLowerCase())
                    )
                    : allOffenses;

                // Apply pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedData = filtered.slice(startIndex, endIndex);

                setOffenses(paginatedData);
                setTotal(filtered.length);
            } else {
                // Server-side pagination
                setOffenses(response.data.data || []);
                setTotal(response.data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch offenses:', error);
            toast.error('Failed to load offense types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffenses();
    }, [page, search]);

    const handleOpenDialog = (offense?: Offense) => {
        if (offense) {
            setEditingOffense(offense);
            setFormData({
                offenseName: offense.offenseName,
                amount: offense.amount.toString(),
                description: offense.description || '',
                sectionOfAct: offense.sectionOfAct || '',
                demeritValue: offense.demeritValue?.toString() || '2'
            });
        } else {
            setEditingOffense(null);
            setFormData({
                offenseName: '',
                amount: '',
                description: '',
                sectionOfAct: '',
                demeritValue: '2'
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingOffense(null);
        setFormData({
            offenseName: '',
            amount: '',
            description: '',
            sectionOfAct: '',
            demeritValue: '2'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.offenseName || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingOffense) {
                // Update offense
                await api.put(`/admin/fines/offenses/${editingOffense._id}`, {
                    offenseName: formData.offenseName,
                    amount: Number(formData.amount),
                    description: formData.description,
                    sectionOfAct: formData.sectionOfAct,
                    demeritValue: Number(formData.demeritValue)
                });
                toast.success('Offense type updated successfully');
            } else {
                // Create new offense
                await api.post('/fines/add', {
                    offenseName: formData.offenseName,
                    amount: Number(formData.amount),
                    description: formData.description,
                    sectionOfAct: formData.sectionOfAct,
                    demeritValue: Number(formData.demeritValue)
                });
                toast.success('Offense type created successfully');
            }

            handleCloseDialog();
            setPage(1); // Reset to first page
            fetchOffenses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save offense type');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/admin/fines/offenses/${id}`);
            toast.success('Offense type deleted successfully');

            // If deleting the last item on a page, go to previous page
            if (offenses.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchOffenses();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete offense type');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Offense Types</h1>
                    <p className="text-gray-500 mt-1">Manage fine categories for police officers</p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Offense Type
                    </Button>
                )}
            </div>

            {!isSuperAdmin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ Only Super Admins can create, update, or delete offense types. You have read-only access.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Offense Types ({total})</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search offenses..."
                                className="pl-9 w-80"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1); // Reset to first page on search
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Offense Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount (LKR)</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Demerit Pts</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Section of Act</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                        {isSuperAdmin && (
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {offenses.map((offense) => (
                                        <tr key={offense._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{offense.offenseName}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                {formatCurrency(offense.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                    {offense.demeritValue || '0'} Pts
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{offense.sectionOfAct || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {offense.description || 'No description'}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOpenDialog(offense)}
                                                        >
                                                            <Pencil className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(offense._id, offense.offenseName)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {offenses.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    {search ? 'No offense types found matching your search' : 'No offense types found'}
                                </div>
                            )}

                            {/* Pagination */}
                            {total > limit && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
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
                                        <div className="flex items-center gap-2 px-3">
                                            <span className="text-sm text-gray-600">
                                                Page {page} of {Math.ceil(total / limit)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page * limit >= total}
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOffense ? 'Edit Offense Type' : 'Add New Offense Type'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOffense
                                ? 'Update the offense type details below.'
                                : 'Create a new offense type that will appear in the police officer dropdown.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="offenseName">
                                    Offense Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="offenseName"
                                    placeholder="e.g., Speeding"
                                    value={formData.offenseName}
                                    onChange={(e) => setFormData({ ...formData, offenseName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    Fine Amount (LKR) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="e.g., 3000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sectionOfAct">Section of Act</Label>
                                <Input
                                    id="sectionOfAct"
                                    placeholder="e.g., Section 138"
                                    value={formData.sectionOfAct}
                                    onChange={(e) => setFormData({ ...formData, sectionOfAct: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demeritValue">Demerit Level <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={formData.demeritValue} 
                                    onValueChange={(value) => setFormData({ ...formData, demeritValue: value })}
                                >
                                    <SelectTrigger id="demeritValue">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">P1 - Minor (2 Pts)</SelectItem>
                                        <SelectItem value="4">P2 - Moderate (4 Pts)</SelectItem>
                                        <SelectItem value="6">P3 - Serious (6 Pts)</SelectItem>
                                        <SelectItem value="8">P4 - Critical (8 Pts)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g., Exceeding speed limit"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editingOffense ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
