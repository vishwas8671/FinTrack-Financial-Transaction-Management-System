import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, Moon, Sun, CheckCheck, Landmark } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await axios.put('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking notifications read', err);
    }
  };

  // Mark single as read
  const handleMarkSingleRead = async (id) => {
    try {
      const res = await axios.put(`/api/notifications/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 border-b border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between px-8 bg-white/50 dark:bg-fin-dark/40 backdrop-blur-md sticky top-0 z-10">
      {/* Title greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Landmark size={20} className="text-fin-emerald" />
          {pageTitle}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Welcome back, {user?.name || 'User'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown Wrapper */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors shadow-sm relative"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-fin-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay background to close dropdown */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowNotifications(false)}
              ></div>

              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl overflow-hidden shadow-2xl z-30 border border-slate-200/80 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Notifications ({unreadCount})
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-fin-emerald hover:text-fin-emeraldHover font-bold flex items-center gap-1 transition-all"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkSingleRead(n._id)}
                        className={`p-3.5 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors flex flex-col gap-1 ${
                          !n.isRead ? 'bg-fin-emerald/5 dark:bg-fin-emerald/5' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-semibold text-xs leading-none ${
                            n.type === 'budget_alert' ? 'text-fin-rose' :
                            n.type === 'milestone' ? 'text-fin-emerald' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
