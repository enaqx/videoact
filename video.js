#!/usr/bin/env node
 
/*
 * Inspired by: http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js
 * Modified from https://gist.github.com/paolorossi/1993068
 */
 
var http = require('http')
  , fs = require('fs')
  , util = require('util')
 
function dump_req(req) {
  return req.method + " " + req.url + " " + req.httpVersion + "\n" +
    JSON.stringify( req.headers )
}
 
function dump_res(res) {
  return res._header
}
 
 
http.createServer(function (req, res) {
  console.log("Request:", dump_req(req))
 
  var path = 'data/video.mp4'
    , stat = fs.statSync(path)
    , total = stat.size
 
  if (req.headers['range']) {
    var range = req.headers.range
      , parts = range.replace(/bytes=/, "").split("-")
      , partialstart = parts[0]
      , partialend = parts[1]
      , start = parseInt(partialstart, 10)
      , end = partialend ? parseInt(partialend, 10) : total-1
      , chunksize = (end-start)+1
 
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize)
 
    var file = fs.createReadStream(path, {start: start, end: end})
 
    res.writeHead(206
                 , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
                   , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
                   , 'Content-Type': 'video/mp4'
                   })
    file.pipe(res)
  }
  else {
    console.log('ALL: ' + total)
    res.writeHead(200
                 , { 'Content-Length': total
                   , 'Content-Type': 'video/mp4'
                   })
    fs.createReadStream(path).pipe(res)
  }
 
  console.log("Response", dump_res(res))
}).listen(1337)
 
console.log('Server running at http://localhost:1337/')
 
var head_title_text = "Streaming experiment"
  , body_header_text = "Welcome"
  , video_src = "http://localhost:1337/"
  , video_type = "video/mp4"
  , html_arr = [ "<html>"
               , "<head>"
               , "<title>" + head_title_text + "</title>"
               , "</head>"
               , "<body>"
               , "<h1>" + body_header_text + "</h1>"
               , "<video controls>"
               , "<source src=\"" + video_src + "\" type=\"" + video_type + "\">"
               , "</video>"
               , "</body>"
               , "</html>"]
  , html = html_arr.join("\n") + "\n"
 
http.createServer(function(req, res) {
  console.log("Request:", dump_req(req))
  res.end(html)
  console.log("Response", dump_res(res))
}).listen(8080)
 
console.log("Server running at http://localhost:8080/")
