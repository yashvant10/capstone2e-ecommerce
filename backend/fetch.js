const https = require('https');
https.get('https://stockroom-ecommerce.onrender.com/assets/index-D5HgL9yf.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 150)));
});
