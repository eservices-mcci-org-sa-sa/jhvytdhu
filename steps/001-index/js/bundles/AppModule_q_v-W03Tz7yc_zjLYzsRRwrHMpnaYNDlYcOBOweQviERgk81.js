/* Minification failed. Returning unminified contents.
(149,52-53): run-time error JS1195: Expected expression: .
(149,62-63): run-time error JS1004: Expected ';': )
(149,64-70): run-time error JS1004: Expected ';': config
(150,17-18): run-time error JS1002: Syntax error: }
(160,73-74): run-time error JS1004: Expected ';': {
(177,2-3): run-time error JS1195: Expected expression: ]
(183,55-56): run-time error JS1004: Expected ';': {
(185,2-3): run-time error JS1195: Expected expression: ]
(190,5-8): run-time error JS1197: Too many errors. The file might not be a JavaScript file: run
(161,5,176,6): run-time error JS1018: 'return' statement outside of function: return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.getItem('token')) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.getItem('token');
            }
            return config || $q.when(config);
        },
        response: function (response) {

            if (response.status === 401) {
                window.location.href = '/#/Login';
            }
            return response || $q.when(response);
        }
    }
 */
"use strict";
let app = angular.module('AppModule', ['ngRoute', 'Alertify', 'ngProgress', 'ngResource', 'angularScreenfull', 'summernote', 'angularSpinner', 'uiSwitch',
    'perfect_scrollbar', 'angularUtils.directives.dirPagination', 'blueimp.fileupload', 'ui.bootstrap', 'ngSanitize', 'ui.select', 'ngMessages',
    'ngNotify', 'ngCookies', 'uiSwitch', 'ngIdle', 'oitozero.ngSweetAlert', 'ui.toggle', 'angularProgressbar', 'angular-intro', 'circle.countdown',
    'angular-walkthrough', 'bm.uiTour', 'vcRecaptcha', 'blockUI', 'moment-picker', 'toaster', 'ngclipboard', 'froala', 'nzTour', 'ngtweet', 'ngMap']);
//, 'oc.lazyLoad'

app.value('version', '3.1.4');
angular.element(document).ready(function () {
    angular.bootstrap(document, ['AppModule']);
});

//app.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
//    $ocLazyLoadProvider.config({ 
//    });
//}])

//angular.module('AppModule', ['froala']).
//    value('froalaConfig', {
//        toolbarInline: false,
//        placeholderText: 'Enter Text Here'
//    });

//app.value('notification', $.connection.notificationHub);

//app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
//    $sceDelegateProvider.resourceUrlWhitelist([
//        // Allow same origin resource loads.
//        'self'
//    ]);
//}]);

app.config(['momentPickerProvider', function (momentPickerProvider) {

    momentPickerProvider.options({
        /* Picker properties */
        locale: 'ar-sa',
        format: 'L LTS',
        minView: 'decade',
        maxView: 'minute',
        startView: 'year',
        autoclose: true,
        today: true,
        keyboard: false,

        /* Extra: Views properties */
        leftArrow: '&larr;',
        rightArrow: '&rarr;',
        yearsFormat: 'YYYY',
        monthsFormat: 'MMM',
        daysFormat: 'D',
        hoursFormat: 'HH:[00]',
        minutesFormat: 'hh:mm',
        secondsFormat: 'ss',
        minutesStep: 5,
        secondsStep: 1
    });
}]);
app.run(['$http', function ($http) {
    $http.defaults.headers.common['X-XSRF-Token'] =
        angular.element('input[name="__RequestVerificationToken"]').attr('value');
}]);

app.factory('httpInterceptor', ['$q', '$rootScope',
    function ($q, $rootScope) {
        var loadingCount = 0;
        return {
            request: function (config) {
                if (++loadingCount === 1) $rootScope.$broadcast('loading:progress');
                return config || $q.when(config);
            },

            response: function (response) {
                if (--loadingCount === 0) $rootScope.$broadcast('loading:finish');
                return response || $q.when(response);
            },

            responseError: function (response) {
                if (--loadingCount === 0) $rootScope.$broadcast('loading:finish');
                return $q.reject(response);
            }
        };
    }
]);

//app.provider("$exceptionHandler",{
//        $get: function (errorLogService) { 
//            return (errorLogService); 
//        }
//    }
//);


app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', 'version', function ($q, version) {
        return {
            'request': function (request) {
                if (request.url.substr(-5) === '.html') {
                    if (request.url.indexOf('Views/') > -1 || request.url.indexOf('views/') > -1 || request.url.indexOf('Partials/') > -1) {
                        request.params = {
                            v: version
                        }
                    }
                }
                return $q.resolve(request);
            }
        }
    }]);
}]);

app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

app.config(['blockUIConfig', function (blockUIConfig) {
    blockUIConfig.templateUrl = 'Scripts/BlockUi/blockHtml.html';
    blockUIConfig.autoBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
}]);

app.config(['$provide', '$httpProvider', function ($provide, $httpProvider) {
    $provide.factory('unauthorisedInterceptor', ['$q', function ($q) {
        return {
            'responseError': function (rejection) {
                if (rejection.status === 401) {
                    window.location.href = '/#/Login';
                }
                return $q.reject(rejection);
            }
        };
    }]);
    $httpProvider.interceptors.push('unauthorisedInterceptor');

    // register the interceptor as a service
    $provide.factory('HeaderInterceptor', ['$q', '$rootScope','$location', function ($q, $rootScope,$location) {
        return {
            // optional method
            'request': function (config) {
                var templatePath = 'angularUtils.directives.dirPagination.template';
                if (config.url.substr(-5) === '.html' || config.url.includes(templatePath) || config.url.includes('www.coccertificate.org')) {
                    return config;
                }
                let chamberDomain = $rootScope.selectedChamberDomain || ($rootScope.userInfo && $rootScope.userInfo.globalSessionValues && $rootScope.userInfo.globalSessionValues.CurrentMember && $rootScope.userInfo.globalSessionValues.CurrentMember.chamberDomain ? $rootScope.userInfo.globalSessionValues.CurrentMember.chamberDomain : undefined)
                config.url = (chamberDomain ? ('https://' + chamberDomain + '/') : '') + config.url
                config.url = config.url.replace('//api', '/api')
               // config.url = config.url.includes('/api/Charge/Pay') ? '/api/Charge/Pay' : config.url;
                // do something on success
                if ($location.$$path != '/MemberLogin') {
                    if ($rootScope.chamberSettings?.isUnified) config.headers['X-App-Mode'] = 'UNIFIED';
                }
                return config;
            },

        }; 
    }]);
    $httpProvider.interceptors.push('HeaderInterceptor');
}]);

