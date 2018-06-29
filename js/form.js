'use strict';

(function () {
  var APPARTMENT_MIN_PRICES = {
    'bungalo': 0,
    'flat': 1000,
    'house': 5000,
    'palace': 10000
  };

  var ROOM_NUMBER_AND_CAPACITY = {
    '1': [1],
    '2': [1, 2],
    '3': [1, 2, 3],
    '100': [0]
  };

  var IMAGE_TYPES = ['jpeg', 'jpg', 'png', 'gif', 'svg'];
  var TITLE_MIN_LENGTH = 30;
  var TITLE_MAX_LENGTH = 100;
  var DEFAULT_ROOM_NUMBER = 1;
  var APPARTMENT_PRICE_MAX_VALUE = 1000000;
  var HEADER_PHOTO_INPUT_NAME = 'ad-form-header__input';
  var APPARTMENT_PHOTO_INPUT_NAME = 'ad-form__input';


  var titleInput = document.querySelector('.ad-form input[name="title"]');
  var addressInput = document.querySelector('.ad-form input[name="address"]');
  var appartmentTypeInput = document.querySelector('.ad-form select[name="type"]');
  var appartmentPriceInput = document.querySelector('.ad-form input[name="price"]');
  var timeInInput = document.querySelector('.ad-form select[name="timein"]');
  var timeOutInput = document.querySelector('.ad-form select[name="timeout"]');
  var roomsNumberInput = document.querySelector('.ad-form select[name="rooms"]');
  var roomsCapacityInput = document.querySelector('.ad-form select[name="capacity"]');
  var resetFormButton = document.querySelector('button.ad-form__reset');
  var avatarPhotoInput = document.querySelector('.ad-form-header__input');
  var appartmentPhotoInput = document.querySelector('.ad-form__input');
  var avatarPhotoImage = document.querySelector('.ad-form-header__preview img');
  var appartmentPhotoImageContainer = document.querySelector('.ad-form__photo');

  /**
   * Функция связывает значение в поле Тип жилья со значением в поле Цена за ночь.
   * @param {*} currentType - выбранный тип жилья
   */
  var bindAppartmentTypeAndPrice = function (currentType) {
    if (currentType === null) {
      currentType = appartmentTypeInput.value;
    }
    appartmentPriceInput.min = APPARTMENT_MIN_PRICES[currentType];
    appartmentPriceInput.value = APPARTMENT_MIN_PRICES[currentType];
    appartmentPriceInput.placeholder = APPARTMENT_MIN_PRICES[currentType];
  };

  /**
   * Функция - обработчик события выбора значения Типа жилья.
   * @param {*} evt
   */
  var appartmentTypeInputHandler = function (evt) {
    bindAppartmentTypeAndPrice(evt.currentTarget.value);
  };

  /**
   * Функция - обработчик выбора значения Времени заезда. Связывает значение со значением поля
   *  Времени выезда.
   * @param {*} evt
   */
  var timeInInputHandler = function (evt) {
    timeOutInput.value = evt.currentTarget.value;
  };

  /**
   * Функция - обработчик выбора значения Времени выезда. Связывает значение со значением поля
   * Времени заезда.
   * @param {*} evt
   */
  var timeOutInputHandler = function (evt) {
    timeInInput.value = evt.currentTarget.value;
  };

  var bindRoomsNumberAndCapacity = function (currentNumber) {
    if (currentNumber === null) {
      currentNumber = DEFAULT_ROOM_NUMBER;
    }
    var optionsToLeaveValues = ROOM_NUMBER_AND_CAPACITY[currentNumber];
    var optionsTotalNumber = roomsCapacityInput.children.length;
    var roomsCapacityInputOptions = roomsCapacityInput.children;

    for (var i = 0; i < optionsTotalNumber; i++) {
      if (!optionsToLeaveValues.includes(parseInt(roomsCapacityInputOptions[i].value, 10))) {
        roomsCapacityInputOptions[i].setAttribute('disabled', 'disabled');
      } else {
        if (roomsCapacityInputOptions[i].hasAttribute('disabled')) {
          roomsCapacityInputOptions[i].removeAttribute('disabled');
        }
        if (roomsCapacityInputOptions[i].hasAttribute('selected')) {
          roomsCapacityInputOptions[i].removeAttribute('selected');
        }
        if (parseInt(roomsCapacityInputOptions[i].value, 10) === optionsToLeaveValues[0]) {
          roomsCapacityInputOptions[i].setAttribute('selected', 'selected');
        }
      }
    }
  };


  /**
   * Функция - обработчик события выбора значения Количества комнат. Связывает это значение
   * со значением поля Количество мест по заданной схеме.
   * @param {*} evt
   */
  var roomsNumberInputHandler = function (evt) {
    bindRoomsNumberAndCapacity(evt.currentTarget.value);
  };


  var photoInputChangeHandler = function (evt) {
    var photoFiles = evt.currentTarget.files;
    if (photoFiles.length > 0) {
      for (var i = 0; i < photoFiles.length; i++) {
        var fileName = photoFiles[i].name.toLowerCase();
        var typeMatches = IMAGE_TYPES.some(function matchType(type) {
          return fileName.endsWith(type);
        });
        if (typeMatches) {
          readFromFile(evt.currentTarget.className, photoFiles[i]);
        }
      }
    }
  };

  var createPhotoElement = function (srcContent) {
    var newPhoto = document.createElement('img');
    newPhoto.width = 40;
    newPhoto.setAttribute('height', 'auto');
    newPhoto.src = srcContent;
    return newPhoto;
  };

  var readFromFile = function (destClassName, file) {
    var inputClassName = destClassName.split(' ')[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.addEventListener('load', function () {
      if (inputClassName === HEADER_PHOTO_INPUT_NAME) {
        avatarPhotoImage.setAttribute('height', 'auto');
        avatarPhotoImage.src = reader.result;
      }
      if (inputClassName === APPARTMENT_PHOTO_INPUT_NAME) {
        if (appartmentPhotoImageContainer.childNodes.length === 0) {
          appartmentPhotoImageContainer.style.display = 'flex';
          appartmentPhotoImageContainer.style.alignItems = 'center';
          appartmentPhotoImageContainer.style.justifyContent = 'center';
          var photoElem = createPhotoElement(reader.result);
          appartmentPhotoImageContainer.appendChild(photoElem);
        } else {
          var newPhotoContainer = appartmentPhotoImageContainer.cloneNode();
          newPhotoContainer.style.display = 'flex';
          newPhotoContainer.style.alignItems = 'center';
          newPhotoContainer.style.justifyContent = 'center';
          photoElem = createPhotoElement(reader.result);
          newPhotoContainer.appendChild(photoElem);
          appartmentPhotoImageContainer.insertAdjacentElement('afterend', newPhotoContainer);
        }
      }
    });
  };

  window.form = {
    AD_FORM: document.querySelector('.ad-form'),

    /**
     * Функция - обработчик события подтверждения формы. Вызывает функцию отправки данных формы.
     *  Устанавливает значение полю Адрес из плейсхолдера.
     * @param {*} evt
    */
    adFormSubmitHandler: function (evt) {
      evt.preventDefault();

      if (!addressInput.value) {
        addressInput.value = addressInput.placeholder;
      }
      window.backend.sendData(new FormData(window.form.AD_FORM), window.map.successSendDataHandler, window.map.serverCommunicationErrorHandler);
    },

    /**
     * Функция - обработчик события сброса формы.
     * @param {*} evt
    */
    resetFormButtonClickHandler: function (evt) {
      evt.preventDefault();
      window.map.resetPageData();
    },

    /**
     * Функция восстанавливает верное значение в поле Цена за ночь после ресета формы
     */
    setPriceValue: function () {
      if (!appartmentPriceInput.value) {
        bindAppartmentTypeAndPrice(null);
        appartmentPriceInput.value = appartmentPriceInput.placeholder;
      }
    },

    setUpBindSelectControls: function () {
      bindAppartmentTypeAndPrice(null);
      bindRoomsNumberAndCapacity(null);
    },

    resetPhotoElements: function () {
      avatarPhotoImage.src = 'img/muffin-grey.svg';
      var appartmentPhotoImageContainers = document.querySelectorAll('.ad-form__photo');
      if (appartmentPhotoImageContainers) {
        var photoElementsCount = appartmentPhotoImageContainers.length;
        var num = photoElementsCount;
        while (num > 1) {
          appartmentPhotoImageContainers.item(num - 1).remove();
          num--;
        }

        if (appartmentPhotoImageContainers[0].childNodes.length > 0) {
          appartmentPhotoImageContainers[0].removeChild(appartmentPhotoImageContainers[0].childNodes[0]);
        }

      }
    },

    /**
   * Функция деактивации полей формы - установка атрибута 'disabled' у fieldset.
   * @param {*} enabledForm
   */
    disableFormFields: function (enabledForm) {
      var fieldsToDisable = enabledForm.querySelectorAll('fieldset, select');
      for (var i = 0; i < fieldsToDisable.length; i++) {
        fieldsToDisable[i].setAttribute('disabled', 'disabled');
      }
    },

    /**
   * Функция активации полей формы - снятие атрибута 'disabled' у fieldset.
   * @param {*} disabledForm
   */
    enableFormFields: function (disabledForm) {
      var fieldsToEnable = disabledForm.querySelectorAll('fieldset, select');

      for (var j = 0; j < fieldsToEnable.length; j++) {
        if (fieldsToEnable[j].hasAttribute('disabled')) {
          fieldsToEnable[j].removeAttribute('disabled');
        }
      }
    },

    /**
   * Функция заполнения поля адреса
   * @param {*} fieldData
   */
    fillAddressField: function (fieldData) {
      addressInput.setAttribute('placeholder', (fieldData.x + ', ' + fieldData.y));
    }
  };

  titleInput.addEventListener('input', function () {
    titleInput.checkValidity();
  });

  titleInput.addEventListener('invalid', function () {
    if (titleInput.validity.tooShort) {
      titleInput.setCustomValidity('Минимальная длина — ' + TITLE_MIN_LENGTH + ' символов');
      titleInput.style.border = '3px solid red';
    } else if (titleInput.validity.tooLong) {
      titleInput.setCustomValidity('Максимальная длина — ' + TITLE_MAX_LENGTH + ' символов');
      titleInput.style.border = '3px solid red';
    } else if (titleInput.validity.valueMissing) {
      titleInput.setCustomValidity('Это обязательное поле');
      titleInput.style.border = '3px solid red';
    } else {
      titleInput.setCustomValidity('');
      titleInput.style.border = 'none';
    }
  });

  appartmentPriceInput.addEventListener('change', function () {
    appartmentPriceInput.checkValidity();
  });

  appartmentPriceInput.addEventListener('invalid', function () {
    if (appartmentPriceInput.validity.rangeOverflow) {
      appartmentPriceInput.setCustomValidity('Максимальное значение — ' + APPARTMENT_PRICE_MAX_VALUE);
      appartmentPriceInput.style.border = '3px solid red';
    } else if (appartmentPriceInput.validity.typeMismatch) {
      appartmentPriceInput.setCustomValidity('Это числовое поле');
      appartmentPriceInput.style.border = '3px solid red';
    } else if (appartmentPriceInput.validity.valueMissing) {
      appartmentPriceInput.setCustomValidity('Это обязательное поле');
      appartmentPriceInput.style.border = '3px solid red';
    } else {
      appartmentPriceInput.setCustomValidity('');
      appartmentPriceInput.style.border = 'none';
    }
  });


  avatarPhotoInput.addEventListener('change', photoInputChangeHandler);
  appartmentPhotoInput.addEventListener('change', photoInputChangeHandler);
  appartmentTypeInput.addEventListener('change', appartmentTypeInputHandler);
  timeInInput.addEventListener('input', timeInInputHandler);
  timeOutInput.addEventListener('input', timeOutInputHandler);
  roomsNumberInput.addEventListener('input', roomsNumberInputHandler);
  window.form.AD_FORM.addEventListener('submit', window.form.adFormSubmitHandler);
  resetFormButton.addEventListener('click', window.form.resetFormButtonClickHandler);

})();
