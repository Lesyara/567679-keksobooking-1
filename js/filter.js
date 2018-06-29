'use strict';

(function () {
  var mapFilterHousingType = document.querySelector('select[name = housing-type]');
  var mapFilterHousingPrice = document.querySelector('select[name = housing-price]');
  var mapFilterHousingRooms = document.querySelector('select[name = housing-rooms]');
  var mapFilterHousingGuests = document.querySelector('select[name = housing-guests]');
  var mapFilterHousingFeatures = document.querySelectorAll('input[name = features].map__checkbox');

  var filterParameters = {
    'housingType': null,
    'priceInterval': null,
    'roomsNumber': null,
    'guestsNumber': null,
    'features': []
  };

  var priceIntervalValues = [10000, 50000];

  /**
   * Функция фильтрации объявлений с учетом заданных параметров.
   * @param {*} advertObjects
   * @return {*}
   */
  var filterObjects = function () {
    return window.map.pinsData.filter(function (pinData) {
      var isSuitableHouseType = (filterParameters['housingType'] === null || filterParameters['housingType'] === 'any') ? true : pinData.offer.type === filterParameters['housingType'];

      var priceInterval = filterParameters['priceInterval'];
      var isSuitablePrice = checkPriceInterval(priceInterval, pinData);

      var roomsNumber = filterParameters['roomsNumber'];
      var isSuitableRoomNumber = checkRoomNumber(roomsNumber, pinData);

      var guestsNumber = filterParameters['guestsNumber'];
      var isSuitableGuestNumber = checkGuestNumber(guestsNumber, pinData);

      var features = filterParameters['features'];
      var isSuitableFeatures = checkFeatures(features, pinData);

      return isSuitableHouseType && isSuitablePrice && isSuitableRoomNumber && isSuitableGuestNumber && isSuitableFeatures;
    });
  };

  /**
   * Функция проверки соответствия выбранного интервала цен и цены в данном объявлении
   * @param {*} interval - выбранный интервал цен в фильтре
   * @param {*} pinData - объект объявления
   * @return {*} isSuitable
   */
  var checkPriceInterval = function (interval, pinData) {
    var isSuitable = false;
    switch (interval) {
      case null:
        isSuitable = true;
        break;
      case 'any':
        isSuitable = true;
        break;
      case 'low':
        isSuitable = pinData.offer.price < priceIntervalValues[0];
        break;
      case 'middle':
        isSuitable = pinData.offer.price >= priceIntervalValues[0] && pinData.offer.price <= priceIntervalValues[1];
        break;
      case 'high':
        isSuitable = pinData.offer.price > priceIntervalValues[1];
        break;
    }
    return isSuitable;
  };

  /**
   * Функция проверки соответствия выбранного количества комнат и кол-ва комнат в данном объявлении
   * @param {*} rooms - выбранное кол-во комнат в фильтре
   * @param {*} pinData - объект объявления
   * @return {*} isSuitable
   */
  var checkRoomNumber = function (rooms, pinData) {
    var isSuitable = false;
    switch (rooms) {
      case null:
        isSuitable = true;
        break;
      case 'any':
        isSuitable = true;
        break;
      default:
        isSuitable = (pinData.offer.rooms === parseInt(filterParameters['roomsNumber'], 10));
        break;
    }
    return isSuitable;
  };

  /**
   * Функция проверки соответствия выбранного количества гостей и кол-ва гостей в данном объявлении
   * @param {*} guests - выбранное кол-во гостей в фильтре
   * @param {*} pinData - объект объявления
   * @return {*} isSuitable
   */
  var checkGuestNumber = function (guests, pinData) {
    var isSuitable = false;
    switch (guests) {
      case null:
        isSuitable = true;
        break;
      case 'any':
        isSuitable = true;
        break;
      default:
        isSuitable = (pinData.offer.guests === parseInt(filterParameters['guestsNumber'], 10));
    }
    return isSuitable;
  };

  /**
   * Функция проверки соответствия выбранных доп.характеристик и характеристик данного объявления
   * @param {*} features - выбранные доп.характеристики в фильтре
   * @param {*} pinData - объект объявления
   * @return {*} isSuitable
   */
  var checkFeatures = function (features, pinData) {
    var isSuitable = true;
    features.forEach(function (item) {
      var isSuitableFeature = (pinData.offer.features.includes(item));
      isSuitable = isSuitable && isSuitableFeature;
    });
    return isSuitable;
  };

  /**
   * Функция - обработчик события изменения поля Тип жилья (с примененной оптимизацией
   * "устранение дребезга" - debounce).
   */
  var mapFilterHousingTypeChange = window.optimization.debounce(function (evt) {
    filterParameters.housingType = evt.target.value;
    var filteredObjects = filterObjects();
    window.map.renderPins(filteredObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  });

  /**
   * Функция - обработчик события изменения поля Цена жилья (с примененной оптимизацией
   * "устранение дребезга" - debounce).
   */
  var mapFilterHousingPriceChange = window.optimization.debounce(function (evt) {
    filterParameters.priceInterval = evt.target.value;
    var filteredObjects = filterObjects();
    window.map.renderPins(filteredObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  });

  /**
   * Функция - обработчик события изменения поля Количество комнат (с примененной оптимизацией
   * "устранение дребезга" - debounce).
   */
  var mapFilterHousingRoomsChange = window.optimization.debounce(function (evt) {
    filterParameters.roomsNumber = evt.target.value;
    var filteredObjects = filterObjects();
    window.map.renderPins(filteredObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  });

  /**
   * Функция - обработчик события изменения поля Количество гостей (с примененной оптимизацией
   * "устранение дребезга" - debounce).
   */
  var mapFilterHousingGuestsChange = window.optimization.debounce(function (evt) {
    filterParameters.guestsNumber = evt.target.value;
    var filteredObjects = filterObjects();
    window.map.renderPins(filteredObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  });

  /**
   * Функция - обработчик события изменения поля доп.характеристики (с примененной оптимизацией
   * "устранение дребезга" - debounce).
   */
  var mapFilterHousingFeaturesChange = window.optimization.debounce(function (evt) {
    var fIndex = filterParameters.features.indexOf(evt.target.value);
    if (evt.target.checked && fIndex === -1) {
      filterParameters.features.push(evt.target.value);
    } else {
      if (fIndex !== -1) {
        filterParameters.features.splice(fIndex, 1);
      }
    }
    var filteredObjects = filterObjects();
    window.map.renderPins(filteredObjects, window.map.MAX_PIN_ON_MAP_NUMBER);
  });

  mapFilterHousingType.addEventListener('change', mapFilterHousingTypeChange);
  mapFilterHousingPrice.addEventListener('change', mapFilterHousingPriceChange);
  mapFilterHousingRooms.addEventListener('change', mapFilterHousingRoomsChange);
  mapFilterHousingGuests.addEventListener('change', mapFilterHousingGuestsChange);
  mapFilterHousingFeatures.forEach(function (checkboxElem) {
    checkboxElem.addEventListener('change', mapFilterHousingFeaturesChange);
  });
})();
