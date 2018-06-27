'use strict';

(function () {
  var PIN_TEMPLATE = document.querySelector('template').content.querySelector('.map__pin');

  /**
   * Функция генерации метки на основе шаблона для одного объявления
   * @param {object} fillObject
   * @return {Node} pin
   */
  window.pin = {
    renderOnePin: function (fillObject) {
      var pin = PIN_TEMPLATE.cloneNode(true);
      if (pin.hasChildNodes) {
        for (var i = 0; i < pin.childNodes.length; i++) {
          pin.childNodes[i].src = fillObject.author.avatar;
          pin.childNodes[i].alt = fillObject.offer.title;
          pin.style = 'left:' + fillObject.location.x + 'px; top:' + fillObject.location.y + 'px;';
        }
      }
      return pin;
    }
  };
})();

