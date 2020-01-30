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
      var out = '<html> <head> <link href="https://fonts.googleapis.com/css?family=Nunito&display=swap" rel="stylesheet"> <link rel="stylesheet" type="text/css" href="css/style.css"> <script src="js/ui.js"> </script></head> <body> <header> <img id="logo" src="corsica.png"> <h1 id="title">Development Suite</h1> </header> <div class="content">';
      settings.get().then(function (settings) {
        out += '<div class="settings"><h2>Tags</h2>';
        
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

        out += '</div> <div class="settings"><h2>Subscriptions</h2>';
        
        Object.keys(subscriptions).forEach(function(subscriber, index) {
            out += "<h3>" + subscriber + "</h3>";
            out += "<button onclick=" + '"';
            out += "resetScreen('" + subscriber + "')";
            out += '"' + ">Refresh Screen</button><br>";
            subscriptions[subscriber].forEach(function(tag) {
                out += "<label>Tag</label> <input type='text' id='tag" + subscriber + "' onfocusout=" + '"';
                out += "setScreenTag('" + subscriber + "')";
                out += '"' + "value='" + tag + "'><br>";

            });
        });
        out += '</div></div></body></html>';
        res.send(out);
      });
    });
};