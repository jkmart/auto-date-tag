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

  const anyMatchRegex = (arr, regex) => {
    return arr.some(e => regex.test(e));
  };

  exports.startup = function () {

    const config = {};
    config.dateFormat = 'YYYY 0MM 0DD';
    config.dateRegex = /^[\d]{4}\s[\d]{2}\s[\d]{2}$/.compile();

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
        if (/^Draft of|^\$:\//.test(title)) {
          return;
        }
        // Omit system tiddlers without modified field
        if (!changes[title].modified) {
          return;
        }

        // Add it to the cache

        cache[title] = true;
        let tiddler = $tw.wiki.getTiddler(title).fields;

        let tags;
        let newTags = [now];

        if (!tiddler.tags) {
          tags = newTags;
        } else if (tiddler.tags.indexOf(now) === -1 || !anyMatchRegex(tiddler.tags, config.dateRegex)) {
          tags = newTags.concat(tiddler.tags);
        } else {
          tags = tiddler.tags;
        }
        tiddlers.push(new $tw.Tiddler(tiddler, {tags: tags}));

      });
      $tw.wiki.addTiddlers(tiddlers);
    }

    $tw.wiki.addEventListener('change', dateTag);

  };

})();