//new added
app.factory('AuthInterceptor', ['$window', '$q', function ($window, $q) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.getItem('token')) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.getItem('token');
            }
            return config || $q.when(config);
        },
        response: function (response) {

            if (response.status === 401) {
                window.location.href = '/#/Login';
            }
            return response || $q.when(response);
        }
    };
}]);




// Register the previously created AuthInterceptor.
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
}]);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.run(['$rootScope', '$routeParams', 'authService', '$route', 'sharedService', '$location', 'ngProgress', 'uiTourService', '$sce', 'ngNotify', 'localStorage', '$uibModal', 'session',
    function ($rootScope, $routeParams, authService, $route, sharedService, $location, ngProgress, uiTourService, $sce, ngNotify, localStorage, $uibModal, session) {
        $rootScope.chamberSettings.isUnified = false;

        $rootScope.$on('$viewContentLoaded', function () {
            $(".se-pre-con").fadeOut("slow");
            // to define Isunified on the start of the app (global version or chamber version)
            var elements = angular.element(document.getElementById('googleAnalytics'));
            $rootScope.chamberSettings.isUnified = elements[0].IsUnified.value == "1" ? true : false;
        });


        //if (navigator.geolocation) {
        //    navigator.geolocation.getCurrentPosition(function (position) {
        //        $rootScope.$evalAsync(function () {
        //            debugger;
        //            $rootScope.lat = position.coords.latitude;
        //            $rootScope.lan = position.coords.longitude;
        //            var json = {
        //                "Lat : ": position.coords.latitude,
        //                "lan : ": position.coords.longitude
        //            }
        //            var jsonse = JSON.stringify(json);
        //            var blob = new Blob([jsonse], {
        //                type: "application/json"
        //            });

        //            saveAs(blob,  "my_json.json");
        //        })
        //    });
        //}

        $rootScope.online = navigator.onLine;
        $rootScope.IsNotLoggedIn = false;
        $rootScope.started = false;
        $rootScope.isEnabled = true;
        $rootScope.tour = null;

        sharedService.CheckInternet();
        var showAlert = sharedService.GetbrowserInfo();
        if (showAlert) {
            return false;
        }

        $rootScope.isActive = function (route) {
            return route === $location.path();
        };

        sharedService.Idle();

        $rootScope.stopMeetingInterval = function () {
            sharedService.stopInterval();
        }


        $rootScope.redirectNewRequest = function (url) {
            var currentUrl = $location.absUrl();
            var param = $routeParams.id;
            if (url === '/NewRequest' && currentUrl.indexOf('NewRequest') !== -1 && (param === null || param === "" || param === undefined)) {
                $route.reload();
            } else {
                $location.path('/NewRequest');
            }
        };
        $rootScope.showMemberExpireAlert = function () {
            sharedService.showMemberExpireAlert();
        };


        $rootScope.logOut = function () {
            authService.logOut();
        };

        $rootScope.replaceMember = function (newMemberId) {
            sharedService.replaceMember(newMemberId);
        };

        $rootScope.checkUrlAccess = function (key) {
            if ($rootScope.userInfo.globalSessionValues.CurrentMember != null) {
                if ($rootScope.userInfo.globalSessionValues.CurrentMember.IsAdmin) {
                    return true;
                } else {
                    var privleges = $rootScope.userInfo.globalSessionValues.CurrentMember.Privileges;
                    if (privleges !== null && privleges !== undefined && privleges !== '') {
                        if (privleges.indexOf(key) !== -1) {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
            }
        };

        $rootScope.ResendConfirmEmail = function () {
            sharedService.ResendConfirmEmail().then(function (res) {
                if (res.success) {
                    ngNotify.set(res.message, {
                        position: 'top',
                        type: 'success'
                    });
                }
            });
        };


        $rootScope.ViewIdentityMembersList = function (data) {
            if (data > 0) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'approvedMergedMembers.html',
                    controller: 'ModalInstanceCtrl'
                });
            }
        }

        $rootScope.ViewMergedModal = function (data) {
            if (data > 0) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'approvedMergedMembers.html',
                    controller: 'ModalInstanceCtrl'
                });
            }
        }

        function isRestPasswordPage() {
            if ($location.absUrl().indexOf('ChangePassTemp') !== -1) {
                $rootScope.dependOnUrl = false;
            } else {
                $rootScope.dependOnUrl = true;
            }
        }
        $rootScope.$on('$routeChangeStart', function () {
            $('.modal').remove();
            $('.modal-backdrop').remove();
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.ShowLayout = false;
            $rootScope.Message = '';
            $rootScope.isLanding = false;

            if ($location.absUrl().indexOf("Non-Members") <= -1) {
                $rootScope.IsSubscriber = true;
                session.addDataToLocalStorage('IsSubscriber', true);
            } else {
                $rootScope.IsSubscriber = false;
                session.addDataToLocalStorage('IsSubscriber', false);
            }
            if ($location.absUrl().indexOf('CommericalManual/Intergation/Details') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "الدليل التجارى- تفاصيل  ";
                //$location.path('/CommericalManual/Intergation/Details');
                return false;
            }
            if ($location.absUrl().indexOf('CommericalManual') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "الدليل التجارى  ";
                $location.path('/CommericalManual');
                return false;
            }
            if ($location.absUrl().indexOf('Contact') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "تواصل معنا";
                $location.path('/Contact');
                return false;
            }
            if ($location.absUrl().indexOf('NominationCommittees') !== -1) {
                //$rootScope.ShowLayout = false;
                //$location.path('/NominationCommittees');
                return false;
            }
            if ($location.absUrl().indexOf('Nomination') !== -1) {
                //$rootScope.ShowLayout = false;
                //$location.path('/NominationCommittees');
                return false;
            }
            if ($location.absUrl().indexOf('LandingPage') !== -1) { 
                return false;
            }
            if ($location.absUrl().indexOf('New-Landing') !== -1) {
                return false;
            }
            if ($location.absUrl().indexOf('New-Login') !== -1) {
                return false;
            }
            if ($location.absUrl().indexOf('CouncilsCandidate') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "تواصل معناالمجالس القطاعية- طلب ترشح";
                $location.path('/CouncilsCandidate');
                return false;
            }
            if ($location.absUrl().indexOf('CommercialsPartners') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "الشريك التجاري";
                $location.path('/CommercialsPartners');
                return false;
            }
            if ($location.absUrl().indexOf('MemberIdQuery') !== -1) {
                $rootScope.LoggerUser = authService.checkLogin() ? true : false;
                document.title = "الاستعلام عن رقم العضوية";
                return false;
            }
            if ($location.absUrl().indexOf('Meetings/Terms') !== -1) {
                $rootScope.LoggerUser = authService.checkLogin() ? true : false;
                document.title = "الجمعية العمومية - البنود";
                return false;
            }
            if ($location.absUrl().indexOf('Login') === -1) {
                $rootScope.showCommercialBanner = false;
            }

            var checkLogin = authService.checkLogin();
            if (checkLogin === true) {
                $rootScope.$on('$locationChangeStart', function (evnt, next, current) {
                    //if (!$rootScope.userInfo.globalSessionValues.UserData.AgreementAccepted) {

                    //}
                    if (next.indexOf("Landing") !== -1 && !authService.checkLogin()) {
                        evnt.preventDefault();
                        $location.path('/Login');
                        return false;
                    }

                    if (next.indexOf("Login") > -1) {
                        authService.logOut();
                        return false;
                    }
                    if (next.indexOf("Non-Members") <= -1 || next.indexOf("Non-Members") <= -1) {
                        $rootScope.IsSubscriber = true;
                        session.addDataToLocalStorage('IsSubscriber', true);
                    }
                    var IsSubscriber = localStorage.getItem('IsSubscriber');
                    if (IsSubscriber === "true") {
                        if ((current.indexOf("Landing") > -1 && current.indexOf("Login") <= -1) &&
                            (current.indexOf("Landing") !== -1 && next.indexOf("Profile/AccountInfo") === -1) &&
                            (current.indexOf("Landing") !== -1 && next.indexOf("Profile/ChangePassword") === -1)) {
                            if ($rootScope.userInfo === undefined || $rootScope.userInfo === null) {
                                evnt.preventDefault();
                            }
                            else if (!$rootScope.userInfo.globalSessionValues.CurrentMember) {
                                //Prevent browser's back button default action.
                                evnt.preventDefault();
                            }
                        }
                    }
                });

                Label1:

                $rootScope.ShowLayout = true;

                isRestPasswordPage(); //to hide options menu in case reset password page

                sharedService.checkExpiredMemberMaster();

                sharedService.CheckMeetingInerval();

                //Get user notifications
                sharedService.GetNotifications();

                if ($location.absUrl().indexOf('MWalletConfirmPayment') === -1) {
                    if ($rootScope.userInfo.globalSessionValues.CurrentMember !== null) {
                        $rootScope.$on('$viewContentLoaded', function () {
                            sharedService.GetWalletBalance().then(function (response) {
                                if (!response) {
                                    authService.logOut();
                                }
                            });
                        });
                    }
                }

                //Intro
                sharedService.Intro();
            }
            else {
                sharedService.PagesRedirect();
                return false;
            }

            /////////////////////////////////////////

            $rootScope.toggleEnabled = function () {
                $scope.isEnabled = !$scope.isEnabled;
            };

            $rootScope.onPrev = function (tour) {
                console.log('Moving back...', tour);
            };

            $rootScope.shouldMoveOn = function () {
                return $q(function (resolve, reject) {
                    if (confirm('Click OK to go to the next step. Otherwise you can stay here...if you want.')) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            };

            //change Notification Status
            $rootScope.changeNotificationStatus = function (notify) {
                sharedService.ChangeNotificationStatus(notify);
            };

            $rootScope.checkUrl = function () {
                if ($location.absUrl().indexOf("Landing") > -1) {
                    return false;
                }
                return true;
            };



            $rootScope.startDetached = function () {
                $rootScope.tour = uiTourService.getTourByName('detachedDemoTour');
                $rootScope.tour.start();
                $rootScope.tourStep = 0;
            };

            $rootScope.trustedContent = $sce.trustAsHtml('<strong>This can contain HTML, and will override `step.content` if set.</strong>');

            $rootScope.goToReviewTour = function () {
                uiTourService.getTourByName('demoTour').start();
                uiTourService.getTourByName('detachedDemoTour').start();
            };

            $rootScope.navigateToAndWaitFor = function (tour, path, step) {
                $location.path(path);
                return tour.waitFor(step);
            };

            ngProgress.complete();
        });
        $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
            if (eventObj.authenticated === false) {
                ngProgress.complete();
                event.preventDefault();
            }
            if (window.location.pathname === '/Verify') {
                $rootScope.ShowLayout = false;
                document.title = "التحقق من الوثائق";
                if ($routeParams.chamb !== "" && $routeParams.chamb !== undefined && $routeParams.chamb !== '') {
                    if ($routeParams.chamb.length === 3) {
                        window.location.href = '/#/DocumentVerify/' + $routeParams.chamb;
                    } else {
                        window.location.href = '/#/DocumentVerify';
                    }
                }
                else {
                    window.location.href = '/#/DocumentVerify';
                }
            }
            else {
                window.location.href = '/#/Login';
            }
        });



    }]);

