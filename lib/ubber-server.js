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
      server.use(watchConnect(path, server, options));

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
        buildPath = Path.resolve(__dirname, '..', 'build');


      if(options.verbose) console.log('compile templates');
      compileTemplates(path, function(){
        if(options.verbose) console.log('rm', buildPath);
        rimraf(buildPath, function(err){
          if(err) return callback(err);
          if(options.verbose) console.log('mkdir', buildPath);
          fs.mkdir(buildPath, function(err){
            if(err) return callback(err);
            if(options.verbose) console.log('optimize', path, 'into', buildPath);
            buildScript(path, buildPath, function(err){
              if(err) return callback(err);
              server.use(connect.static(buildPath));

              if(options.verbose) console.log('Push State Enabled in ', buildPath);
              server.use(pushState(buildPath));
              callback(server);
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
    fs.writeFile(Path.resolve(path, 'templates.js'), compiledTemplates.join('\n'), cb);
  });
}

function pushState(path){
  return function(req, res) {
    fs.createReadStream( Path.resolve(path, 'index.html')).pipe(res);
  };
}

