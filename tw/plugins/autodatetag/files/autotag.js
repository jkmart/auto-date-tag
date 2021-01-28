/*\
title: $:/plugins/jkmart/autodatetag/lib/autotag.js
type: application/javascript
module-type: startup
\*/

(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  'use strict';

  exports.name = 'autodatetag';
  exports.after = ['startup'];
  exports.platforms = ['browser'];
  exports.synchronous = true;

  const cache = {};

  exports.startup = function () {

    const config = {};
    config.dateFormat = 'YYYY0MM0DD';

    function dateTag(changes) {
      let now = $tw.utils.formatDateString(new Date, config.dateFormat);
      let tiddlers = [];

      $tw.utils.each(changes, function (tidInfo, title) {
        // Prevent looping
        if (cache[title]) {
          delete cache[title];
          return;
        }

        // Check if tiddler is draft
        if (!/^Draft of|^\$:\//.test(title) && changes[title].modified) {
          let tiddler = $tw.wiki.getTiddler(title).fields;

          cache[title] = true;

          let tags;
          let newTags = [now];

          if (!tiddler.tags) {
            tags = newTags;
          } else if (tiddler.tags.indexOf(now) === -1) {
            tags = newTags.concat(tiddler.tags);
          } else {
            tags = tiddler.tags;
          }
          tiddlers.push(new $tw.Tiddler(tiddler, {tags: tags}));
        }

      });
      $tw.wiki.addTiddlers(tiddlers);
    }

    $tw.wiki.addEventListener('change', dateTag);

  };

})();