app.directive('myClick', function () {
    return {
        restrict: 'A',
        scope: { myClick: '&' },
        link: function (scope, element, attrs) {
            attrs.$observe('disable', function (val) {
                if (val == 'true' || val == 1) {
                    element.off('click');
                } else {
                    element.on('click', function (e) {
                        scope.$apply(function () {
                            scope.myClick({ '$event': e });
                        });
                    });
                }
            });
        }
    };
});
app.directive('consent', function ($cookies) {
    return {
        scope: {},
        template:
            '<div style="position: relative; z-index: 1000">' +
            '<div style="background: #ccc; position: fixed; bottom: 0; left: 0; right: 0" ng-hide="consent()">' +
            ' <a href="" ng-click="consent(true)">I\'m cookie consent</a>' +
            '</div>' +
            '</div>',
        controller: function ($scope) {
            var _consent = $cookies.get('consent');
            $scope.consent = function (consent) {
                if (consent === undefined) {
                    return _consent;
                } else if (consent) {
                    $cookies.put('consent', true);
                    _consent = true;
                }
            };
        }
    };
});
app.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'sharedService', function ($scope, $uibModalInstance, sharedService) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.StopComPartnerBanner = function () {
        $uibModalInstance.dismiss('cancel');
        sharedService.stopComPartnerBanner();
    }

    $scope.StopMeetingModal = function (isConfirm) {
        $uibModalInstance.dismiss('cancel');
        // sharedService.stopMeetingInterval();
        sharedService.stopInterval(isConfirm);
    }
}]);

