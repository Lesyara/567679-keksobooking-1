'use strict';

(function () {
  var PIN_MARK_HEIGHT = 22;
  var MESSAGE_TIMEOUT = 5000;

  var mainPinStartCoord = {};
  var pinContainer = document.querySelector('.map__pins');
  var mainPin = document.querySelector('.map__pin--main');
  var filterForm = document.querySelector('.map__filters');
  var mainPinImg = mainPin.children[0];
  var mainPinCoords = mainPin.getBoundingClientRect();
  var successMessage = document.querySelector('.success');

  var xMinMainPinSpace = pinContainer.offsetLeft + (mainPinCoords.width / 2);
  var xMaxMainPinSpace = pinContainer.offsetWidth - (mainPinCoords.width / 2);
  var yMinMainPinSpace = 150;
  var yMaxMainPinSpace = 500 - mainPinCoords.height;

  /**
    * Функция - обработчик события построения DOM-дерева. Присваивает объекту mainPinStartCoord
    * начальные координаты главного пина, деактивирует поля формы,
    * заполняет поле адреса.
    */
  var domContentLoadedHandler = function () {
    mainPinStartCoord = getCoord(mainPin, false);
    window.form.disableFormFields(window.form.AD_FORM);
    window.form.disableFormFields(filterForm);
    window.form.fillAddressField(mainPinStartCoord);
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
        x: (moveEvt.pageX > xMinMainPinSpace && moveEvt.pageX < xMaxMainPinSpace) ? startMouseCoords.x - moveEvt.pageX : 0,
        y: (moveEvt.pageY > yMinMainPinSpace && moveEvt.pageY < yMaxMainPinSpace) ? startMouseCoords.y - moveEvt.pageY : 0
      };

      startMouseCoords = {
        x: startMouseCoords.x - moveShift.x,
        y: startMouseCoords.y - moveShift.y
      };

      mainPin.style.top = (mainPin.offsetTop - moveShift.y) + 'px';
      mainPin.style.left = (mainPin.offsetLeft - moveShift.x) + 'px';
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
      window.form.fillAddressField(getCoord(mainPin, true));

      pinContainer.removeEventListener('mousemove', mainPinMouseMoveHandler);
      pinContainer.removeEventListener('mouseup', mainPinMouseUpHandler);
    };

    pinContainer.addEventListener('mousemove', mainPinMouseMoveHandler);
    pinContainer.addEventListener('mouseup', mainPinMouseUpHandler);
  };


  /**
   * Функция переведения страницы в активное состояние
   */
  var setPageActive = function () {
    if (window.map.mapContainer.classList.contains('map--faded')) {
      window.map.mapContainer.classList.remove('map--faded');
    }

    if (window.form.AD_FORM.classList.contains('ad-form--disabled')) {
      window.form.AD_FORM.classList.remove('ad-form--disabled');
    }

    window.backend.getData(successLoadHandler, window.map.serverCommunicationErrorHandler);
    window.form.setPriceValue();
    window.form.setUpBindSelectControls();
    window.form.enableFormFields(window.form.AD_FORM);
  };

  /**
   * Функция удаления всех меток объявлений с карты (кроме главной метки)
   */
  var removePins = function () {
    var mapPins = document.querySelectorAll('.map__pin');
    for (var i = 0; i < mapPins.length; i++) {
      if (pinContainer.contains(mapPins[i]) && mapPins[i] !== mainPin) {
        pinContainer.removeChild(mapPins[i]);
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
    window.map.pinsData = advertObjects;
    window.form.enableFormFields(filterForm);
    window.map.renderPins(advertObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  };


  /**
   *  Функция вывода сообщения об успешной отправке данных, показывает сообщение в течение 5 секунд
   */
  var showSuccessMessage = function () {
    successMessage.classList.remove('hidden');
    setTimeout(function () {
      successMessage.classList.add('hidden');
    }, MESSAGE_TIMEOUT);
  };


  window.map = {
    mapContainer: document.querySelector('.map'),
    pinsData: {},
    filterContainer: document.querySelector('.map__filters-container'),
    MAX_PIN_ON_MAP_NUMBER: 5,

    /**
     * Функция сброса данных страницы - сбрасывает введенные данные формы, восстанавливает состояние формы по умолчанию,
     * возвращает главный пин на исходную позицию, удаляет все похожие пины и карточки.
     */
    resetPageData: function () {
      window.form.AD_FORM.reset();
      window.form.setPriceValue();

      mainPin.style.top = mainPinStartCoord.y - mainPin.clientHeight + 'px';
      mainPin.style.left = mainPinStartCoord.x - mainPin.clientWidth + 'px';

      window.form.fillAddressField(mainPinStartCoord);
      window.form.resetPhotoElements();
      removePins();
      window.card.removeCards();

      setPageActive();
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
        pinContainer.appendChild(filledFragment);
      }
    },

    /**
   * Функция - обработчик события ошибки связи с севером, отображает сообщение с текстом ошибки
   * @param {*} errorMessage
   */
    serverCommunicationErrorHandler: function (errorMessage) {
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
    },

    /**
     * Функция - обработчик события успешной отправки данных на сервер.
     */
    successSendDataHandler: function () {
      window.map.resetPageData();
      showSuccessMessage();
    }
  };

  document.addEventListener('DOMContentLoaded', domContentLoadedHandler);
  mainPinImg.addEventListener('mousedown', mainPinMouseDownHandler);
})();
