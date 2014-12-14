var express = require('express');
var router = express.Router();

var channels = {};
var ctype = 'content-type';

function Channel()
{
  this.total = 0;
  this.viewers = [];
  this.header = null;
}

function Viewer(res)
{
  this.res = res;
  this.init = true;
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title : 'Express'
  });
});

router.post('/emit', function(req, res) {
  var name = req.query.channel;
  console.log('New channel:', name);
  
  if(!channels[name])
    channels[name] = new Channel();
  
  var channel = channels[name];
  var viewers = channel.viewers;

  channel.header = req.headers[ctype];
  console.log('\n', req.headers, '\n');

  req.setEncoding('binary');

  req.on('data', function(chunk) {
    channel.total += chunk.length;
    console.log('[', typeof chunk, '] Received', chunk.length, 'bytes');
    
    for(var i = 0; i < viewers.length; i++) {
      var viewer = viewers[i];
      
      if(viewer.init) {
        if(header)
          viewer.res.setHeader(ctype, channel.header);
          
        viewer.init = false;
      }
      
      viewer.res.write(chunk, 'binary');
    }
  });

  req.on('end', function() {
    console.log('\nTotal received =', channel.total, 'bytes\n');
    res.end();
    
    for(var i = 0; i < viewers.length; i++)
      viewers[i].res.end();
  });
});

router.get('/watch', function(req, res) {
  var name = req.query.channel;
  console.log('New viewer for channel:', name);
  
  if(!channels[name])
    channels[name] = new Channel();
  
  channels[name].viewers.push(new Viewer(res));
});

module.exports = router;
