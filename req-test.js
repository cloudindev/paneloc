const https = require('https');
https.get('https://raw.githubusercontent.com/coollabsio/coolify/main/app/Http/Requests/ApplicationUpdateRequest.php', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});