app.directive("limitToMax", function () {
    return {
        link: function (scope, element, attributes) {
            element.on("keydown keyup", function (e) {
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(attributes.max);
                }
            });
        }
    };
});

app.directive("preventTypingGreater", function () {
    return {
        link: function (scope, element, attributes) {
            var oldVal = null;
            element.on("keydown keyup", function (e) {
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(oldVal);
                } else {
                    oldVal = Number(element.val());
                }
            });
        }
    };
});

//app.factory("errorLogService",
//    function ($log, $window) {
//        // I log the given error to the remote server.
//        function log(exception, cause) {

//            // Pass off the error to the default error handler
//            // on the AngualrJS logger. This will output the
//            // error to the console (and let the application
//            // keep running normally for the user).
//            $log.error.apply($log, arguments);

//            // Now, we need to try and log the error the server.
//            // --
//            // NOTE: In production, I have some debouncing
//            // logic here to prevent the same client from
//            // logging the same error over and over again! All
//            // that would do is add noise to the log.
//            //try {

//            //    var errorMessage = exception.toString();
//            //    // Log the JavaScript error to the server.
//            //    // --
//            //    // NOTE: In this demo, the POST URL doesn't
//            //    // exists and will simply return a 404.
//            //    $.ajax({
//            //        type: "POST",
//            //        url: "./javascript-errors",
//            //        contentType: "application/json",
//            //        data: angular.toJson({
//            //            errorUrl: $window.location.href,
//            //            errorMessage: errorMessage,
//            //            stackTrace: exception,
//            //            cause: (cause || "")
//            //        })
//            //    });

//            //} catch (loggingError) {

//            //    // For Developers - log the log-failure.
//            //    $log.warn("Error logging failed");
//            //    $log.log(loggingError);

//            //}

//        }


//        // Return the logging function.
//        return (log);

//    }
//);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







