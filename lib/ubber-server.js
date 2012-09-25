var Path = require('path'),
  connect = require('connect'),
  jst = require('universal-jst'),
  fs = require('fs'),
  env = process.env.NODE_ENV || 'dev';

module.exports = {
  start: function(options, callback){
    if(typeof options === 'function'){
      callback = options;
      options = null;
    }
    options = options || {};

    var path = Path.resolve(__dirname, '..', 'public');

    var server = connect();
    server.use(connect.favicon());

    if(env === 'dev'){
      var watchConnect = require('watch-connect'),
        watch = require('watch').watchTree;

      if(options.verbose) console.log('Compile templates from ', Path.resolve(path, 'template'), 'to', Path.resolve(path, 'template.js'));
      compileTemplates(path);

      if(options.verbose) console.log('Force browsers to reload when the server detects file changes.');
      server.use(watchConnect({watchdir:path, server:server, verbose: options.verbose}));

      if(options.verbose) console.log('Navigate in directories');
      server.use(connect.directory(path));

      if(options.verbose) console.log('Static files served in ', path);
      server.use(connect.static(path));

      if(options.verbose) console.log('Push State Enabled in ', path);
      server.use(pushState(path));

      watch(path, compileTemplates.bind(this, path));
      callback(server);
    }else{
      var buildScript = require('no-build-conf'),
        rimraf = require('rimraf'),
        spaseoCrawler = require('spaseo/lib/crawler'),
        spaseoFile = require('spaseo/lib/file'),
        buildPath = Path.resolve(__dirname, '..', 'build'),
        buildPath2 = Path.resolve(__dirname, '..', 'build2');

      var processors = [
        require('no-build-conf/lib/processors/file/less'),
        require('no-build-conf/lib/processors/file/optipng'),
        require('no-build-conf/lib/processors/file/jpegtran'),
        require('no-build-conf/lib/processors/dom/script'),
        require('no-build-conf/lib/processors/dom/link'),
        require('no-build-conf/lib/processors/dom/css-b64-images'),
        require('no-build-conf/lib/processors/dom/exclude')
      ];


      if(options.verbose) console.log('compile templates');
      compileTemplates(path, function(){
        if(options.verbose) console.log('rm', buildPath);
        rimraf(buildPath, function(err){
          if(err) return callback(err);
          if(options.verbose) console.log('mkdir', buildPath);
          fs.mkdir(buildPath, function(err){
            if(err) return callback(err);
            if(options.verbose) console.log('optimize', path, 'into', buildPath);
            buildScript(path, buildPath, processors, function(err){
              if(err) return callback(err);
              options.debug = true;
              spaseoCrawler(buildPath, options, function(e, data){
                if(e) return console.error(e);
                spaseoFile(buildPath, buildPath2, data, function(e){
                  if(e) return console.error(e);
                  server.use(connect.static(buildPath2));

                  if(options.verbose) console.log('Push State Enabled in ', buildPath);
                  server.use(pushState(buildPath));
                  callback(server);
                });
              });
            });
          });
        });
      });
    }

  }
};

function compileTemplates(path, cb){
  jst.handlebars(Path.resolve(path, 'template'), function(err, compiledTemplates){
    if(err) return console.error(err);
    fs.writeFile(Path.resolve(path, 'templates.js'), compiledTemplates.join('\n'),'utf-8', cb);
  });
}

function pushState(path){
  return function(req, res) {
    fs.createReadStream( Path.resolve(path, 'index.html')).pipe(res);
  };
}

