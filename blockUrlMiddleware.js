const blockUrlMiddleware = (req, res, next) => {
  const url = process.env.URL
  const testUrl = process.env.TEST_URL
  const phone = process.env.PHONE
  const daysNgapi = process.env.DAYS_NGAPI

  const authorizedUrls = []
  authorizedUrls.push(url, testUrl, phone, daysNgapi)
  
  const requestedUrl = req.headers.referer || req.headers.origin;
  console.log("Request Source-->", requestedUrl)
  if (!authorizedUrls.includes(requestedUrl)) {
    return res.status(403).json({ error: 'Access forbidden' });
  }
  next();
};

module.exports = blockUrlMiddleware;
