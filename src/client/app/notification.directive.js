(function (angular) {
  'use strict';

  angular.module('app')
    .directive('notification', notification);

  notification.$inject = ['$timeout', 'GlobalNotificationSvc'];

  function notification($timeout, GlobalNotificationSvc) {

    return {
      restrict: 'E',
      scope: {
        notifications: '=',
        global: '@'
      },

      link: function (scope, element, attrs) {

        var source;
        if(scope.global) {
          source = GlobalNotificationSvc;
        } else if(scope.notifications) {
          source = scope.notifications;
        }

        var removedNotifications = {};
        var myNotifications = {};

        // watch next signal
        scope.$watch(function () {
            var nextSignal = source.getNextSignal();
            return nextSignal;
          },
          function (newVal, oldVal) {
            if(newVal) {
              clearNotifications();
              source.switchToNext();
            }
          }
        );

        // watch clear signal
        scope.$watch(function () {
            return source.getClearSignal();
          },
          function (newVal, oldVal) {
            if(newVal) {
              clearNotifications();
              source.setClearSignal(false);
            }
          }
        );

        $(element).append('<div><ul></ul></div>');
        var ul = $(element).find('ul');

        // watch notification count
        scope.$watch(function () {
            return source.count();
          },
          function () {

            while(source.hasNext()) {

              var n = source.next();
              if(n.mode === 'single') {
                clearNotifications();
              }

              myNotifications[n.id] = n;

              var html = '' +
                '<li class="notification notification-new notification-' + n.type + '"' +
                ' data-notificationId="' + n.id + '">' +
                '<button class="notification-close" >&times;</button>' +
                '<span class="notification-text">' + n.message + '</span>' +
                '</li>';

              ul.append(html);

              if(n.timeout) {
                var el = ul.children('li').last();
                removeElement(el[0], n.id, n.timeout);
              }
            }
          });

        function removeNotification(id) {
          var el = element.find('li[data-notificationId="' + id + '"]');
          if(el.length > 0) {
            el.remove();
          }

          removedNotifications[id] = myNotifications[id];
          delete myNotifications[id];
        }

        function clearNotifications() {
          for(var key in myNotifications) {
            if(myNotifications.hasOwnProperty(key)) {
              removeNotification(key);
            }
          }
        }

        function restoreNotification(id) {
          myNotifications[id] = removedNotifications[id];
          delete removedNotifications[id];
          // then need to render it preferably in same position....
        }

        function removeElement(el, notificationId, timeout) {

          $timeout(function () {

            $(el).toggleClass('notification-new notification-removed')
              .one('webkitTransitionEnd oTransitionEnd transitionend', function (e) {
                removeNotification(notificationId);
              });
          }, timeout, false);
        }

        $(element).on('click', 'li button', function (evt) {

          var el = $(evt.currentTarget).closest('li');
          if(el.hasClass('notification-removed')) {
            // handle multiple clicks while transitionining
            return;
          }

          var id = parseInt(el.attr('data-notificationId'));
          removeElement(el, id);
        });
      }

    };
  }

}(this.angular));