;
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    let isUnified = false;
    function getTemplate() {
        var elements = angular.element(document.getElementById('googleAnalytics'));
        isUnified = elements[0].IsUnified.value == "1" ? true : false;
    }
    getTemplate();
    function getChamberList(LookupSvc) {
        return new Promise(function (resolve, reject) {
            LookupSvc.GetChambersDrops().then(function (response) {
                resolve(response.data);
            }).catch(function (err) {
                reject(err)
            })
        })
    };
    $routeProvider
        .when('/LandingPage', { 
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                }]
            },
            title: 'الرئيسية',
            controller: 'LandingPageController',
            templateUrl: '/NgApp/Account/views/LandingPage.html' 
        })
        .when('/MemberLogin', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    authService.logOut();
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                    localStorage.clear();
                }]
            },
            title: 'تسجيل دخول',
            controller: 'LoginController',
            templateUrl: isUnified ? '/NgApp/Account/views/New-Login.html' : '/NgApp/Account/views/Login.html'
        })
        .when('/MemberLogin/:redirectUrl', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    authService.logOut();
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                    localStorage.clear();
                }]
            },
            title: 'تسجيل دخول',
            controller: 'LoginController',
            templateUrl: isUnified ? '/NgApp/Account/views/New-Login.html' : '/NgApp/Account/views/Login.html'
        })

        .when('/Nomination', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                }]
            },
            title: 'المترشحين',
            controller: 'NominationCandidateController',
            templateUrl: '/NgApp/NominationCandidate/Views/NominationCandidate.html'
        })
        .when('/NominationCommittees/Landing', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                }],
                inputs: function () {
                    return {
                        availableToVote: false,
                        showRequestsButton: true,
                        showVoteButton: true,
                        subHeader: 'اختر اللجنة المراد الترشح لها',
                    }
                }
            },
            title: 'اللجان القطاعية',
            controller: 'NominationLandingController',
            templateUrl: '/NgApp/NominationVoting/NominationCommittees/Views/NominationLanding.html'
        })
        .when('/NominationCommittees', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    $rootScope.memberShip = {};
                }],
                inputs: ["$location", "$rootScope", function ($location, $rootScope) {
                    return {
                        availableToVote: false,
                        showRequestsButton: true,
                        showVoteButton: true,
                        subHeader: 'أختر اللجنة المراد الترشح لها',
                        identityNumber: $rootScope.candidate.identityNumber,
                        jwtToken: $rootScope.candidate.memberShipToken
                    }
                }],
                //inputs: function () {
                //    return {
                //        availableToVote: false,
                //        showRequestsButton : true,
                //        showVoteButton : true,
                //        subHeader : 'اختر اللجنة المراد الترشح لها',                
                //    }
                //}
            },
            title: 'اللجان القطاعية',
            controller: 'NominationCommitteesController',
            templateUrl: '/NgApp/NominationVoting/NominationCommittees/Views/NominationCommittees.html'
        })
        .when('/NominationCommittees/Vote', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    $rootScope.memberShip = {};
                }
                ],
                inputs: ["$location", "$rootScope", function ($location, $rootScope) {
                    return {
                        availableToVote: true,
                        isVoting: true,
                        showRequestsButton: false,
                        showVoteButton: false,
                        identityNumber: $rootScope.candidate.identityNumber,
                        jwtToken: $rootScope.candidate.voteJwtToken,
                        subHeader: 'التصويت على ترشيح اللجان',
                        //header: 'اللجان المتاحة للتصويت',
                    }
                }] 
            },
            title: 'اللجان القطاعية',
            controller: 'NominationCommitteesController',
            templateUrl: '/NgApp/NominationVoting/NominationCommittees/Views/NominationCommittees.html'
        })
        .when('/NominationCommittees/Details/:CommitteeId', {
            resolve: {
                auth: ["$rootScope", "$location", function ($rootScope, $location) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    //TODO: return to the previous page if the committee is not found
                }]
            },
            title: 'عرض تفاصيل اللجنة',
            controller: 'NominationCommitteeController',
            templateUrl: '/NgApp/NominationVoting/NominationCommittees/Views/NominationCommittee.html'
        })
        .when('/NominationCommittees/:CommitteeId/Candidate', {
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if(!$rootScope.committee){
                        $window.location.href = '/#/NominationCommittees';
                    }
                }],
                inputs: ["$location", "$rootScope", function ($location, $rootScope) {
                    return {
                        successRedirectPath: $location.url() + '/Organizations',
                        header : 'تقديم طلب ترشح للجنة ' + $rootScope.committee.title
                    }
                }],
            },
            title: 'توثيق المرشح',
            controller: 'NominationCandidateAuthController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateAuth.html'
        })
        .when('/NominationCommittees/Candidate', {
            resolve: {
                //auth: ["$rootScope", "$window", function ($rootScope, $window) {
                //    $rootScope.IsNotLoggedIn = true;
                //    $rootScope.ShowLayout = true;
                //    //if (!$rootScope.committee) {
                //    //    $window.location.href = '/#/NominationCommittees';
                //    //}
                //}],
                inputs: ["$location", "$rootScope", function ($location, $rootScope) {
                    return {
                        successRedirectPath: '/NominationCommittees',
                        header: 'تقديم طلب ترشح للجنة '
                    }
                }],
            },
            title: 'توثيق المرشح',
            controller: 'NominationCandidateAuthController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateAuth.html'
        })
        .when('/NominationCommittees/:CommitteeId/Candidate/Organizations', {
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if ($rootScope.candidate == null || $rootScope.candidate == undefined) {
                        $window.location.href = '/#/NominationCommittees';
                    }
                }],
                inputs: ['$rootScope', function ($rootScope) {
                    return {
                        skipCandidacyCheck: false,
                        nextStepUrl: "/Submit",
                        isVoting: false,
                        header: 'تقديم طلب الترشح للجنة ' + $rootScope.committee.title,
                    }
                }]
            },
            title: 'عضويات المرشح',
            controller: 'NominationCandidateOrganizationsController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateOrganizations.html'
        })
        .when('/NominationCommittees/:CommitteeId/Candidate/Organizations/Submit', {
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    $rootScope.IsGrievanceRequest = false;
                    if ($rootScope.memberShip == null || $rootScope.memberShip == undefined) {
                        $window.location.href = '/#/NominationCommittees';
                    }
                }]
            },
            title: 'تقديم طلب ترشيح',
            controller: 'NominationCandidateSubmitRequestController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateSubmitRequest.html'
        })
        .when('/NominationCandidate/CandidacyApplication', {
            resolve: {
                auth: ["$rootScope", "$location", function ($rootScope, $location) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                }],
                inputs: ["$location", "$rootScope", function ($location, $rootScope) {
                    return {
                        successRedirectPath: $location.url() + '/List',
                        header: 'التحقق من حالات طلب الترشيح '
                    }
                }]
            },
            title: 'توثيق المرشح',
            controller: 'NominationCandidateAuthController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateAuth.html'
        })
        .when('/NominationCandidate/CandidacyApplication/List', {
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if ($rootScope.candidate == null || $rootScope.candidate == undefined) {
                        $window.location.href = '/#/NominationCommittees';
                    }
                }]
            },
            title: 'طلبات الترشح',
            controller: 'NominationCandidateCandidacyApplicationController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateCandidacyApplication.html'

        })
        .when('/NominationCandidate/CandidacyApplication/List/:RelatedRequestId', {
            resolve: {
                auth: ["$rootScope", "$location", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    $rootScope.IsGrievanceRequest = true;
                }]
            },
            title: 'تقديم طلب معاد تقديمه',
            controller: 'NominationCandidateSubmitRequestController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateSubmitRequest.html'
        })
        .when('/NominationCommittees/:CommitteeId/Voting/Auth', { // شاشة توثيق المصوت
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if ($rootScope.committee == null || $rootScope.committee == undefined) {
                        $window.location.href = '/#/NominationCommittees/Vote';
                    }
                }],
                inputs: ["$routeParams", "$rootScope", function ($routeParams, $rootScope) {
                    return {
                        successRedirectPath: "/NominationCommittees/" + $routeParams.CommitteeId + "/Voting/Memberships",
                        header: 'التصويت على ' + $rootScope.committee.title
                    }
                }],
            },
            title: 'توثيق المصوت',
            controller: 'NominationCandidateAuthController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateAuth.html'
        })
        .when('/NominationCommittees/:CommitteeId/Voting/Memberships', { // شاشة عضويات المصوت
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if ($rootScope.candidate == null || $rootScope.candidate == undefined) {
                        $window.location.href = '/#/NominationCommittees/Vote';
                    }
                }],
                inputs: ['$rootScope', function ($rootScope) {
                    return {
                        skipCandidacyCheck: true,
                        nextStepUrl: "/Vote",
                        isVoting: true,
                        header: 'التصويت لمرشحين ' + $rootScope.committee.title
                    }
                }]
            },
            title: 'عضويات المرشح',
            controller: 'NominationCandidateOrganizationsController',
            templateUrl: '/NgApp/NominationVoting/NominationCandidates/Views/NominationCandidateOrganizations.html'
        })
        .when('/NominationCommittees/:CommitteeId/Voting/Memberships/Vote', { // شاشة تصويت المصوت
            resolve: {
                auth: ["$rootScope", "$window", function ($rootScope, $window) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = true;
                    if ($rootScope.memberShip == null || $rootScope.memberShip == undefined) {
                        $window.location.href = '/#/NominationCommittees/Vote';
                    }
                }]
            },
            title: 'تقديم طلب معاد تقديمه',
            controller: 'NominationVoteController',
            templateUrl: '/NgApp/NominationVoting/NominationVoting/Views/NominationVote.html'
        })
        .when('/Landing', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الصفحة ا لرئيسية',
            requireLogin: true,
            controller: 'LandingController',
            templateUrl: isUnified ? '/NgApp/Landing/views/Landing-unified.html' : '/NgApp/Landing/views/Landing.html'
        })
        .when('/Home', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الصفحة ا لرئيسية',
            controller: 'HomeController',
            templateUrl: '/NgApp/Home/views/Index.html'
        })
        .when('/MemberData/GenerateChambersKeys', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'بيانات الغرف',
            controller: 'MemberDataController',
            templateUrl: '/NgApp/MemberData/views/GenerateChamberKeys.html'
        })
        .when('/MemberData/Certificate', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شهادة العضوية',
            controller: 'MemberDataController',
            templateUrl: '/NgApp/MemberData/views/Partials/CertificateCard.html'
        })
        .when('/MemberData', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'البيانات ا لرئيسية',
            controller: 'MemberDataController',
            templateUrl: '/NgApp/MemberData/views/Index.html'
        })
        .when('/Memberships', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'عضوياتي',
            controller: 'MembershipsController',
            templateUrl: '/NgApp/MemberData/views/Memberships.html'
        })
        .when('/MemberData/Card', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'بطاقتي',
            controller: 'MemberCardController',
            templateUrl: '/NgApp/MemberData/views/MemberCard.html'
        })

        .when('/MemberData/Profile', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: ' بياناتي ',
            controller: 'MemberDataController',
            templateUrl: '/NgApp/MemberData/views/Profile.html'
        })

        .when('/RequestsChart', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'رسم بيانى',
            controller: 'RequestsChartsController',
            templateUrl: '/NgApp/Charts/views/RequestsChart.html'
        })
        .when('/RequestsChart', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'رسم بيانى',
            controller: 'RequestsChartsController',
            templateUrl: '/NgApp/Charts/views/RequestsChart.html'
        })
        .when('/WalletsTrans', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'المحفظة',
            controller: 'WalletsTransController',
            templateUrl: '/NgApp/WalletsTrans/views/WalletsTrans.html'
        })
        .when('/Wallet/Transfer', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'تحويل من محفظة',
            controller: 'TransferController',
            templateUrl: '/NgApp/WalletsTrans/views/Transfer.html'
        })
        .when('/Member/Intergation/Index', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'التحديث على بيانات العضوية',
            controller: 'IntegratrionIndexController',
            templateUrl: '/NgApp/MemberData/views/Integration/Index.html'
        })
        .when('/CommericalManual/Intergation/Details/:id', {
            title: 'تفاصيل',
            controller: 'IntegratrionDetailsController',
            templateUrl: '/NgApp/MemberData/views/Integration/Details.html'
        })
        .when('/Committees/Edit/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'تعديل الطلب',
            controller: 'EditRequestController',
            templateUrl: '/NgApp/Committees/views/EditRequest.html'
        })
        .when('/CouncilsCandidate', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }]
            },
            title: 'المجالس القطاعية- طلب ترشح',
            controller: 'CouncilsController',
            templateUrl: '/NgApp/Councils/views/Candidate.html'
        })
        .when('/WalletCharge', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'WalletChargeController',
            templateUrl: '/NgApp/WalletsTrans/views/WalletCharge.html'
        })
        .when('/WalletCharge/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'WalletChargeController',
            templateUrl: '/NgApp/WalletsTrans/views/WalletCharge.html'
        })
        .when('/WalletConfirmPayment/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmPaymentPayTabController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmPaymentPayTab.html'
        })
        .when('/ConfirmPayment/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmTapPaymentController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmTapPayment.html'
        })
        .when('/Charge/Status/Success', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmPaymentMoyasarController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmPaymentMoyasar.html'
        })
        .when('/Charge/Status/Failed', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmPaymentMoyasarController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmPaymentMoyasar.html'
        })
        .when('/MWalletConfirmPayment/Success/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmPaymentMoyasarController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmPaymentMoyasar.html'
        })
        .when('/MWalletConfirmPayment/Failed/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'شحن المحفظة',
            controller: 'ConfirmPaymentMoyasarController',
            templateUrl: '/NgApp/WalletsTrans/views/ConfirmPaymentMoyasar.html'
        })
        .when('/ChargeRedirectPage', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: ' اعادة توجيه شحن المحفظة',
            controller: 'WalletChargeController',
            templateUrl: '/NgApp/WalletsTrans/views/ChargeRedirectPage.html'
        })
        .when('/Register/:chamb', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }]
            },
            title: 'تسجيل',
            controller: 'RegisterController',
            templateUrl: '/NgApp/Account/views/Register.html'
        })
        .when('/Register', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }],
                chamberList: ['LookupSvc', function (LookupSvc) {
                    return isUnified ? getChamberList(LookupSvc) : []
                }]
            },
            title: 'تسجيل جديد',
            controller: 'RegisterController',
            templateUrl: '/NgApp/Account/views/Register.html'
        })
        .when('/ForgetPassword/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }],
                chamberList: ['LookupSvc', function (LookupSvc) {
                    return isUnified ? getChamberList(LookupSvc) : []
                }]
            },
            title: 'نسيت كلمة السر',
            controller: 'ForgetPasswordController',
            templateUrl: '/NgApp/Account/views/ForgetPassword.html'
        })
        .when('/ResetPhoneNumber', {
            resolve: {
                chamberList: ['LookupSvc', function (LookupSvc) {
                    return isUnified ? getChamberList(LookupSvc) : []
                }]
            },
            title: 'تعديل رقم الجوال',
            controller: 'ResetPhoneNumberController',
            templateUrl: '/NgApp/Account/views/ResetPhoneNumber.html'
        })
        .when('/Profile/AccountInfo', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                    $rootScope.NavigationTitle = 'بيانات الحساب';
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ProfileController',
            templateUrl: '/NgApp/Home/views/Profile.html'
        })
        .when('/Profile/AccountInfo/NotMember', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                    $rootScope.NavigationTitle = ' بيانات الحساب';
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ProfileNotMemberController',
            templateUrl: '/NgApp/Home/views/ProfileNotMember.html'
        })
        .when('/Profile/AccountMembers', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ProfileController',
            templateUrl: '/NgApp/Home/views/MembersMerge.html'
        })
        .when('/Profile/ChangePassword', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ProfileController',
            templateUrl: '/NgApp/Home/views/Profile.html'
        })
        //.when('/Profile/:id/:cId', {
        //    resolve: {
        //        auth: ["$rootScope", function ($rootScope) {
        //            $rootScope.IsNotLoggedIn = false;
        //        }]
        //    },
        //    title: 'اعدادات عامة',
        //    controller: 'ProfileController',
        //    templateUrl: '/NgApp/Home/views/Profile.html'

        //})

        .when('/ChangePassTemp', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ProfileController',
            templateUrl: '/NgApp/Home/Views/ChangePassTemp.html'
        })
        .when('/ConfirmPhoneNumber', {
            resolve: {
                auth: ["$rootScope", 'session', function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                    if (session.getPropertyLocalStorage("WaitingConfirmPhone", false) === false) {
                        window.location.href = '/#/MemberLogin';
                    }
                }]
            },
            title: 'اعدادات عامة',
            controller: 'ConfirmPhoneNumberController',
            templateUrl: '/NgApp/Home/Views/ConfirmPhoneNumber.html'
        })
        .when('/PersonalRequests', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلب تحديث بيانات شخصية جديد',
            controller: 'RequestsController',
            templateUrl: '/NgApp/Request/views/PersonalRequests.html',
        })
        .when('/Print/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            controller: 'PrintController',
            templateUrl: '/NgApp/Print/views/Print.html'
        })
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Requests 
        .when('/NewRequest', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلب جديد',
            controller: 'NewRequestController',
            templateUrl: '/NgApp/Request/views/NewRequest.html'
        })
        .when('/NewRequest/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلب جديد',
            controller: 'NewRequestController',
            templateUrl: '/NgApp/Request/views/NewRequest.html'
        })
        .when('/Request/InstrumentDetails/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'تفاصيل السند',
            controller: 'InstrumentDetailsController',
            templateUrl: '/NgApp/Request/views/InstrumentDetails.html'
        })
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        .when('/FormVerify', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'التحقق من الوثيقة',
            controller: 'VerifyController',
            templateUrl: '/NgApp/DocumentVerify/views/FormVerify.html'
        })
        .when('/DocumentVerify', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }]
            },
            title: 'التحقق من الوثيقة',
            controller: 'VerifyController',
            templateUrl: '/NgApp/DocumentVerify/views/Verify.html'
        })

        .when('/DocumentVerify/:Id/mem/:mem', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }]
            },
            title: 'التحقق من الوثيقة',
            controller: 'VerifyController',
            templateUrl: '/NgApp/DocumentVerify/views/Verify.html'

        })
        .when('/DocumentVerify/:Id/identity/:identity', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.ShowLayout = false;
                    $rootScope.IsNotLoggedIn = true;
                }]
            },
            title: 'التحقق من الوثيقة',
            controller: 'VerifyController',
            templateUrl: '/NgApp/DocumentVerify/views/Verify.html'

        })
        .when('/Contact', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }],
                chamberList: ['LookupSvc', function (LookupSvc) {
                    return isUnified ? getChamberList(LookupSvc) : []
                }]
            },
            title: 'تحديث البيانات',
            controller: 'ContactUsController',
            templateUrl: '/NgApp/ContactUs/views/ContactUs.html'
        })
        .when('/MemberIdQuery/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }],
                chamberList: ['LookupSvc', function (LookupSvc) {
                    return isUnified ? getChamberList(LookupSvc) : []
                }]
            },
            title: 'الاستعلام عن رقم العضوية',
            controller: 'MemberIdQueryController',
            templateUrl: '/NgApp/Account/views/MemberIdQuery.html'
        })

        .when('/InstrumentPrint', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طباعة سند ',
            controller: 'InstrumentPrintController',
            templateUrl: '/NgApp/WalletsTrans/views/InstrumentPrint.html'
        })
        .when('/InstrumentPrint/:InstNum/transType/:transType', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طباعة سند ',

            controller: 'InstrumentPrintController',
            templateUrl: '/NgApp/WalletsTrans/views/InstrumentPrint.html'

        })
        .when('/Details/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'التفاصيل',
            controller: 'DetailsController',
            templateUrl: '/NgApp/Request/views/Details.html',
        })
        .when('/AllRequests/:RequestType', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'سجل  الطلبات',
            controller: 'AllRequestsController',
            templateUrl: '/NgApp/Request/views/AllRequests.html',
        })

        .when('/AllRequests', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'سجل الطلبات',
            controller: 'AllRequestsController',
            templateUrl: '/NgApp/Request/views/AllRequests/AllRequests.html'
        })

        .when('/CommericalManual', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }]
            },
            title: 'الدليل التجارى',
            controller: 'CommericalManualController',
            templateUrl: '/NgApp/Account/views/CommericalManual.html',
        })
        .when('/CommericalManual/:chamb', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }]
            },
            title: 'الدليل التجارى',
            controller: 'CommericalManualController',
            templateUrl: '/NgApp/Account/views/CommericalManual.html',
        })
        .when('/Users', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'المستخدمين',
            controller: 'UsersController',
            templateUrl: '/NgApp/Users/views/Users.html'
        })
        .when('/Users/AddEditUser', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'إضافة - تعديل المستخدم',
            controller: 'AddEditUserController',
            templateUrl: '/NgApp/Users/views/AddEditUser.html'
        })
        .when('/Users/AddEditUser/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'إضافة - تعديل المستخدم',
            controller: 'AddEditUserController',
            templateUrl: '/NgApp/Users/views/AddEditUser.html'
        })

        .when('/EmailConfirmed', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: ' التفعيل',

            controller: 'UsersController',
            templateUrl: '/NgApp/Users/views/EmailConfirmed.html'
        })
        .when('/NotFound', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الصفحة المطلوبة غير موجودة',
            controller: 'NotFoundController',
            templateUrl: '/NgApp/Shared/views/NotFound.html',
        })
        .when('/Committees/Index', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'المجالس القطاعية - الطلبات',
            controller: 'IndexController',
            templateUrl: '/NgApp/Committees/views/Index.html'
        })


        .when('/CommercialPartner/Index', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    $rootScope.IsNotLoggedIn = false;
                    function CheckuseService(response) {
                        if (response.data != null) {
                            if (response.data.data.useService != true && $rootScope.userInfo.globalSessionValues.CurrentMember.IsSubscriber != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckuseService);
                }]
            },
            title: 'اشتراكاتى',
            controller: 'SubscriptionsIndexController',
            templateUrl: '/NgApp/CommercialPartner/views/Index.html'
        })
        .when('/CommercialPartner/Info', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    $rootScope.IsNotLoggedIn = false;
                    function CheckuseService(response) {
                        if (response.data != null) {
                            if (response.data.data.useService != true && $rootScope.userInfo.globalSessionValues.CurrentMember.IsSubscriber != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckuseService);
                }]
            },
            title: 'اشتراكاتى',
            controller: 'ComPartnerInfoController',
            templateUrl: '/NgApp/CommercialPartner/views/ComParnterInfo.html'
        })

        .when('/CommercialPartner/Complaines', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    $rootScope.IsNotLoggedIn = false;
                    function CheckuseService(response) {
                        if (response.data != null) {
                            if (response.data.data.useService != true && $rootScope.userInfo.globalSessionValues.CurrentMember.IsSubscriber != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckuseService);
                }]
            },
            title: 'الشكاوي والمقترحات',
            controller: 'ComplainesController',
            templateUrl: '/NgApp/CommercialPartner/views/Complaines.html'
        })

        .when('/CommercialPartner/AddComplain', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    $rootScope.IsNotLoggedIn = false;
                    function CheckuseService(response) {
                        if (response.data != null) {
                            if (response.data.data.useService != true && $rootScope.userInfo.globalSessionValues.CurrentMember.IsSubscriber != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckuseService);
                }]
            },
            title: 'إضافة شكوى/مقترح ',
            controller: 'AddComplainController',
            templateUrl: '/NgApp/CommercialPartner/views/AddComplain.html'
        })

        .when('/Notifications', {
            title: 'الإشعارات',
            controller: 'NotificationsController',
            templateUrl: '/NgApp/Notifications/views/Notifications.html'
        })

        .when('/CommercialPartner/AddSubscribtion', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    $rootScope.IsNotLoggedIn = false;
                    function CheckuseService(response) {
                        if (response.data != null) {
                            if (response.data.data.useService != true && $rootScope.userInfo.globalSessionValues.CurrentMember.IsSubscriber != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckuseService);
                }]
            },
            title: 'اضافة اشتراك',
            controller: 'AddSubscribtionController',
            templateUrl: '/NgApp/CommercialPartner/views/AddSubscribtion.html'
        })

        .when('/CommercialsPartners', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }]
            },
            title: 'الشريك التجاري',
            controller: 'AddSubscribtionController',
            templateUrl: '/NgApp/CommercialPartner/views/AddSubscribtion.html'
        })

        .when('/CommercialPartner/ConditionsAndAgreements', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الشروط والاحكام',
            controller: 'ConditionsAndAgreementsController',
            templateUrl: '/NgApp/CommercialPartner/views/ConditionsAndAgreements.html'
        })
        //.when('/Meetings/Terms', {
        //    title: 'الجمعية العمومية - البنود',
        //    controller: 'MeetingTermsController',
        //    templateUrl: '/NgApp/Meetings/views/MeetingTerms.html'
        //})
        .when('/Meetings/Terms/:val', {
            resolve: {
                auth: ["$rootScope", "authService", function ($rootScope, authService) {
                    function CheckUseMeetingsKey(response) {
                        if (response.data != null) {
                            if (response.data.data.useMeetings != true) {
                                window.location.href = "/#/Login";
                            }
                        }
                    }
                    authService.GetConfig(CheckUseMeetingsKey);
                }]
            },
            title: 'الجمعية العمومية - البنود',
            controller: 'MeetingTermsController',
            templateUrl: '/NgApp/Meetings/views/MeetingTerms.html'
        })
        .when('/Meetings/Attendance', {
            title: 'الجمعية العمومية - حضور إجتماع',
            controller: 'MeetingAttendanceController',
            templateUrl: '/NgApp/Meetings/views/MeetingAttendance.html',
            reloadOnSearch: false
        })
        .when('/Meetings/Subscription', {
            title: 'الجمعية العمومية - التسجيل',
            controller: 'MeetingRegisterController',
            templateUrl: '/NgApp/Meetings/views/MeetingRegister.html'
        })
        .when('/Meetings/Vote/:id', {
            title: 'الجمعية العمومية - التصويت',
            controller: 'MeetingVoteController',
            templateUrl: '/NgApp/Meetings/views/MeetingVote.html'
        })
        .when('/Meetings/Vote/:id/:uid', {
            title: 'الجمعية العمومية - التصويت',
            controller: 'MeetingVoteController',
            templateUrl: '/NgApp/Meetings/views/MeetingVote.html'
        })
        .when('/Non-Members/Home', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الصفحة ا لرئيسية',
            controller: 'Non-HomeController',
            templateUrl: '/NgApp/Non-Subscribers/Home/views/Home.html'
        })
        .when('/Non-Members/Home/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'الصفحة ا لرئيسية',
            controller: 'Non-HomeController',
            templateUrl: '/NgApp/Non-Subscribers/Home/views/Home.html'
        })
        .when('/Non-Members/Requests/Delegation', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلب للحصول على تفويض على عضوية',
            controller: 'RequestDelegationController',
            templateUrl: '/NgApp/Non-Subscribers/Requests/views/RequestDelegation.html'
        })
        .when('/Requests/Delegations', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلبات التفويض - غير المشتركين',
            controller: 'DelegationRequestsController',
            templateUrl: '/NgApp/Request/views/DelegationRequests.html'
        })
        .when('/Non-Members/HandleDelegation/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'إتخاذ إجراء على طلب تفويض',
            controller: 'HandleDelegationRequestController',
            templateUrl: '/NgApp/Non-Subscribers/Requests/Views/HandleDelegationRequest.html'
        })
        .when('/Non-Members/Requests/New/:id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope, session) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'طلب جديد - غير المشتركين',
            controller: 'NonMembersNewRequestController',
            templateUrl: '/NgApp/Non-Subscribers/Requests/Views/NewRequest/NewRequest.html'
        })
        .when('/WSSPAYWalletConfirmPayment', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            title: 'إتمام الدفع',
            controller: 'WSSPAYWalletConfirmPaymentController',
            templateUrl: '/NgApp/WalletsTrans/Views/WSSPAYWalletConfirmPayment.html'
        })
        .when('/NonMemberRequest/Details/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            controller: 'DetailsController',
            templateUrl: '/NgApp/Non-Subscribers/Requests/Views/Details.html'
        })
        .when('/NonMemberRequest/Receipt/:Id', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = false;
                }]
            },
            controller: 'ReceiptController',
            templateUrl: '/NgApp/Non-Subscribers/Requests/Views/Receipt.html'
        })
        .when('/New-Login', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }],
            },
            title: 'تسجيل دخول (جديد)',
            controller: 'NewLoginController',
            templateUrl:  '/NgApp/Account/views/New-Login.html'
        })
        .when('/Login', {
            resolve: {
                auth: ["$rootScope", function ($rootScope) {
                    $rootScope.IsNotLoggedIn = true;
                    $rootScope.ShowLayout = false;
                }],
            },
            title: 'بوابة خدمات الغرف',
            controller: 'NewAnonymousLandingController',
            templateUrl: '/NgApp/New-Anonymous-Landing/views/New-Anonymous-Landing.html'
        })
        .otherwise(
            {
                resolve: {
                    auth: function (messageService) {
                        window.location.href = '/#/Login';
                    }
                }
            }
        );
    $locationProvider.hashPrefix('');
}]);;
