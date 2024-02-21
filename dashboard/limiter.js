const Redis = require('ioredis');
const redisClient = new Redis({ enableOfflineQueue: false });
const { RateLimiterRedis } = require('rate-limiter-flexible');

const maxWrongAttemptsByIP = 70;
const maxReqByIP = 9;

const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    useRedisPackage: true,
    points: maxReqByIP,
    duration: 1,
    blockDuration: 60 * 60 * 24
});

const limiterConsecutiveFailsByIP = new RateLimiterRedis({
    storeClient: redisClient,
    useRedisPackage: true,
    points: maxWrongAttemptsByIP,
    duration: 60,
    blockDuration: 60 * 60 * 3
});

function slowBruteLimiter (ipAddr) {
    limiterSlowBruteByIP.consume(ipAddr).catch(err => {
        if (err instanceof Error) console.error(err);
    });
}

async function consecutiveFails (ipAddr, res, err) {
    const resFailsByIP = await limiterConsecutiveFailsByIP.get(ipAddr);

    let retrySecs = 0;

    if (resFailsByIP !== null && resFailsByIP.consumedPoints > maxWrongAttemptsByIP) 
        retrySecs = Math.round(resFailsByIP.msBeforeNext / 1000) || 1;

    if (retrySecs > 0) {
        res.set('Retry-After', String(retrySecs));
        res.status(429).json({ message: ['Too many requests'] });

    } else {
        try {
            limiterConsecutiveFailsByIP.consume(ipAddr);
            res.status(400).json({ message: err });

        } catch (err) {
            if (err instanceof Error) {
                console.error(err.stack);
                res.status(500);

            } else {
                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                res.status(429).json({ message: ['Too many requests'] });
            }
        }
    }
}

async function resetFailsLimiter (ipAddr) {
    const resFailsByIP = await limiterConsecutiveFailsByIP.get(ipAddr);

    if (resFailsByIP !== null && resFailsByIP.consumedPoints > 0) { 
        await limiterConsecutiveFailsByIP.delete(ipAddr);
    }
}

async function isBlocked (ipAddr) {
    const [resSlowByIP, resFailsByIP] = await Promise.all([
        limiterSlowBruteByIP.get(ipAddr),
        limiterConsecutiveFailsByIP.get(ipAddr)
    ]);

    let retrySecs = 0;

    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxReqByIP) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resFailsByIP !== null && resFailsByIP.consumedPoints > maxWrongAttemptsByIP) {
        retrySecs = Math.round(resFailsByIP.msBeforeNext / 1000) || 1;
    }

    return { blocked: retrySecs > 0, retryAfter: retrySecs };

}

module.exports = { slowBruteLimiter, consecutiveFails, resetFailsLimiter, isBlocked };