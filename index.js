var fs = require("fs");
var http = require("http");

var targz = require("tar.gz");

var serverIp = "127.0.0.1"; //This will be static linnode server ip
var serverPort = 8080;

var name = process.argv[2];
var pass = process.argv[3];
var aNum = process.argv[4];
var attempt = process.argv[5];

//option -t to use this script to tarball directory in argv[6]
if(process.argv[6].localeCompare("-t") == 0){
  (new targz).compress(__dirname + "/" + process.argv[7], __dirname + "/src.tar.gz", function(err){
    if(err){
      console.log(err);
      printUsage();
    }
    else{
      console.log("Done compressing");
      send(__dirname + "/src.tar.gz", function(){
        //cleanup the tarball we just made
        fs.unlink(__dirname + "/src.tar.gz", function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Removed src.tar.gz");
          }
        });
      });
    }
  });
}
else{
  send(process.argv[6]);
}

var send = function(pathToTargz, cb) {
  fs.readFile(pathToTargz, function(err, file){
    if(err){
      console.log(err);
      printUsage();
    }
    else{
      var toSend = JSON.stringify({"name": name, "pass": pass, "aNum": aNum, 
        "attempt": attempt,  "srcTargz": file
      });
      var req = http.request({"hostname": serverIp, "port": serverPort, "method": "POST"}, function(res){
        var resBody = "";
        res.on("data", function(data){
          resBody += data;
        });
        res.on("end", function(){
          console.log("Result received for submitted assignment: " + resBody);
          cb();
        });
      });
      req.write(toSend);
      req.end();
    }
  });
}

var printUsage = function(){
  console.log("Usage: node assignment-uploader name pass assignmentNumber " +  
    "[tarballed-assignment | -t path-to-assignment-directory-with-package.json]");
}
