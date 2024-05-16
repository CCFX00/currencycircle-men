const useragent = require('express-useragent');
const geoip = require('geoip-lite');
const uuid = require('uuid');

exports.getDeviceInfo = (req, res) => {
    const userAgent = useragent.parse(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const sessionId = uuid.v4();
    const timestamp = new Date();

    // Device Information
    const deviceInfo = {
        deviceIdentifier: req.headers['device-identifier'],
        deviceType: userAgent.isMobile ? 'Mobile' : 'Desktop',
        os: userAgent.os,
        osVersion: userAgent.version,
        timeStamp: timestamp.toISOString(),
        sessionId: sessionId,
        geolocation: geo ? { country: geo.country, city: geo.city } : null,
    };

    res.json(deviceInfo);
};
