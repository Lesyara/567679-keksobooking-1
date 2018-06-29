'use strict';

(function () {
  var DEBOUNCE_INTERVAL = 500;

  window.optimization = {
    debounce: function (func) {
      var timeoutSet = null;

      return function () {
        var args = arguments;
        if (timeoutSet) {
          window.clearTimeout(timeoutSet);
        }
        timeoutSet = window.setTimeout(function () {
          func.apply(null, args);
        }, DEBOUNCE_INTERVAL);
      };
    }
  };
}
)();
