'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AccidentReport } from '@/types';
import { toast } from 'sonner';

interface SocketContextType {
    socket: Socket | null;
    notifications: AccidentReport[];
    unreadCount: number;
    clearUnread: () => void;
    addNotification: (report: AccidentReport) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    notifications: [],
    unreadCount: 0,
    clearUnread: () => {},
    addNotification: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<AccidentReport[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const socketInstance = io(API_URL);

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketInstance.on('new_accident_report', (report: AccidentReport) => {
            setNotifications((prev) => [report, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.error(`New Accident Reported: ${report.accidentType} in ${report.policeDivision}`);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const clearUnread = () => setUnreadCount(0);
    const addNotification = (report: AccidentReport) => {
        setNotifications((prev) => [report, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, clearUnread, addNotification }}>
            {children}
        </SocketContext.Provider>
    );
};
