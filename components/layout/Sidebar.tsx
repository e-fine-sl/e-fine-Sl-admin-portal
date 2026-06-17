'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Users,
    CreditCard,
    Settings,
    LogOut,
    ShieldAlert,
    Car,
    AlertTriangle,
    UserCog,
    BarChart3,
    Activity,
    Building2
} from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Fines', href: '/fines', icon: FileText },
        { name: 'Offenses', href: '/offenses', icon: AlertTriangle },
        { name: 'Drivers', href: '/drivers', icon: Car },
        { name: 'Officers', href: '/officers', icon: ShieldAlert },
        { name: 'Payments', href: '/payments', icon: CreditCard },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Accident Reports', href: '/accident-reports', icon: Activity },
        { name: 'Stations', href: '/stations', icon: Building2 },
    ];

    // Add Admin Management for Super Admin
    if (user?.role === 'super_admin') {
        navigation.push({ name: 'Admins', href: '/admins', icon: UserCog });
    }

    // Add Settings for everyone
    navigation.push({ name: 'Settings', href: '/settings', icon: Settings });

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold">e-Fine SL Admin</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-800 p-4">
                <div className="mb-3">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <p className="mt-1 text-xs text-blue-400 capitalize">
                        {user?.role.replace('_', ' ')}
                    </p>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-red-700"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
