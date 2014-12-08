var http = require('http');
var url = require('url');


function decodeUrl(urlStr)
{
  var urlObj = url.parse(urlStr);

  return {
	host: urlObj.hostname,
	port: (urlObj.port ? urlObj.port : '80'),
    path: urlObj.path
  }; 	
}


var postUrl = null;
var postReq = null;

if(process.argv.length > 3)
	postUrl = process.argv[3];

if(postUrl) {
  var postOpts = decodeUrl(postUrl);
  postOpts.method = 'POST';

  postReq = http.request(postOpts, function(res) {
	res.setEncoding('binary');
	  
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });
  
  postReq.setHeader('content-type', 'application/octet-stream');
}

var getUrl = 'http://modulix.org:8000/libre.ogg';

if(process.argv.length > 2)
	getUrl = process.argv[2];

var getOpts = decodeUrl(getUrl);
getOpts.method = 'GET';

var total = 0;
var header = null;

http.request(getOpts, function(res) {
  console.log(res.headers);
  
  header = res.headers['content-type'];
  
  res.setEncoding('binary');
  
  res.on('data', function (chunk) {
    console.log('[', typeof chunk, '] Received', chunk.length, 'bytes');
    
    var buff = new Buffer(chunk.length);
    buff.write(chunk, 'binary');
    
    if(postReq) {
    	if(header) {
    		postReq.setHeader('content-type', header);
    		header = null;
    	}
    	
    	//postReq.write(buff/*chunk*/);
    	postReq.write(chunk, 'binary');
    }
    
    total += chunk.length;
    
    /*if(total >= 10000)
    	process.exit(0);*/
  });

  res.on('end', function () {
	console.log('Total received =', total, 'bytes');
	
	if(postReq) 
		postReq.end();
  });	
}).end();
