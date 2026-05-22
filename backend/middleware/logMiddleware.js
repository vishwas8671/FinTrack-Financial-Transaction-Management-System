// Keep a simple in-memory log of recent activities that the admin controller can query
export const activityLogs = [];

export const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      user: req.user ? req.user.email : 'Guest',
    };

    // Keep log history capped at 100 entries
    activityLogs.unshift(logEntry);
    if (activityLogs.length > 100) {
      activityLogs.pop();
    }

    console.log(
      `[FinTrack] ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.user} (${logEntry.duration})`
    );
  });

  next();
};
