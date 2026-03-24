'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    icon: string;
    iconColor: string;
    iconBgColor: string;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
    onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    icon,
    iconColor,
    iconBgColor,
    title,
    message,
    confirmText,
    confirmColor,
    onConfirm,
}: ConfirmDialogProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'An unexpected error occurred'
            );
        } finally {
            setLoading(false);
        }
    };

    // Reset error when dialog closes
    React.useEffect(() => {
        if (!open) setError(null);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[420px] p-0 overflow-hidden">
                {/* Icon Area */}
                <div className="flex justify-center pt-8 pb-2">
                    <div
                        className="flex items-center justify-center w-16 h-16 rounded-full text-3xl"
                        style={{ backgroundColor: iconBgColor, color: iconColor }}
                    >
                        {icon}
                    </div>
                </div>

                <DialogHeader className="px-6 pb-0 text-center">
                    <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 leading-relaxed text-center mt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <DialogFooter className="flex flex-row gap-3 px-6 pb-6 pt-2 sm:justify-center">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 text-white"
                        style={{ backgroundColor: confirmColor }}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
