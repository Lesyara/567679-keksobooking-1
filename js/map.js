'use strict';

(function () {
  var MAP_PINS = document.querySelector('.map__pins');
  var MAIN_PIN = document.querySelector('.map__pin--main');
  var FILTER_FORM = document.querySelector('.map__filters');
  var MAIN_PIN_IMG = MAIN_PIN.children[0];
  var MAIN_PIN_COORDS = MAIN_PIN.getBoundingClientRect();
  var MAIN_PIN_START_COORDS = {};
  var SUCCESS_MESSAGE = document.querySelector('.success');
  var PIN_MARK_HEIGHT = 22;
  var MESSAGE_TIMEOUT = 5000;

  var X_MIN_MAIN_PIN_SPACE = MAP_PINS.offsetLeft + (MAIN_PIN_COORDS.width / 2);
  var X_MAX_MAIN_PIN_SPACE = MAP_PINS.offsetWidth - (MAIN_PIN_COORDS.width / 2);
  var Y_MIN_MAIN_PIN_SPACE = 150;
  var Y_MAX_MAIN_PIN_SPACE = 500 - MAIN_PIN_COORDS.height;

  var PAGE_ACTIVE = false;

  /**
    * Функция - обработчик события построения DOM-дерева. Присваивает объекту MAIN_PIN_START_COORDS
    * начальные координаты главного пина, деактивирует поля формы,
    * заполняет поле адреса.
    */
  var DOMContentLoadedHandler = function () {
    MAIN_PIN_START_COORDS = getCoord(MAIN_PIN, false);
    window.form.disableFormFields(window.form.AD_FORM);
    window.form.disableFormFields(FILTER_FORM);
    window.form.fillAddressField(MAIN_PIN_START_COORDS);
  };

  /**
     * Функция получения координат метки из атрибута style
     * @param {*} pinObject - объект метки
     * @param {*} isObjectActive - параметр активной метки, в зависимости
     * от него берется нижняя или центральная координата
     * @return {object}
     */
  var getCoord = function (pinObject, isObjectActive) {
    var coord = {};
    coord.x = Math.floor(parseInt(pinObject.style['left'], 10) + (pinObject.clientWidth / 2));
    if (isObjectActive) {
      coord.y = Math.floor(parseInt(pinObject.style['top'], 10) + pinObject.clientHeight + PIN_MARK_HEIGHT);
    } else {
      coord.y = Math.floor(parseInt(pinObject.style['top'], 10) + (pinObject.clientHeight / 2));
    }
    return coord;
  };

  /**
     * Функция - обработчик события нажатия кнопки мыши, устанавливает начальные координаты
     * для перемещения, добавляет обработчики событий перемещения указателя и отпускания кнопки мыши
     * @param {*} evt
     */
  var mainPinMouseDownHandler = function (evt) {
    evt.preventDefault();

    var startMouseCoords = {
      x: evt.pageX,
      y: evt.pageY
    };

    /**
     * Функция - обработчик события перемещения указателя мыши, расчитывает смещение относительно
     * начальных координат, обеспечивает ограничение положения метки, обновляет координаты метки
     * @param {*} moveEvt
     */
    var mainPinMouseMoveHandler = function (moveEvt) {
      moveEvt.preventDefault();

      var moveShift = {
        x: (moveEvt.pageX > X_MIN_MAIN_PIN_SPACE && moveEvt.pageX < X_MAX_MAIN_PIN_SPACE) ? startMouseCoords.x - moveEvt.pageX : 0,
        y: (moveEvt.pageY > Y_MIN_MAIN_PIN_SPACE && moveEvt.pageY < Y_MAX_MAIN_PIN_SPACE) ? startMouseCoords.y - moveEvt.pageY : 0
      };

      startMouseCoords = {
        x: startMouseCoords.x - moveShift.x,
        y: startMouseCoords.y - moveShift.y
      };

      MAIN_PIN.style.top = (MAIN_PIN.offsetTop - moveShift.y) + 'px';
      MAIN_PIN.style.left = (MAIN_PIN.offsetLeft - moveShift.x) + 'px';
    };

    /**
     * Функция - обработчик события отпускания кнопки мыши, снимает обработчики событий
     * перемещения указателя и отпускания кнопки мыши, активирует страницу, заполняет поле адреса,
     * генерирует объекты объявлений и добавляет их на страницу.
     * @param {*} mouseUpEvt
     */
    var mainPinMouseUpHandler = function (mouseUpEvt) {
      mouseUpEvt.preventDefault();
      setPageActive();
      window.form.fillAddressField(getCoord(MAIN_PIN, true));

      MAP_PINS.removeEventListener('mousemove', mainPinMouseMoveHandler);
      MAP_PINS.removeEventListener('mouseup', mainPinMouseUpHandler);
    };

    MAP_PINS.addEventListener('mousemove', mainPinMouseMoveHandler);
    MAP_PINS.addEventListener('mouseup', mainPinMouseUpHandler);
  };


  /**
   * Функция переведения страницы в активное состояние
   */
  var setPageActive = function () {
    if (!PAGE_ACTIVE) {
      if (window.map.MAP.classList.contains('map--faded')) {
        window.map.MAP.classList.remove('map--faded');
      }

      if (window.form.AD_FORM.classList.contains('ad-form--disabled')) {
        window.form.AD_FORM.classList.remove('ad-form--disabled');
      }

      window.backend.getData(successLoadHandler, errorLoadHandler);
      window.form.setPriceValue();
      window.form.enableFormFields(window.form.AD_FORM);
      PAGE_ACTIVE = true;
    }
  };

  /**
   * Функция удаления всех меток объявлений с карты (кроме главной метки)
   */
  var removePins = function () {
    var mapPins = document.querySelectorAll('.map__pin');
    for (var i = 0; i < mapPins.length; i++) {
      if (MAP_PINS.contains(mapPins[i]) && mapPins[i] !== MAIN_PIN) {
        MAP_PINS.removeChild(mapPins[i]);
      }
    }
  };

  /**
     * Функция генерации в цикле меток объявлений из массива объектов объявлений
     * @param {object} pinFillObjects
     * @param {*} pinObjectNumber
     * @return {object}
     */
  var generatePins = function (pinFillObjects, pinObjectNumber) {
    var generatedPins = [];
    if (pinFillObjects.length <= pinObjectNumber) {
      pinObjectNumber = pinFillObjects.length;
    }
    for (var j = 0; j < pinObjectNumber; j++) {
      generatedPins[j] = window.pin.renderOnePin(pinFillObjects[j]);
    }
    return generatedPins;
  };

  /**
   * Функция создания и заполения фрагмента метками
   * @param {object} pinObjects
   * @return {fragment} fragment
   */
  var fillFragment = function (pinObjects) {
    var fragment = {};
    if (pinObjects.length !== 0) {
      fragment = document.createDocumentFragment();
      changeCoords(pinObjects);
      var pinNumber = pinObjects.length || 1;

      for (var i = 0; i < pinNumber; i++) {
        fragment.appendChild(pinObjects[i]);
      }
    } else {
      fragment = null;
    }
    return fragment;
  };

  /**
   * Функция коррекции координат меток объявлений -
   * x y указывают на острый конец метки, должны - на левый верхний угол
   * Запись результата в атрибут style
   * @param {object} pinsObjects
   */
  var changeCoords = function (pinsObjects) {
    for (var i = 0; i < pinsObjects.length; i++) {
      var pinWidth = pinsObjects[i].clientWidth;
      var pinHeight = pinsObjects[i].clientHeight;
      var locationX = parseInt(pinsObjects[i].style.left, 10);
      var locationY = parseInt(pinsObjects[i].style.top, 10);

      pinsObjects[i].style = 'left:' + (locationX - pinWidth / 2) + 'px; top:' + (locationY - pinHeight) + 'px;';
    }
  };


  /**
   * Функция - обработчик события успешной загрузки данных с сервера, генерирует пины на основе
   * полученных данных и добавляет их в разметку.
   * @param {*} advertObjects
   */
  var successLoadHandler = function (advertObjects) {
    window.map.PINS_DATA = advertObjects;
    window.form.enableFormFields(FILTER_FORM);
    window.map.renderPins(advertObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  };


  /**
   * Функция - обработчик события ошибки при загрузке данных с сервера, отображает сообщение с текстом ошибки
   * @param {*} errorMessage
   */
  var errorLoadHandler = function (errorMessage) {
    var node = document.createElement('div');
    node.style = 'z-index: 100; margin: 0 auto; text-align: center; background-color: red; color: white';
    node.style.position = 'absolute';
    node.style.left = 0;
    node.style.right = 0;
    node.style.fontSize = '30px';

    node.textContent = errorMessage;
    var errorMessageDiv = document.body.insertAdjacentElement('afterbegin', node);
    setTimeout(function () {
      errorMessageDiv.remove();
    }, MESSAGE_TIMEOUT);
  };

  /**
   *  Функция вывода сообщения об успешной отправке данных, показывает сообщение в течение 5 секунд
   */
  var showSuccessMessage = function () {
    SUCCESS_MESSAGE.classList.remove('hidden');
    setTimeout(function () {
      SUCCESS_MESSAGE.classList.add('hidden');
    }, MESSAGE_TIMEOUT);
  };


  window.map = {
    MAP: document.querySelector('.map'),
    PINS_DATA: {},
    FILTER_CONTAINER: document.querySelector('.map__filters-container'),
    MAX_PIN_ON_MAP_NUMBER: 5,

    /**
     * Функция сброса данных страницы - сбрасывает введенные данные формы, восстанавливает состояние формы по умолчанию,
     * возвращает главный пин на исходную позицию, удаляет все похожие пины и карточки.
     */
    resetPageData: function () {
      window.form.AD_FORM.reset();
      window.form.setPriceValue();

      MAIN_PIN.style.top = MAIN_PIN_START_COORDS.y - MAIN_PIN.clientHeight + 'px';
      MAIN_PIN.style.left = MAIN_PIN_START_COORDS.x - MAIN_PIN.clientWidth + 'px';

      window.form.fillAddressField(MAIN_PIN_START_COORDS);
      window.form.resetPhotoElements();
      removePins();
      window.card.removeCards();
    },

    /**
     * Функция отрисовки меток на карте
     * @param {*} adObjects - объекты меток
     * @param {*} pinNumber - количество пинов
     */
    renderPins: function (adObjects, pinNumber) {
      removePins();
      window.card.removeCards();
      var pins = generatePins(adObjects, pinNumber);

      for (var i = 0; i < pins.length; i++) {
        var currentPin = pins[i];
        currentPin.addEventListener('click', window.card.callbackRenderCard(adObjects[i]));
        currentPin.addEventListener('keydown', function (evt) {
          if (evt.keyCode === window.card.KEY_CODE.ENTER) {
            currentPin.classList.remove('hidden');
          }
        });
      }

      var filledFragment = fillFragment(pins);
      if (filledFragment !== null) {
        MAP_PINS.appendChild(filledFragment);
      }
    },

    /**
     * Функция - обработчик события успешной отправки данных на сервер.
     */
    successSendDataHandler: function () {
      window.map.resetPageData();
      showSuccessMessage();
    }
  };

  document.addEventListener('DOMContentLoaded', DOMContentLoadedHandler);
  MAIN_PIN_IMG.addEventListener('mousedown', mainPinMouseDownHandler);
})();
