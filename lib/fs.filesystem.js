var Base  = require('./fs').Base
  , util  = require('util')
  , path  = require('path')
  , fs    = require('fs')
  , spawn = require('child_process').spawn;

module.exports = Filesystem;

util.inherits(Filesystem, Base);

function Filesystem (options) {
  Base.call(this, options);

  this.cwd = '';
};

Filesystem.prototype.pwd = function () {
   // console.log('PWD '+ this.cwd );
  return '/' + this.cwd;
};

Filesystem.prototype.chdir = function (dir, cb) {
  var new_cwd;
  if (dir.match(/^\//)) { // Absolute
    new_cwd = dir.substring(1);
  } else { // Relative
      if (path.relative(this.cwd, dir) == '..') {
       // Tried to go farther than root
        return this.respond(cb, {"code": 431, "message": 'Root it root'});
      };
    new_cwd = path.join(this.cwd, dir);
  };
  var self = this;
  fs.stat(path.join(this.options.root, new_cwd), function (err, stats) {
    if (err || !stats.isDirectory()) {
      self.respond(cb, {"code": 431, "message": 'No such directory'});
    } else {
      self.cwd = new_cwd;
      self.respond(cb, null, ['/' + new_cwd]);
    };
  });
};

Filesystem.prototype.listold = function (dir, cb) {
  var self = this
    , target = path.join(this.options.root, this.cwd)
  fs.exists(target, function (exists) {
    if (!exists) {
      self.respond(cb, {"code": 431, "message": 'No such directory'})
    } else {
      var ls = spawn('ls', ['-al', target])
        , result = ''
      ls.stdout.setEncoding(self.encoding);
      ls.stdout.on('data', function (chunk) {
        result += chunk.toString()
      })
      ls.on('exit', function (code) {
        var lines = result.split('\n')
        result = lines.slice(1, lines.length).join('\r\n')
        var err
        if (code != 0) {
          err = {}
        }
        self.respond(cb, null, [result])
      })
    }
  })
}

Filesystem.prototype.list = function (dir, cb) {
    var self = this
        , target = path.join(this.options.root, this.cwd)
    var dirlist =  function( dir, cb )  {
        var results =  [], ownr = 'root', owngr = 'root';
        fs.readdir( dir,  function( err, list )  {
            if  (err)  return cb( err );
            var pending = list.length ;
            if  (!pending)  return cb( null, results );
            list.forEach( function( file )  {
                fs.stat( path.join(dir, file) ,  function( err , stats )  {
                    if (!err && stats.isDirectory()) {
                        results.push(['drwxr-xr-x',0,ownr ,owngr ,stats.size,stats.mtime.toUTCString(),file]);
                    }
                    else if (!err && stats.isFile()) {
                        results.push(['-rwxr-xr-x',0,ownr ,owngr ,stats.size,stats.mtime.toUTCString(),file]);
                    }
                    else {
                        results.push(['d---------',0,ownr ,owngr , 0,(new Date()).toUTCString() ,file]);
                    };
                    if  (!-- pending ) cb ( null , results );
                });
            });
        });
    };
    function streldt ( eldate )  {
        var ardt = eldate.toString().substring(5,26).split(' ');
        //console.log(eldate.month());
        if (((new Date())-eldate) > 15778800000 ) {return ardt[1]+' '+ardt[0]+'  '+ardt[2]}
        else {return ardt[1]+' '+ardt[0]+' '+ardt[3].substring(0,5)}
    };
    function strfrm ( str, n )  {
        var output = str;
        while (output.length < n) { output=' ' + output;}
        return output
    };
    fs.exists(target, function (exists) {
        if (!exists) {
            self.respond(cb, {"code": 431, "message": 'No such directory'})
        } else {
            dirlist(target,function(err, results){
                if(err){self.respond(cb, {"code": 431, "message": 'unknow error directory'})};
                var elsz = [0,0,0,0,0,0,0];
                results.forEach(function(row){
                    row[5] = streldt(row[5]);
                    row.forEach(function(el,i){ if (el.toString().length > elsz[i] && i < 6){elsz[i]= el.toString().length}});
                });
                strres = results.map(function(row){
                    var rowstr ='';
                    row.map( function(el,i){rowstr+= strfrm(el.toString(),elsz[i]) + ' ' })
                    return rowstr
                });
                result = strres.slice(0, results.length).join('\r\n');
                console.log(result);
                self.respond(cb, null, [result])
            });
        }
    })
}

Filesystem.prototype.readFile = function (file, cb) {
  var self = this
    , target = path.join(this.options.root, this.cwd, file)

  fs.stat(target, function (err, stats) {
    if (err || !stats.isFile()) {
      self.respond(cb, {"code": 431, "message": 'No such file'})
    } else {
      self.respond(cb, null, [fs.createReadStream(target)])
    }
  })
}

Filesystem.prototype.writeFile = function (file, cb) {
  this.respond(cb, null, [fs.createWriteStream(path.join(this.options.root, this.cwd, file))])
}

Filesystem.prototype.unlink = function (file, cb) {
  var self = this
  fs.unlink(path.join(this.options.root, this.cwd, file), function (err) {
      if (!err) {
          self.respond(cb, null, [file])
      }else{
          self.respond(cb, {"code": 550, "message":err})
      }
  })
}

Filesystem.prototype.mkd = function cbMkd (dir,cb) {
    var self = this;
    var time = new Date();
    fs.mkdir(path.join(this.options.root, this.cwd, dir), 0666, function(err){
        if(!err){
            self.respond(cb, null, [dir])
        } else {
            console.log('cbMkd ',err);
            return self.respond(cb, {"code": 550, "message": '/' + dir + ' created error'});

        }
    });

}

Filesystem.prototype.rmdir = function (dir, cb) {
    var self = this;
    fs.rmdir(path.join(this.options.root, this.cwd, dir), function (err) {
        if(!err){
            self.respond(cb, null, [dir])
        }else{
            console.log(err);
            self.respond(cb, {"code": 550, "message": err});
        }
    })
};

Filesystem.prototype.rnfr = function (name, cb) {
    var self = this
    fs.exists(path.join(this.options.root, this.cwd, name), function (exists) {
        if (exists) {
            self.respond(cb, null, [name])
        }else{
            self.respond(cb, {"code": 431, "message": 'No such directory or file'})
        };
    })
};

Filesystem.prototype.rnto = function (prev,name, cb) {
    var self = this
    var oldName =path.join(this.options.root, this.cwd, prev);
    var newName =path.join(this.options.root, this.cwd, name);
    fs.exists(oldName, function (exists) {
        if (exists) {
            fs.rename(oldName, newName, function (err) {
                if (!err) {
                    self.respond(cb, null, [name])
                } else {
                    self.respond(cb, {"code": 550, "message": err});
                }

            });
        }else{
            self.respond(cb, {"code": 431, "message": 'No such directory or file'})
        };
    })
};
