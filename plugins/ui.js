module.exports = function (corsica) {
    var useCommand = corsica.config.plugins.indexOf('command') >= 0;

    var subscriptions = {};
  
    var settings = corsica.settings.setup('tags', {
        tags: [
        {
          name: 'default',
          random: false,
          commands: []
        },
      ],
    });

    corsica.on('tags.getSubscriptions', function(message) {
        message.subscriptions = subscriptions;
        return message;
      });
    
      corsica.on('tags.setSubscriptions', function (msg) {
        console.log('setting tag subscriptions for', msg.name, msg.tags);
        if (msg.tags && msg.name) {
          subscriptions[msg.name] = msg.tags;
        }
        return msg;
      });
  
    var insecureScrub = function(str) {
      return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
  
    corsica.serveRoute('ui', function(req, res) {
      var out = '<html> <head> <link href="https://fonts.googleapis.com/css?family=Nunito&display=swap" rel="stylesheet"> <link rel="stylesheet" type="text/css" href="css/admin.css"> <link rel="stylesheet" type="text/css" href="css/style.css"> <script src="js/ui.js"> <title>Corsica Development Suite</title> </script></head> <body> <header> <div class="topbar"> <div class="brand"></div> <h1 id="title">Development Suite</h1> </div> </header> <div class="content">';
      settings.get().then(function (settings) {
        out += '<div class="settings"><h2>Tags</h2><hr>';
        
        settings["tags"].forEach(function(tag) {
            out += "<h3>" + tag["name"] + "</h3>";

            out += "<label>Name</label> <input type='text' id='name" + tag["name"] + "' onfocusout=" + '"';
            out += "changeName('" + tag["name"] + "')";
            out += '"' + "value='" + tag["name"] + "'><br>";

            out += "<label>Random</label> <input id='random" + tag["name"] +  "' type='checkbox' ";
            if(tag["random"]) {
                out += "checked ";
            }
            out += "onclick=" + '"';
            out += "changeRandom('" + tag["name"] + "')";
            out += '"' + ">";

            out += "<h4>Commands</h4>";
            tag["commands"].forEach(function(command) {
                out += "<li>" + command + "</li>";
            });

            var commandID = "command" + tag["name"];

            out += "<input id='command" + tag["name"] + "' type='text'>"

            out += "<button onclick=" + '"';
            out += "addCommand('" + tag["name"] + "')";
            out += '"' + ">+</button>";

            out += "<button onclick=" + '"';
            out += "removeCommand('" + tag["name"] + "')";
            out += '"' + ">-</button>";
        });

        out += "<br><br><button onclick=" + '"';
        out += "addTag()";
        out += '"' + ">Add Tag</button>";

        out += '</div><br> <div class="settings"><h2>Subscriptions</h2><hr>';
        
        Object.keys(subscriptions).forEach(function(subscriber, index) {
            out += "<h3>" + screen + "</h3>";
            out += "<button onclick=" + '"';
            out += "resetScreen('" + screen + "')";
            out += '"' + ">Refresh Screen</button><br>";
            subscriptions[subscriber].forEach(function(tag) {
                out += "<label>Tag</label> <input type='text' id='tag" + screen + "' onfocusout=" + '"';
                out += "setScreenTag('" + screen + "')";
                out += '"' + "value='" + tag + "'><br>";

            });
        });
        out += '</div></div></body></html>';
        res.send(out);
      });
    });
    
    corsica.serveRoute('resetScreen', function(req, res) {

        var screen = req.query.screen || '';



        if (screen.length == 0) {

            res.status(400);

            return res.send('Expected screen.');

        }



        if (subscriptions[screen]) {

            corsica.sendMessage('reset', {screen: screen});

       

            res.status(202);

            res.send('Reset signal sent.');

        } else {

            res.status(404);

            res.send('Screen not found.');

        }

    });



    // TODO : set tag of screen



    corsica.serveRoute('setTag', function(req, res) {

        var tag = req.query.tag || '';

        var name = req.query.name || '';

        var random = req.query.random;



        if (tag.length == 0) {

            res.status(400);

            return res.send('Expected tag and name.');

        }



        settings.get().then(function (curSettings) {

            var index = curSettings.tags.findIndex(e => e.name === tag);

            if (index == -1) {

                res.status(404);

                return res.send('Tag does not exist.');

            }



            if (name.length != 0) {

                if (curSettings.tags.findIndex(e => e.name === name) == -1)

                    curSettings.tags[index].name = name;

                else {

                    res.status(400);

                    return res.send('That name is already used in another tag.');

                }

            }

            if (random != undefined) {

                curSettings.tags[index].random = (random == 'true');

            }



            settings.set(curSettings).then(function() {

                res.status(202);

                res.send('Set new tag.');

            });

        });

    });



    corsica.serveRoute('addTag', function(req, res) {

        var tag = req.query.tag || '';

        var random = req.query.random == 'true' || !(req.query.random) ? true : false;



        settings.get().then(function (curSettings) {

            if (tag.length == 0) {

                tag = `tag${curSettings.tags.length}`;

            }



            let index = curSettings.tags.findIndex(e => e.name === tag);

            if (index != -1) {

                res.status(400);

                return res.send('That tag already exists.');

            }



            curSettings.tags.push({

                name: tag,

                random: random,

                commands: []

            });



            settings.set(curSettings).then(function() {

                res.send(202);

                res.send('Added new tag.');

            });

        });

    });    



    corsica.serveRoute('addCommand', function(req, res) {

        var tag = req.query.tag || '';

        var command = req.query.command || '';



        if (tag.length == 0 || command.length == 0) {

            res.status(400);

            return res.send('Expected tag and command.');

        }



        settings.get().then(function (curSettings) {

            let index = curSettings.tags.findIndex(e => e.name === tag);

            if (index == -1) {

                res.status(404);

                return res.send('Tag does not exist.');

            }



            curSettings.tags[index].commands.push(command);

            

            settings.set(curSettings).then(function() {

                res.status(202);

                res.send('Set settings.');

            });

        });

    });



    corsica.serveRoute('removeCommand', function(req, res) {

        var tag = req.query.tag || '';

        var command = req.query.command || '';



        if (tag.length == 0 || command.length == 0) {

            res.status(400);

            return res.send('Expected tag and command.');

        }



        settings.get().then(function (curSettings) {

            var index = curSettings.tags.findIndex(e => e.name === tag);

            if (index == -1) {

                res.status(404);

                return res.send('Tag does not exist.');

            }



            curSettings.tags[index].commands = curSettings.tags[index].commands.filter(cmd => { return cmd != command; } );;



            settings.set(curSettings).then(function() {

                res.status(202);

                res.send('Set settings.');

            });

        });

    });
    
    

    corsica.serveRoute('setScreenTag', function(req, res) {

        let tag = req.query.tag || '';

        let screen = req.query.screen || '';



        if (screen.length == 0 || tag.length == 0) {

            res.status(400);

            return res.send('Expected tag and screen.');

        }



        settings.get().then(function (curSettings) {

            let index = curSettings.tags.findIndex(e => e.name === tag);

            if (index == -1) {

                res.status(400);

                return res.send('Tag does not exist.');

            }



            corsica.sendMessage('tags.setSubscriptions', {name: screen, tags: [tag]}).then(() => {

              res.status(202);

              res.send('Set subscription.');

            });

        });

    });
        
    
    corsica.serveRoute('removeTag', function(req, res) {

      let tag = req.query.tag || '';



      if (tag.length == 0) {

          res.status(400);

          return res.send('Expected tag.');

      }



      settings.get().then(function (curSettings) {

          curSettings.tags = curSettings.tags.filter(e => e.name != tag);



          settings.set(curSettings).then(function() {

              res.status(202);

              res.send('Removed tags.');

          });

      });

  });
    
};