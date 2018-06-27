'use strict';

(function () {
  var REQUEST_TIMEOUT = 10000;
  var STATUS_OK = 200;
  var GET_URL = 'https://js.dump.academy/keksobooking/data';
  var POST_URL = 'https://js.dump.academy/keksobooking';

  window.backend = {
    /**
     * Функция загрузки JSON данных с сервера
     * @param {*} onLoad - колбэк-функция, срабатывающая по загрузке данных
     * @param {*} onError - колбэк-функция, срабатывающая при ошибке загрузки данных
     */
    getData: function (onLoad, onError) {

      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.timeout = REQUEST_TIMEOUT;

      xhr.addEventListener('load', function () {
        if (xhr.status === STATUS_OK) {
          onLoad(xhr.response);
        } else {
          onError(xhr.status + ' ' + xhr.statusText);
        }
      });

      xhr.addEventListener('error', function () {
        onError('ошибка загрузки');
      });

      xhr.addEventListener('timeout', function () {
        onError('запрос не успел выполниться за ' + xhr.timeout + 'мс');
      });

      xhr.open('GET', GET_URL);
      xhr.send();
    },

    /**
     * Функция отправки JSON данных на сервер
     * @param {*} data - данные в формате FormData
     * @param {*} onLoad - колбэк-функция, срабатывающая по загрузке данных
     */
    sendData: function (data, onLoad) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.addEventListener('load', onLoad);

      xhr.open('POST', POST_URL);
      xhr.send(data);
    }
  };
})();


