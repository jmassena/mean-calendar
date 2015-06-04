angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("app/login.html","<!-- login.html -->\n\n<h2>Login</h2>\n\n<!-- <div id=\'userMessage\' class=\"alert \" ng-class=\"{\'alert-danger\':vm.userMessage.type==\'error\', \'alert-success\':vm.userMessage.type==\'success\'}\" ng-show=\"vm.userMessage.show\">\n  <button type=\"button\" class=\"close\" ng-click=\"vm.clearUserMessage()\" id=\"btnUserMessageClose\">\n    <span>&times;</span>\n  </button>\n  <span> {{vm.userMessage.message}}</span>\n</div> -->\n\n<div class=\"form-container-med\">\n  <form id=\"loginForm\" name=\"form\" class=\"form form-horizontal\" ng-submit=\"vm.login(vm.form)\" novalidate>\n    <!-- username -->\n    <div class=\"form-group\">\n      <label for=\"userName\" class=\"col-sm-2 control-label\">User Name</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.userName\" class=\"form-control\" id=\"userName\" name=\"userName\" placeholder=\"User Name\" required minlength=\"8\" type=\"text\">\n\n        <div ng-show=\"form.$submitted || form.userName.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.userName.$error.required\">Username is required.</span>\n          <span ng-show=\"form.userName.$error.minlength\">Length must be at least 8 characters.</span>\n        </div>\n      </div>\n\n    </div>\n    <!-- password -->\n    <div class=\"form-group\">\n      <label for=\"password\" class=\"col-sm-2 control-label\">Password</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.password\" class=\"form-control\" id=\"password\" name=\"password\" placeholder=\"Password\" required minlength=\"8\" type=\"password\">\n        <div ng-show=\"form.$submitted || form.password.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.password.$error.required\">Password is required.</span>\n          <span ng-show=\"form.password.$error.minlength\">Length must be at least 8 characters.</span>\n        </div>\n      </div>\n    </div>\n\n    <!-- buttons -->\n    <div class=\"form-group form-button-row\">\n      <div class=\"col-sm-offset-2 col-sm-6\">\n        <button id=\"btnSubmit\" type=\"submit\" ng-disabled=\"form.$invalid\" class=\"btn btn-default\">Submit</button>\n      </div>\n    </div>\n  </form>\n</div>\n");
$templateCache.put("app/registration.html","<!-- <div id=\'userMessage\' class=\"alert user-message\" ng-class=\"{\'alert-danger\':vm.userMessage.type==\'error\', \'alert-success\':vm.userMessage.type==\'success\'}\" ng-show=\"vm.userMessage.show\">\n  <button type=\"button\" class=\"close\" ng-click=\"vm.clearUserMessage()\" id=\"btnUserMessageClose\">\n    <span>&times;</span>\n  </button>\n  <span> {{vm.userMessage.message}}</span>\n</div> -->\n\n<!-- style=\"position:absolute;top:40px;right:10px; z-index:100;max-width:600px;\" -->\n<!-- <notification></notification> -->\n\n<h3>Registration</h3>\n<!-- <notification class=\"right-notification\" notifications=\"vm.notifications\"></notification> -->\n<!-- <notification notifications=\"vm.notifications\"></notification> -->\n<notification class=\"right-notification\" notifications=\"vm.notifications\"></notification>\n\n<br/>\n<div class=\"form-container-med\">\n  <form id=\"userForm\" name=\"form\" class=\"form form-horizontal\" ng-submit=\"vm.submitUser(vm.form)\" novalidate>\n    <!-- username -->\n    <div class=\"form-group\">\n      <label for=\"userName\" class=\"col-sm-2 control-label\">User Name</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.userName\" class=\"form-control\" id=\"userName\" name=\"userName\" placeholder=\"User Name\" required minlength=\"8\" type=\"text\">\n\n        <div ng-show=\"form.$submitted || form.userName.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.userName.$error.required\">Username is required.</span>\n          <span ng-show=\"form.userName.$error.minlength\">Length must be at least 8 characters.</span>\n        </div>\n      </div>\n\n    </div>\n    <!-- password -->\n    <div class=\"form-group\">\n      <label for=\"password\" class=\"col-sm-2 control-label\">Password</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.password\" class=\"form-control\" id=\"password\" name=\"password\" placeholder=\"Password\" required minlength=\"8\" type=\"password\">\n        <div ng-show=\"form.$submitted || form.password.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.password.$error.required\">Password is required.</span>\n          <span ng-show=\"form.password.$error.minlength\">Length must be at least 8 characters.</span>\n        </div>\n      </div>\n    </div>\n    <!-- email -->\n    <div class=\"form-group\">\n      <label for=\"email\" class=\"col-sm-2 control-label\">Email</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"Email Address\" required type=\"email\">\n        <div ng-show=\"form.$submitted || form.email.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.email.$error.required\">Email is required.</span>\n          <span ng-show=\"form.email.$error.email\">This is not a valid email.</span>\n        </div>\n      </div>\n    </div>\n    <!-- first name -->\n    <div class=\"form-group\">\n      <label for=\"firstName\" class=\"col-sm-2 control-label\">First Name</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.firstName\" class=\"form-control\" id=\"firstName\" name=\"firstName\" placeholder=\"First Name\" required type=\"text\">\n        <div ng-show=\"form.$submitted || form.firstName.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.firstName.$error.required\">First Name is required.</span>\n        </div>\n      </div>\n    </div>\n    <!-- last name -->\n    <div class=\"form-group\">\n      <label for=\"lastName\" class=\"col-sm-2 control-label\">Last Name</label>\n      <div class=\"col-sm-6\">\n        <input ng-model=\"vm.form.lastName\" class=\"form-control\" id=\"lastName\" name=\"lastName\" placeholder=\"Last Name\" required type=\"text\">\n        <div ng-show=\"form.$submitted || form.lastName.$touched\" class=\"invalid-message\">\n          <span ng-show=\"form.lastName.$error.required\">Last Name is required.</span>\n        </div>\n      </div>\n    </div>\n    <!-- buttons -->\n    <div class=\"form-group form-button-row\">\n      <div class=\"col-sm-offset-2 col-sm-6\">\n        <!-- <button type=\"button\" class=\"btn btn-danger \">Cancel</button> -->\n        <!-- <button id=\"btnSubmit\" type=\"submit\" ng-disabled=\"form.$invalid\" class=\"btn btn-default\">Submit</button> -->\n        <button id=\"btnSubmit\" type=\"submit\" ng-disabled=\"form.$invalid\" class=\"btn btn-default\">Submit</button>\n      </div>\n    </div>\n  </form>\n\n  <button style=\"float:right\" class=\"btn btn-default\" ng-click=\"vm.localNotificationTest()\">Local Notification</button>\n  <button style=\"float:right\" class=\"btn btn-default\" ng-click=\"vm.singleGlobalNotificationTest()\">Single Global Notification</button>\n  <button style=\"float:right\" class=\"btn btn-default\" ng-click=\"vm.globalNotificationTest()\">Multi Global Notification</button>\n  <button style=\"float:right\" class=\"btn btn-default\" ng-click=\"vm.globalNotificationClear()\">Clear Global Notification</button>\n\n</div>");
$templateCache.put("app/welcome.html","<h2>Welcome{{vm.user!=null?(\' \' + vm.user.firstName + \' \' + vm.user.lastName + \'!\'):\'!\'}}\n</h2>\n\n<h2 ng-show=\"vm.user ==null\">Please log in or register</h2>");
$templateCache.put("app/layout/top-nav.html","<nav class=\"navbar navbar-default\" role=\"navigation\">\n  <div class=\"navbar-header\">\n\n    <!-- Brand and toggle get grouped for better mobile display -->\n    <!-- data-toggle tells bs to what to do with the button when space is less than needed\n    data-target specifies which element to toggle -->\n    <button type=\"button\" data-target=\"#navbar-collapse\" data-toggle=\"collapse\" class=\"navbar-toggle\">\n      <span class=\"sr-only\">Toggle navigation</span>\n      <!-- I think these are where the collapsed items will be placed -->\n      <span class=\"icon-bar\">\n      </span>\n      <span class=\"icon-bar\">\n      </span>\n      <span class=\"icon-bar\">\n      </span>\n    </button>\n    <a ui-sref=\"welcome\" class=\"navbar-brand\">Authentication</a>\n  </div>\n\n  <div class=\"collapse navbar-collapse\" id=\"navbar-collapse\">\n    <ul class=\"nav navbar-nav pull-right\">\n\n      <li>\n        <a ng-hide=\"vm.user===null\">{{vm.user.userName}}</a>\n      </li>\n      <li>\n        <a ui-sref=\"login\" ng-show=\"vm.user===null\">Login</a>\n      </li>\n      <li>\n        <a ui-sref=\"register\" ng-show=\"vm.user===null\">Register</a>\n      </li>\n      <li>\n        <a ui-sref=\"login\" ng-hide=\"vm.user===null\" ng-click=\"vm.logout()\">Logout</a>\n      </li>\n\n      <!-- <li ng-repeat=\"ddTab in vm.getDropdownTabs()\" class=\"dropdown\">\n\n        <a href=\"\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n          {{ddTab.text}} <b class=\"caret\"></b>\n        </a>\n        <ul class=\"dropdown-menu\">\n          <li ng-repeat=\"menuItem in ddTab.items\"\n            ng-class=\"{\'dropdown-header\': menuItem.type==\'header\', divider: menuItem.type==\'divider\'}\">\n            {{(menuItem.type!=\'link\')?menuItem.text:\'\'}}\n            <a ng-if=\"menuItem.type==\'link\'\" href=\"{{menuItem.href||\'\'}}\">{{menuItem.text}}</a>\n          </li>\n        <ul>\n      </li> -->\n    </ul>\n  </div>\n</nav>\n");}]);