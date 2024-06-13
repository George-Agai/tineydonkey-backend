const blockUrlMiddleware = (req, res, next) => {
  const url = process.env.URL
  const testUrl = process.env.TEST_URL

  const blockedUrls = [
    'https://sqlmap.org'
  ];
  const authorizedUrls = []
  authorizedUrls.push(url, testUrl)
  
  const requestedUrl = req.headers.referer || req.headers.origin;
  console.log(requestedUrl)
  if (blockedUrls.includes(requestedUrl)) {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  // Continue with the next middleware
  next();
};

module.exports = blockUrlMiddleware;
