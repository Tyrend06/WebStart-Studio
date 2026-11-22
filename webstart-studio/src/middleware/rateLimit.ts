import type { NextFunction, Request, RequestHandler, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

/**
 * Eenvoudige rate limiter (per IP-adres, in het geheugen).
 * Beschermt de formulieren tegen spam. Voor meerdere servers: gebruik een gedeelde store (bijv. Redis).
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of hits) {
      if (value.resetAt < now) hits.delete(key);
    }
  }, options.windowMs).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > options.max) {
      res.status(429).json({ ok: false, message: options.message });
      return;
    }
    next();
  };
}
