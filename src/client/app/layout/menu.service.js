// (function () {
//     'use strict';
//
//     angular
//         .module('app')
//         .factory('MenuSvc', menuService);
//
//     //dataservice.$inject = ['$http'];
//
//     // services are 'new'ed
//     // factory, provider are singletons
//     function menuService() {
//
//       return {
//         getMenu:getMenu
//       };
//
//
//       // static data for now but service decouples data from controller for now.
//       // later we wil pass in $http so we can get this data from the database or file.
//       function getMenu() {
//         return {
//           brand: {text: 'Justin\'s Demo', sref: 'home'},
//           tabs: [
//             {type: 'static', text: 'Home', sref: 'home', paths: ['/home']},
//             {type: 'static', text: 'To Do', sref: 'todo', paths: ['/todo']},
//             {type: 'static', text: 'About', sref: 'about', paths: ['/about']},
//
//             {type: 'dropdown', text: 'Tech',
//               items:[
//                 {type: 'header', text: 'Main'},
//                 {type: 'link', text: 'Bootstrap', href: 'http://getbootstrap.com/'},
//                 {type: 'link', text: 'AngularJS', href: 'https://angularjs.org/'},
//                 {type: 'link', text: 'NodeJS', href: 'https://nodejs.org/'},
//                 {type: 'link', text: 'Mongo', href: 'https://www.mongodb.org/'},
//                 {type: 'divider'},
//                 {type: 'header', text: 'Misc'},
//                 {type: 'link', text: 'Jasmine', href: 'http://jasmine.github.io/'},
//                 {type: 'link', text: 'Mocha', href: 'http://mochajs.org/'},
//                 {type: 'link', text: 'Karma', href: 'http://karma-runner.github.io/0.12/index.html'},
//                 {type: 'link', text: 'Protractor', href: 'http://angular.github.io/protractor/#/api'},
//                 {type: 'link', text: 'Gulp', href: 'http://gulpjs.com/'}
//                 ]}
//           ]};
//
//       }
//     }
// })();
