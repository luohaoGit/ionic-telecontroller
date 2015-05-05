angular.module('starter.directives', ['ngSanitize'])

	.directive('focusMe', function($timeout, $parse, $rootScope) {
		return {
			//scope: true,   // optionally create a child scope
			link: function(scope, element, attrs) {
				var model = $parse(attrs.focusMe);

				scope.$watch(model, function(value) {
					if(value) {
						$timeout(function() {
							element[0].focus();
						});
					}else{
						$timeout(function() {
							element[0].blur();
						});
					}
				});

				element.bind('blur', function() {
					scope.$apply(model.assign(scope, false));
				});
			}
		};
	});