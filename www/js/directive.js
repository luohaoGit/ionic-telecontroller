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
			}
		};
	})

	.directive('toolAttach', function() {
		return function(scope, element, attrs) {
			ionic.on('toolbarshow', onShow, window);
			ionic.on('toolbarhide', onHide, window);

			var scrollCtrl;

			function onShow(e) {
				if (ionic.Platform.isAndroid() && !ionic.Platform.isFullScreen) {
					return;
				}

				//for testing
				var toolbarHeight = e.toolbarHeight || e.detail.toolbarHeight;
				element.css('bottom', toolbarHeight + "px");
				scrollCtrl = element.controller('$ionicScroll');
				if (scrollCtrl) {
					scrollCtrl.scrollView.__container.style.bottom = toolbarHeight + (element[0]).clientHeight + "px";
				}
			}

			function onHide() {
				if (ionic.Platform.isAndroid() && !ionic.Platform.isFullScreen) {
					return;
				}

				element.css('bottom', '');
				if (scrollCtrl) {
					scrollCtrl.scrollView.__container.style.bottom = '';
				}
			}

			scope.$on('$destroy', function() {
				ionic.off('toolbarshow', onShow, window);
				ionic.off('toolbarhide', onHide, window);
			});
		};
	});