var http = require('http'),
  host = process.env.HOST,
  port = process.env.PORT || 5000;

http.createServer(function(request, response) {
  response.writeHead(302, {'Location': 'https://foda-app.herokuapp.com/' });
  response.end();
  return;
}).listen(port, host);

console.log(new Date().toLocaleString() + ' DOTACARD server redirecting at: http://'+(host || 'localhost')+(port === '80' ? '/' : ':'+port+'/') );
