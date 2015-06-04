(function (angular) {
  'use strict';

  angular.module('app')
    .factory('NotificationSvc', NotificationSvc);

  // NotificationSvc.$inject = [];

  function NotificationSvc() {

    return function () {
      var notifications = [];
      var nextNotifications = [];
      var id = 0;
      var clearSignal = false;
      var nextSignal = false;

      var NotificationType = {
        error: 'error',
        success: 'success',
        info: 'info'
      };

      var NotificationMode = {
        single: 'single',
        multiple: 'multiple'
      };

      function nextId() {
        id = (id + 1) % 100;
        return id;
      }

      function switchToNext() {
        setNextSignal(false);

        notifications = nextNotifications;
        nextNotifications = [];
      }

      function Notification(message, type, mode, timeout, header, html) {

        // validation
        if(message == null) {
          throw new Error('Notification message cannot be empty/null');
        }

        if(!NotificationType[type]) {
          throw new Error('Invalid message type: ' + type);
        }

        if(mode) {
          if(!NotificationMode[mode]) {
            throw new Error('Invalid message mode: ' + mode + '. Should be ' +
              Object.keys(NotificationMode).join(', '));
          }
        } else {
          mode = NotificationMode.single;
        }

        this.message = message;
        this.type = type;
        this.id = nextId();
        this.mode = mode;

        this.timeout = timeout;
        // implement this later
        // this.html = html;
        // this.header = header;
      }

      function addNext(message, type, mode, timeout, header, html) {

        if(typeof message === 'string') {
          add(message, type, mode, timeout, header, html, true);
        } else {
          // message is config object
          var config = message;
          config.nextState = true;
          add(config);
        }
      }

      function add(message, type, mode, timeout, header, html, nextState) {

        if(message == null || typeof message === 'string' && message.length === 0) {
          throw new Error('Notification message cannot be empty/null');
        }

        var n;
        if(typeof message === 'string') {
          n = nextState ? nextNotifications : notifications;
          n.push(new Notification(message, type, mode, timeout, header, html));
        } else {
          // message is config object
          var config = message;
          n = config.nextState ? nextNotifications : notifications;

          n.push(new Notification(config.message, config.type, config.mode, config.timeout, config.header,
            config.html));
        }
      }

      function addError(message, mode, timeout, header, html, nextState) {
        add(message, NotificationType.error, mode, timeout, header, html, nextState);
      }

      function addSuccess(message, mode, timeout, header, html, nextState) {
        add(message, NotificationType.success, mode, timeout, header, html, nextState);
      }

      function addInfo(message, mode, timeout, header, html, nextState) {
        add(message, NotificationType.info, mode, timeout, header, html, nextState);
      }

      function addNextError(message, mode, timeout, header, html) {
        add(message, NotificationType.error, mode, timeout, header, html, true);
      }

      function addNextSuccess(message, mode, timeout, header, html) {
        add(message, NotificationType.success, mode, timeout, header, html, true);
      }

      function addNextInfo(message, mode, timeout, header, html) {
        add(message, NotificationType.info, mode, timeout, header, html, true);
      }

      function clear() {
        setClearSignal(true);
      }

      function count() {
        return notifications.length;
      }

      function hasNext() {
        return notifications.length > 0;
      }

      function next() {
        if(notifications.length === 0) {
          return null;
        }
        return notifications.shift();
      }

      function getClearSignal() {
        return clearSignal;
      }

      function setClearSignal(val) {
        clearSignal = val;
      }

      function getNextSignal() {
        return nextSignal;
      }

      function setNextSignal(val) {
        nextSignal = val;
      }

      return {
        add: add,
        addNext: addNext,

        addError: addError,
        addSuccess: addSuccess,
        addInfo: addInfo,

        addNextError: addNextError,
        addNextSuccess: addNextSuccess,
        addNextInfo: addNextInfo,

        count: count,
        hasNext: hasNext,
        next: next,
        clear: clear,
        getClearSignal: getClearSignal,
        setClearSignal: setClearSignal,
        getNextSignal: getNextSignal,
        setNextSignal: setNextSignal,
        switchToNext: switchToNext
      };
    };
  }

}(this.angular));
