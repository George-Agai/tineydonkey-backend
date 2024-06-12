const blockUrlMiddleware = (req, res, next) => {
    const blockedUrls = [
      'https://sqlmap.org'
    ];
  
    const requestedUrl = req.headers.referer || req.headers.origin;
    console.log(requestedUrl)
  
    if (blockedUrls.includes(requestedUrl)) {
      return res.status(403).json({ error: 'Access forbidden' });
    }
  
    // Continue with the next middleware
    next();
  };
  
  module.exports = blockUrlMiddleware;
  