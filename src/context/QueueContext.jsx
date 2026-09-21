import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [queueStatus, setQueueStatus] = useState(null);
  const [myTokenData, setMyTokenData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/status');
      const data = await res.json();
      if (data.success) {
        setQueueStatus(data);
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    }
  }, []);

  const fetchMyToken = useCallback(async () => {
    if (!token || !user || user.role !== 'farmer') return;
    try {
      const res = await fetch('/api/bookings/my-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyTokenData(data);
      }
    } catch (err) {
      console.error('Token fetch error:', err);
    }
  }, [token, user]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Notifications fetch error:', err);
    }
  }, [token]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchQueue(), fetchMyToken(), fetchNotifications()]);
    setLoading(false);
  }, [fetchQueue, fetchMyToken, fetchNotifications]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchQueue();
      fetchMyToken();
      fetchNotifications();
    }, 4000); // Poll every 4 seconds for real-time updates

    return () => clearInterval(interval);
  }, [refreshAll, fetchQueue, fetchMyToken, fetchNotifications]);

  return (
    <QueueContext.Provider
      value={{
        queueStatus,
        myTokenData,
        notifications,
        unreadCount,
        loading,
        refreshAll
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
