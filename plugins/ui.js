module.exports = function (corsica) {
    var useCommand = corsica.config.plugins.iOf('command') >= 0;

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
  
    var insecurescrub = function(str) {
      return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
  
    corsica.serveRoute('ui', function(request, response) {
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
        
        Object.keys(subscriptions).forEach(function(subscriber, i) {
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
        response.send(out);
      });
    });

    corsica.serveRoute('addCommand', function(request, response) {
        var tag = request.query.tag || '';
        var command = request.query.command || '';
        settings.get().then(function (currentSettings) {
            var i = currentSettings.tags.findi(e => e.name === tag);
            if (i == -1) {
                return response.send('No matching tag.');
            }
            currentSettings.tags[i].commands.push(command);
            settings.set(currentSettings).then(function() {
                response.send('Added command.');
            });
        });
    });

    corsica.serveRoute('removeCommand', function(request, response) {
        var tag = request.query.tag || '';
        var command = request.query.command || '';
        settings.get().then(function (currentSettings) {
            var i = currentSettings.tags.findi(e => e.name === tag);
            if (i == -1) {
                return response.send('No matching tag.');
            }
            currentSettings.tags[i].commands = currentSettings.tags[i].commands.filter(cmd => { 
                return cmd != command; 
            });
            settings.set(currentSettings).then(function() {
                response.send('Removed command.');
            });
        });
    });

    corsica.serveRoute('setTag', function(request, response) {
        var tag = request.query.tag || '';
        var name = request.query.name || '';
        var random = request.query.random;
        settings.get().then(function (currentSettings) {
            var i = currentSettings.tags.findi(e => e.name === tag);
            if (i == -1) {
                return response.send('No matching tag.');
            }
            if (name.length != 0) {
                if (currentSettings.tags.findi(e => e.name === name) == -1)
                currentSettings.tags[i].name = name;
                else {
                    return response.send('Tag name already exists.');
                }
            }
            if (random != undefined) {
                if(random == 'true') {
                    currentSettings.tags[i].random = true;
                } else {
                    currentSettings.tags[i].random = false;
                }
            }
            settings.set(currentSettings).then(function() {
                response.send('Updated tag.');
            });
        });
    });

    corsica.serveRoute('addTag', function(request, response) {
        var tag = request.query.tag || '';
        var random = request.query.random == 'true' || !(request.query.random) ? true : false;
        settings.get().then(function (currentSettings) {
            if (tag.length == 0) { //No tag passed, make up new name
                tag = `tag` + Math.random().toString();
                var i = currentSettings.tags.findi(e => e.name === tag);
                while (i == -1) {
                    tag = `tag` + Math.random().toString();
                    let i = currentSettings.tags.findi(e => e.name === tag); 
                }
            }
            let i = currentSettings.tags.findi(e => e.name === tag);
            if (i != -1) {
                return response.send('Tag name already exists.');
            }
            currentSettings.tags.push({
                name: tag,
                random: random,
                commands: []
            });
            settings.set(currentSettings).then(function() {
                response.send('Added tag.');
            });
        });
    });  

    corsica.serveRoute('removeTag', function(request, response) {
        var tag = request.query.tag || '';
        settings.get().then(function (currentSettings) {
            currentSettings.tags = currentSettings.tags.filter(e => e.name != tag);
            settings.set(currentSettings).then(function() {
                response.send('Removed tag.');
            });
        });
    });

    corsica.serveRoute('responseetScreen', function(request, response) {
        var screen = request.query.screen || '';
        if (subscriptions[screen]) {
            corsica.sendMessage('reset', {screen: screen});
            response.send('Resetting ' + screen);

        } else {
            response.send('No matching screen.');
        }
    });
    
    corsica.serveRoute('setScreenTag', function(request, response) {
        var tag = request.query.tag || '';
        var screen = request.query.screen || '';
        settings.get().then(function (currentSettings) {
            var i = currentSettings.tags.findi(e => e.name === tag);
            if (i == -1) {
                return response.send('No matching tag.');
            }
            corsica.sendMessage('tags.setSubscriptions', {name: screen, tags: [tag]}).then(() => {
              response.send('Set screen tag.');
            });
        });
    });
};