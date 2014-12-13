var url = require('url');
var http = require('http');
var cmd = require('commander');


function decodeUrl(urlStr)
{
  var urlObj = url.parse(urlStr);

  return {
	host: urlObj.hostname,
	port: (urlObj.port ? urlObj.port : '80'),
    path: urlObj.path
  }; 	
}


cmd
  .version('1.0')
  .option('-g, --get [url]', 'GET URL')
  .option('-p, --post [url]', 'POST URL')
  .option('-l, --limit [bytes]', 'Download limit')
  .parse(process.argv);

var postReq = null;
var ctype = 'content-type';

if(cmd.post) {
  var postOpts = decodeUrl(cmd.post);
  postOpts.method = 'POST';

  postReq = http.request(postOpts, function(res) {
	res.setEncoding('binary');
	  
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });
  
  postReq.setHeader(ctype, 'application/octet-stream');
}

if(cmd.get) {
  var getOpts = decodeUrl(cmd.get);
  getOpts.method = 'GET';

  var total = 0;
  var header = null;

  http.request(getOpts, function(res) {
    console.log('\n', res.headers, '\n');
  
    header = res.headers[ctype];
  
    res.setEncoding('binary');
  
    res.on('data', function (chunk) {
      console.log('[', typeof chunk, '] Received', chunk.length, 'bytes');
    
      if(postReq) {
        if(header) {
          postReq.setHeader(ctype, header);
          header = null;
        }
    	
        postReq.write(chunk, 'binary');
      }
    
      total += chunk.length;
    
      if(cmd.limit) {
        if(total >= cmd.limit)
          res.destroy();  
      }
    });

    res.on('end', function () {
	  console.log('\nTotal received =', total, 'bytes\n');
	
	  if(postReq) 
	    postReq.end();
    });	
  }).end();
}
