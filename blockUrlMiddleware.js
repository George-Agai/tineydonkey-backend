const blockUrlMiddleware = (req, res, next) => {
  const url = process.env.URL
  const testUrl = process.env.TEST_URL
  const phone = process.env.PHONE

  const authorizedUrls = []
  authorizedUrls.push(url, testUrl, phone)
  
  const requestedUrl = req.headers.referer || req.headers.origin;
  console.log(requestedUrl)
  if (!authorizedUrls.includes(requestedUrl)) {
    return res.status(403).json({ error: 'Access forbidden' });
  }
  next();
};

module.exports = blockUrlMiddleware;
