'use strict';

(function () {
  var CARD_TEMPLATE = document.querySelector('template').content.querySelector('.map__card');

  var REALTY_TYPE = {
    'flat': 'Квартира',
    'bungalo': 'Бунгало',
    'house': 'Дом',
    'palace': 'Дворец'
  };

  window.card = {

    KEY_CODE: {
      'ESC': 27,
      'ENTER': 13
    },

    /**
     * Функция выбора подходящих features из шаблона, сравнение с данными из offer
     * @param {object} featureToCheck - проверяемый элемент
     * @param {object} offer - объект offer
     * @return {boolean} inOffer
     */
    checkOffer: function (featureToCheck, offer) {
      var inOffer = false;
      for (var i = 0; i < offer.features.length; i++) {
        if (featureToCheck.classList[1].split('popup__feature--')[1] === offer.features[i]) {
          inOffer = true;
        }
      }
      return inOffer;
    },

    /**
   * Функция создания на основе шаблона карточки объявления и
   * заполнения ее информацией на основе объекта объявления
   * @param {object} adObj
   * @return {Node} adPopup
   */
    generateAdCardObject: function (adObj) {
      var adCard = CARD_TEMPLATE.cloneNode(true);
      var photoContainer = adCard.querySelector('.popup__photos');
      var featureItems = adCard.querySelectorAll('.popup__feature');
      var photoTemplate = photoContainer.querySelector('img');
      var itemsToRemove = [];

      adCard.querySelector('h3.popup__title').textContent = adObj.offer.title;
      adCard.querySelector('.popup__text--address').textContent = adObj.offer.address;
      adCard.querySelector('.popup__text--price').innerHTML = adObj.offer.price + ' &#x20bd;<span>/ночь</span>';
      adCard.querySelector('.popup__type').textContent = REALTY_TYPE[adObj.offer.type];
      adCard.querySelector('.popup__text--capacity').textContent = adObj.offer.rooms + ' комнаты для ' + adObj.offer.guests + ' гостей';
      adCard.querySelector('.popup__text--time').textContent = 'Заезд после ' + adObj.offer.checkin + ', выезд до ' + adObj.offer.checkout;
      adCard.querySelector('.popup__description').textContent = adObj.offer.description;

      for (var i = 0; i < featureItems.length; i++) {
        var isInOffer = window.card.checkOffer(featureItems[i], adObj.offer);
        if (!isInOffer) {
          itemsToRemove.push(featureItems[i]);
        }
      }

      if (itemsToRemove.length > 0) {
        var liItem = null;
        itemsToRemove.forEach(function (item) {
          liItem = adCard.querySelector('.' + item.classList[1]);
          liItem.remove();
        });
      }

      for (var j = 0; j < adObj.offer.photos.length; j++) {
        var photo = photoTemplate.cloneNode();
        photo.src = adObj.offer.photos[j];
        photoContainer.appendChild(photo);
      }
      photoTemplate.remove();

      adCard.querySelector('.popup__close').addEventListener('click', function () {
        adCard.style['display'] = 'none';
      });

      adCard.querySelector('img.popup__avatar').src = adObj.author.avatar;
      return adCard;
    },


    /**
     * Функция удаления всех карточек объявлений
     */
    removeCards: function () {
      var mapCards = document.querySelectorAll('.map__card');
      if (mapCards) {
        for (var i = 0; i < mapCards.length; i++) {
          window.map.MAP.removeChild(mapCards[i]);
        }
      }
    },

    /**
     * Функция генерации карточки и добавления ее в разметку
     * @param {*} adObj
     */
    renderCard: function (adObj) {
      window.card.removeCards();
      var newCard = window.card.generateAdCardObject(adObj);
      window.map.MAP.insertBefore(newCard, window.map.FILTER_CONTAINER);

      document.addEventListener('keydown', function (evt) {
        if (evt.keyCode === window.card.KEY_CODE.ESC) {
          newCard.classList.add('hidden');
        }
      });
    },

    /**
       * Функция вызывающая renderCard для разделения окружений ф-ций
       * @param {*} adObj
       * @return {function()}
       */
    callbackRenderCard: function (adObj) {
      return function () {
        window.card.renderCard(adObj);
      };
    }
  };
})();
