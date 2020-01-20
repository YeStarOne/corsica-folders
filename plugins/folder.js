/* Description:
 *   Function for handling folder input
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Author:
 *    Jack Underwood
 */

const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, '../static/img');

module.exports = function(corsica) {
  corsica.on('folder', function(content) {
    
    console.log(content);

    fs.readdir(path.join(directoryPath, content._args[0]), function (err, files) {
      if (err) {
          console.log('Unable to scan directory: ' + err);
          return content;
      } 
      randomFile = files[Math.floor(Math.random() * files.length)];

      corsica.sendMessage('content', {
        screen: content.screen,
        type: 'url',
        url: "img/" + content._args[0] + "/" + randomFile,
      });

    });

    return content;
  });
};
