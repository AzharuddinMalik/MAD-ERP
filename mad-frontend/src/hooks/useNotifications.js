import { useEffect, useRef } from 'react';
import { getApiUrl } from '../services/api';

/**
 * 📡 Custom Hook for Real-time Dashboard Updates (SSE)
 * Implements exponential backoff to prevent console flooding during backend downtime.
 * 
 * ✅ H4 FIX: Now supports both SITE_UPDATE and NEW_REQUISITION events via a single
 * SSE connection, eliminating the duplicate EventSource from InventoryDashboard.
 * 
 * @param {Function} onSiteUpdate - Callback for SITE_UPDATE events (Dashboard)
 * @param {Function} onRequisition - Callback for NEW_REQUISITION events (Inventory/Supervisor)
 */
export const useNotifications = (onSiteUpdate, onRequisition) => {
    const onSiteUpdateRef = useRef(onSiteUpdate);
    const onRequisitionRef = useRef(onRequisition);

    useEffect(() => {
        onSiteUpdateRef.current = onSiteUpdate;
        onRequisitionRef.current = onRequisition;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        let eventSource = null;
        let reconnectTimeout = null;
        let retryCount = 0;
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds

        const connect = () => {
            const url = new URL(getApiUrl('/api/v1/notifications/subscribe'));
            url.searchParams.append('token', token);
            
            const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
            
            if (retryCount > 0) {
                console.log(`📡 SSE Reconnecting in ${delay}ms... (Attempt: ${retryCount})`);
            } else {
                console.log('📡 SSE Attempting initial connection...');
            }
            
            eventSource = new EventSource(url);

            eventSource.addEventListener('open', () => {
                console.log('📡 SSE Connection Opened');
                retryCount = 0; // Reset retry count on success
            });

            eventSource.addEventListener('INIT', (event) => {
                console.log('📡 SSE Connected:', event.data);
            });

            eventSource.addEventListener('SITE_UPDATE', (event) => {
                try {
                    const update = JSON.parse(event.data);
                    if (onSiteUpdateRef.current) onSiteUpdateRef.current(update);
                } catch (err) {
                    console.error('Failed to parse SSE SITE_UPDATE:', err);
                }
            });

            // ✅ H4 FIX: NEW_REQUISITION event now handled in the shared hook
            eventSource.addEventListener('NEW_REQUISITION', (event) => {
                try {
                    const requisition = JSON.parse(event.data);
                    if (onRequisitionRef.current) onRequisitionRef.current(requisition);
                } catch (err) {
                    console.error('Failed to parse SSE NEW_REQUISITION:', err);
                }
            });

            eventSource.addEventListener('error', (err) => {
                // native EventSource might try to reconnect on its own too, 
                // but we close it and manage our own exponential backoff for better control.
                eventSource.close();
                
                const nextDelay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
                console.warn(`📡 SSE Connection failed. Retrying in ${nextDelay}ms...`);
                
                retryCount++;
                reconnectTimeout = setTimeout(connect, nextDelay);
            });
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            console.log('📡 SSE cleanup');
        };
    }, []); // Empty dependency array prevents reconnect loops
};
