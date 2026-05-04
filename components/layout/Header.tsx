'use client';

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Bell, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function Header() {
    const { user } = useAuth();
    const { notifications, unreadCount, clearUnread } = useSocket();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name}
                </h2>
                <p className="text-sm text-gray-500">
                    Manage traffic fines and violations
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu onOpenChange={(open) => { if (open) clearUnread(); }}>
                    <DropdownMenuTrigger asChild>
                        <button className="relative rounded-full p-2 hover:bg-gray-100 outline-none">
                            <Bell className="h-5 w-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 p-0 text-xs flex items-center justify-center">
                                    {unreadCount}
                                </Badge>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="px-4 py-2 font-medium text-gray-900 border-b">
                            Notifications
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <DropdownMenuItem key={idx} asChild className="p-0">
                                        <Link href="/accident-reports" className="flex items-start p-4 hover:bg-gray-50 border-b last:border-0 cursor-pointer">
                                            <div className="bg-red-100 p-2 rounded-full mr-3 shrink-0">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    New {notif.accidentType} Report
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {notif.policeDivision} • {notif.driverName}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDistanceToNow(new Date(notif.reportedAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <div className="p-2 text-center">
                                    <Link href="/accident-reports" className="text-xs text-blue-600 hover:underline font-medium">
                                        View all reports
                                    </Link>
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Role Badge */}
                <Badge variant="outline" className="capitalize">
                    {user?.role.replace('_', ' ')}
                </Badge>
            </div>
        </header>
    );
}
