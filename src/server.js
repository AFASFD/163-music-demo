var express = require("express");
var fs = require("fs");
var qiniu = require("qiniu");
var app = express();
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("vendors"));
app.use(express.static("../node_modules"));
app.get("/", function(req, res) {
  res.status(200);
  let string = fs.readFileSync("./index.html");
  res.set({
    "Content-Type": "text/html;charset=utf-8"
  });
  res.send(string);
});
app.get("/del_user", function(req, res) {
  console.log("/del_user 响应 DELETE 请求");
  res.send("删除页面");
});

//  /list_user 页面 GET 请求
app.get("/list_user", function(req, res) {
  console.log("/list_user GET 请求");
  res.send("用户列表页面");
});
app.get("/song", function(req, res) {
  res.status(200);
  let string = fs.readFileSync("./song.html");
  res.set({
    "Content-Type": "text/html;charset=utf-8"
  });
  res.send(string);
});
app.get("/admin", function(req, res) {
  res.status(200);
  let string = fs.readFileSync("./admin.html");
  res.set({
    "Content-Type": "text/html;charset=utf-8"
  });
  res.send(string);
});
app.get("/xxx", function(req, res) {
  res.status(200);
  let config = fs.readFileSync("../qiniu-key.json");
  res.set({
    "Content-Type": "text/json;charset=utf-8"
  });
  config = JSON.parse(config);
  let { accessKey, secretKey } = config;
  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  let options = {
    scope: "163-music-demo"
  };
  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);
  uploadToken = JSON.stringify(uploadToken);
  res.send(`
      {
        "uptoken": ${uploadToken}
      }
      `);
});

var server = app.listen(8888, function() {
  var port = server.address().port;

  console.log("Example app listening at http://localhost:" + port);
});
