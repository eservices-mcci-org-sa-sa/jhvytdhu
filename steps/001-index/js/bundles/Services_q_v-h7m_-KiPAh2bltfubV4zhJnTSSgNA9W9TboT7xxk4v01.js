/* Minification failed. Returning unminified contents.
(182,55-56): run-time error JS1195: Expected expression: .
(182,83-84): run-time error JS1004: Expected ';': )
(182,85-95): run-time error JS1004: Expected ';': $rootScope
(183,13-14): run-time error JS1002: Syntax error: }
(183,49-50): run-time error JS1004: Expected ';': {
(184,14-15): run-time error JS1195: Expected expression: )
(188,37-38): run-time error JS1195: Expected expression: )
(188,39-40): run-time error JS1004: Expected ';': {
(205,22-23): run-time error JS1014: Invalid character: `
(205,67-68): run-time error JS1003: Expected ':': {
(205,82-83): run-time error JS1003: Expected ':': }
(205,83-84): run-time error JS1014: Invalid character: `
(215,62-63): run-time error JS1100: Expected ',': =
(693,5-6): run-time error JS1002: Syntax error: }
(699,8-9): run-time error JS1197: Too many errors. The file might not be a JavaScript file: .
(189,13-40): run-time error JS1018: 'return' statement outside of function: return session.checkLogin()
 */
(function (angular) {

    function localStorageServiceFactory($window) {
        if ($window.localStorage) {
            return $window.localStorage;
        }
        throw new Error('Local storage support is needed');
    }

    // Inject dependencies
    localStorageServiceFactory.$inject = ['$window'];

    // Export
    angular
        .module('AppModule')
        .factory('localStorage', localStorageServiceFactory);

})(angular);;
app.service('session', ['$rootScope', 'ngProgress', 'localStorage', '$location',
    function sessionService($rootScope, ngProgress, localStorage, $location) {

        this._user = JSON.parse(localStorage.getItem('userInfo_' + $location.$$host));

        this.getUser = function () {
            return this._user;
        };

        this.checkLogin = function () {
            var Currentdate = new Date();
            var expiredate = new Date();
            if (this.getUserInfo() !== null) {
                if ($rootScope.userInfo !== null && $rootScope.userInfo !== '' && $rootScope.userInfo !== undefined) {
                    expiredate = new Date($rootScope.userInfo.expires);
                }
            }
            if (localStorage['userInfo_' + $location.$$host] !== undefined && localStorage['userInfo_' + $location.$$host] !== null && $rootScope.userInfo !== null && Currentdate <= expiredate) {
                $rootScope.userInfo = JSON.parse(localStorage['userInfo_' + $location.$$host]);
                return true;
            } else {
                ngProgress.complete();
                $rootScope.SubmitLogin = false;
                $rootScope.ErrorLogin = true;
                localStorage.clear();
                return false;
            }
        };

        this.setUser = function (user,) {
            this._user = user;
            localStorage.setItem('userInfo_' + $location.$$host, JSON.stringify(user));
            return this;
        };

        this.getAccessToken = function () {
            return localStorage.getItem('userInfo.accessToken');
        };

        this.getUserInfo = function () {
            if (localStorage['userInfo_' + $location.$$host]) {
                $rootScope.userInfo = JSON.parse(localStorage.getItem('userInfo_' + $location.$$host));
                return localStorage.getItem('userInfo_' + $location.$$host);
            } else {
                return null;
            }
        };

        this.setAccessToken = function (token) {
            this._accessToken = token;
            localStorage.setItem('session.accessToken', token);
            return this;
        };

        this.setDataToUserInfo = function (key, value) {
            localStorage.setItem('userInfo.' + key, value);
            return this;
        };

        this.addDataToLocalStorage = function (key, value) {
            localStorage.setItem(key, value);
        };
        this.getDataFromLocalStorage = function (key) {
            return localStorage.getItem(key);
        };

        this.updateDataToLocalStorage = function (key, value) {
            var userInfo = JSON.parse(localStorage.getItem(key));
            userInfo = userInfo[key] = value;
            localStorage.setItem('userInfo_' + $location.$$host, JSON.stringify(userInfo));
            return this;
        };

        this.updateLocalStorage = function (key, value, out) {
            try {
                var userInfo = JSON.parse(localStorage.getItem('userInfo_' + $location.$$host));
                if (userInfo === null || userInfo === undefined) {
                    window.location.href = '/#/Login';
                }
                if (out) {
                    userInfo[key] = value;
                } else {
                    userInfo.globalSessionValues[key] = value;
                }

                localStorage['userInfo_' + $location.$$host] = JSON.stringify(userInfo);
                $rootScope.userInfo = userInfo;

            } catch (e) {
                window.location.href = '/#/Login';
            }
            return this;
        };
        this.updateGlobalSessionValues = function (data) {
            var userInfo = JSON.parse(localStorage.getItem('userInfo_' + $location.$$host));
            if (userInfo === null) {
                window.location.href = '/#/Login';
            }

            angular.forEach(data, function (value, key) {
                userInfo.globalSessionValues[key] = value;
            });

            localStorage['userInfo_' + $location.$$host] = JSON.stringify(userInfo);
            $rootScope.userInfo = userInfo;
            return this;
        };
        this.getPropertyLocalStorage = function (key, out) {
            var userInfo = JSON.parse(localStorage.getItem('userInfo_' + $location.$$host));
            if (userInfo === null || userInfo === '' || userInfo === undefined || userInfo === {}) {
                window.location.href = '/#/Login';
            }
            if (out) {
                return userInfo[key];
            } else {
                if (userInfo === null || userInfo === undefined || userInfo === '') {
                    window.location.href = '/#/Login';
                }
                if (key.includes(".")) {
                    var keys = key.split(".");
                    if (keys.length > 1) {
                        if (userInfo.globalSessionValues[keys[0]] != null && userInfo.globalSessionValues[keys[0]] != undefined)
                            return userInfo.globalSessionValues[keys[0]][keys[1]];
                    }
                    else {
                        return userInfo.globalSessionValues[keys[0]];
                    }
                }
                // return userInfo.globalSessionValues[key];
            }
        };

        /**
         * Destroy session
         */
        this.destroy = function destroy() { 
            localStorage['userInfo_' + $location.$$host] = null;
            localStorage["stopInterval"] = null;
            //localStorage["EmailConfirmed"] = null;
            //localStorage["EmailConfirmedMsgShowed"] = null;
        };

    }]);;
(function (angular) {
    function AuthService($http, $rootScope, session, Idle, ngProgress, uiTourService, ngNotify, $q, $window, $location, appConst, $routeParams, blockUI, $timeout, nzTour, $interval) {

        $rootScope.userInfo;
        $rootScope.intervals = [];
        $rootScope.showSpin = false;
        $rootScope.submitLogin = false;
        $rootScope.errorLogin = true;
        $rootScope.timeElapsed = 240;
        $rootScope.showChamberLogo = true;
        $rootScope.loadChamberLogo = false;
        $rootScope.chamberSettings = {};
        $rootScope.UserIsLocked = false;

        var timer;

        init();
        function init() {
            return $http.post('api/Account/GetConfig').then(function (response) {
                $rootScope.chamberSettings = response.data.data;
                if (typeof $rootScope.chamberSettings?.dynamicRequests == 'string') $rootScope.chamberSettings.dynamicRequests = JSON.parse($rootScope.chamberSettings.dynamicRequests);
            }, function errorCallback(response) {
            });
        }


        this.checkLogin = function () {
            return session.checkLogin();
        };


        this.isLoggedIn = function isLoggedIn() {
            return session.getUser() !== null;
        };

        //Login Area
        this.loginNafath = function (identityNumber,captcha) {
            if (session.getDataFromLocalStorage('signalRId') == null) {
                session.addDataToLocalStorage('signalRId', Math.random().toString(36).substring(7));
            }
            let SignalId = session.getDataFromLocalStorage('signalRId');

            return $http({
                url: `/api/Account/NafathSendCode?identityNumber=${identityNumber}`,
                method: "POST",
                data: { 'identityNumber': identityNumber, 'ReCaptchaResponse': captcha },
                timeout: 1 * 10 * 10000,
                headers: { 'X-App-Type': '', 'SignalId': SignalId }
            }).then(function (response) {
                return response.data;
            });
        }
        //canLogin check can login automatically after register or not
        this.login = function (user, canLogin, transactionId = '') {
            return $http({
                url: "/Token",
                method: "POST",
                timeout: 1 * 10 * 10000,
                data: $.param({
                    grant_type: 'password', username: user.username, password: user.password,
                    canLogin: canLogin,
                    transactionId: transactionId
                }),
                headers: { 'Content-Type': 'application/x-form-urlencoded', 'X-App-Type': '' }
            }).then(function (result) {
                
                $timeout(function () {
                    $rootScope.showSpin = false;
                    ngProgress.complete();
                });
                $rootScope.userInfo = setUserLoginData(result);
                if ($rootScope.userInfo.globalSessionValues.ErrorMessage) {
                    $rootScope.submitLogin = false;
                    $rootScope.showSpin = false;
                    user.username = null;
                    user.password = null;
                    $rootScope.Message = $rootScope.userInfo.globalSessionValues.ErrorMessage;
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }

                if (canLogin) { //In case register with Absher login automatically and redirect to confirm phonenumber page
                    $rootScope.UserLoginExpiration = $rootScope.userInfo;

                    //add user info to local storage
                    session.setUser($rootScope.userInfo);

                    //check email is confirmd  
                    session.updateLocalStorage('EmailConfirmed', (($rootScope.userInfo.globalSessionValues.EmailConfirmed !== true) ? false : true), false);
                    session.updateLocalStorage('EmailConfirmedMsgShowed', (($rootScope.userInfo.globalSessionValues.EmailConfirmed !== true) ? false : true), false);
                    //start idle
                    Idle.watch();

                    blockUI.stop();
                    window.location.href = '/#/Landing';
                }
                else {

                    //show last 4 digits for user mobile
                    $rootScope.currUserMobile = $rootScope.userInfo.globalSessionValues.UserData.PhoneNumber !== null
                        || $rootScope.userInfo.globalSessionValues.UserData.PhoneNumber !== undefined ? '******' + $rootScope.userInfo.globalSessionValues.UserData.PhoneNumber.slice(6) : '';

                    $rootScope.activateByAbshir = $rootScope.userInfo.globalSessionValues.ChamberData.ActivateByAbshir;
                    $rootScope.useTcc = $rootScope.userInfo.globalSessionValues.UseTcc;
                    $rootScope.sendByRayah = $rootScope.userInfo.globalSessionValues.ChamberData.SendByRayah;

                    $rootScope.codeMaxLength = ($rootScope.activateByAbshir === true || $rootScope.sendByRayah === true) && $rootScope.useTcc != true ? 6 : 4;

                    //redirect to TFA step
                    $rootScope.showLogin = false;
                    $rootScope.showSpin = false;
                    $rootScope.showTFA = true;
                    $rootScope.showRetrySendCode = true;
                    startTimer();
                }

            }, function (error) {
                handleLoginErrors(error);
            });
        };

        this.confirmLogin = function (data) {
            try {
                if ($rootScope.userInfo === null || $rootScope.userInfo === undefined || $rootScope.userInfo === {}) {
                    window.location.href = '/#/Login';
                }
                var _data = {
                    UserName: data.username,
                    MobileLoginCode: data.mobileLoginCode,
                    Token: $rootScope.userInfo.accessToken,
                    TrackId: $rootScope.userInfo.globalSessionValues.TrackId,
                    ActivateByAbshir: $rootScope.activateByAbshir,
                    UseTcc: $rootScope.userInfo.globalSessionValues.UseTcc,
                    SendByRayah: $rootScope.sendByRayah
                };
                return $http.post('/api/Account/ConfirmUserLogin', _data, null).then(function (response) {
                    $rootScope.showChamberLogo = true;
                    $rootScope.loadChamberLogo = false;
                    if (!response.data.success) {
                        $rootScope.confirmLoginErrors = response.data.message;
                        $rootScope.showSpin = false;
                        return false;
                    }
                    stopTimer();

                    $rootScope.userInfo.globalSessionValues.UserData.LastLoginDate = response.data.data.lastLogin;
                    $rootScope.userInfo.globalSessionValues.UserData.ShowMobileBanner = response.data.data.showMobileBanner;
                    $rootScope.UserLoginExpiration = $rootScope.userInfo;

                    if ($rootScope.userInfo.globalSessionValues.UserData.LastLoginDate === null || $rootScope.userInfo.globalSessionValues.UserData.LastLoginDate === undefined) {
                        session.addDataToLocalStorage('ShowWalletNotify', true);
                    }


                    //add user info to local storage
                    session.setUser($rootScope.userInfo);

                    //check email is confirmd  
                    session.updateLocalStorage('EmailConfirmed', (($rootScope.userInfo.globalSessionValues.EmailConfirmed !== true) ? false : true), false);
                    session.updateLocalStorage('EmailConfirmedMsgShowed', (($rootScope.userInfo.globalSessionValues.EmailConfirmed !== true) ? false : true), false);


                    //start idle
                    Idle.watch();

                    if (!$rootScope.userInfo.globalSessionValues.CurrentMember) {
                        window.location.href = '/#/Landing';
                    }
                    else if (!$rootScope.userInfo.globalSessionValues.IsPasswordTemp) {
                        //.replace("+", "/")
                        var redirectURL = $routeParams.redirectUrl !== null && $routeParams.redirectUrl !== undefined
                            ? $routeParams.redirectUrl.substring($routeParams.redirectUrl.lastIndexOf('=') + 1).replace("+", "/") : "Landing";
                        redirectURL = redirectURL.replace("+", "/");
                        window.location.href = '/#/' + redirectURL;
                    }
                    else {
                        window.location.href = '/#/ChangePassTemp';
                    }

                    $rootScope.showSpin = false;
                }, function (error) {
                    handleLoginErrors(error);
                });
            } catch (e) {
                window.location.href = '/#/Login';
            }

        };

        this.resendLoginCode = function () {
            $rootScope.confirmLoginErrors = '';
            var data = {
                UserName: userInfo.userName,
                Token: userInfo.accessToken,
                PhoneNumber: userInfo.globalSessionValues.PhoneNumber
            };
            return $http.post('/api/Account/ResendLoginCode', data, null)
                .then(function successCallback(response) {
                    if (response.data.success) {
                        ngNotify.set(appConst.codeSentSuccess, {
                            position: 'top',
                            type: 'success'
                        });
                        userInfo.globalSessionValues.TrackId = response.data.data;
                        $rootScope.showRetrySendCode = false;
                        $rootScope.timeElapsed = 240;
                        startTimer();
                        return false;
                    }
                    else {
                        ngNotify.set(response.data.message, {
                            position: 'top',
                            type: 'error'
                        });
                        return false;
                    }

                }, function errorCallback(response) {
                    ngNotify.set(response.data.message, {
                        position: 'top',
                        type: 'error'
                    });
                    return false;
                });
        };


        this.resendLoginCodeForAbshir = function () {
            $rootScope.confirmLoginErrors = '';
            var data = {
                UserName: userInfo.userName,
                Token: userInfo.accessToken,
                PhoneNumber: userInfo.globalSessionValues.PhoneNumber
            };
            return $http.post('/api/Account/ResendLoginCodeForAbshir', data, null)
                .then(function successCallback(response) {
                    if (response.data.success) {
                        ngNotify.set(appConst.codeSentSuccess, {
                            position: 'top',
                            type: 'success'
                        });
                        userInfo.globalSessionValues.TrackId = response.data.data;
                        $rootScope.showRetrySendCode = false;
                        $rootScope.timeElapsed = 240;
                        startTimer();
                        return false;
                    }
                    else {
                        ngNotify.set(response.data.message, {
                            position: 'top',
                            type: 'error'
                        });
                        return false;
                    }

                }, function errorCallback(response) {
                    ngNotify.set(response.data.message, {
                        position: 'top',
                        type: 'error'
                    });
                    return false;
                });
        };
        function setUserLoginData(result) {
            return userInfo = {
                accessToken: result.data.access_token,
                userName: result.data.userName,
                expires_in: result.data.expires_in,
                expires: result.data['.expires'],
                issued: result.data['.issued'],
                globalSessionValues: angular.fromJson(result.data._globalSessionValues)
            };
        }


        function startTimer() {
            $rootScope.showRetrySendCode = false;
            timer = setInterval(function () {
                $rootScope.timeElapsed = --$rootScope.timeElapsed;
                if ($rootScope.timeElapsed <= 0) {
                    clearInterval(timer);
                    $rootScope.showRetrySendCode = true;
                }
            }, 1000);
        }

        function stopTimer() {
            $rootScope.timeElapsed = 240;
            clearInterval(timer);
        }

        function handleLoginErrors(response) {
            //reset login form
            $('#loginForm').find("input[type=text],input[type=password]").val("");
            $rootScope.SubmitLogin = false;
            $rootScope.showSpin = false;
            $rootScope.ErrorLogin = true;
            $rootScope.UserIsLocked = false;

            //clear local storage
            session.destroy();

            if (response.data.error === "invalid_grant") {
                if (response.data.error_description === "The expire date is ended.") {
                    localStorage.clear();
                    $rootScope.Message = appConst.userAccountIsExpired;
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === appConst.updateInfoAddPhoneNumber) {
                    localStorage.clear();
                    $rootScope.Message = appConst.updateInfoAddPhoneNumber;
                    ngNotify.set(appConst.updateInfoAddPhoneNumber, {
                        position: 'top',
                        type: 'error'
                    });
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === appConst.accountNotActivatedGoChamber) {
                    localStorage.clear();
                    $rootScope.Message = appConst.accountNotActivatedGoChamber;
                    ngNotify.set(appConst.accountNotActivatedGoChamber, {
                        position: 'top',
                        type: 'error'
                    });
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === appConst.memberMasterNotActive) {
                    localStorage.clear();
                    $rootScope.Message = appConst.memberMasterNotActive;
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === appConst.connectionError) {
                    localStorage.clear();
                    $rootScope.Message = appConst.connectionError;
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === "InValidLogin") {
                    //
                    localStorage.clear();
                    $rootScope.Message = '<span>حسابك مسجل بغرفة اخرى ، للدخول على بوابة المشترك للغرفة الخاصة بك <a href="' + response.data.error_uri + '">إضغط هنا</a></span>';
                    $location.path('/Login');
                    ngProgress.complete();
                    return false;
                }
                else if (response.data.error_description === "LockOutError") {
                    $rootScope.user = {};
                    $rootScope.Message = response.data.error_uri;
                    // $rootScope.Message = 'تم إيقاف الحساب';

                    if (!response.data.error_uri.includes('1') && !response.data.error_uri.includes('2') && !response.data.error_uri.includes('3') &&
                        !response.data.error_uri.includes('4') && !response.data.error_uri.includes('5')) {
                        $rootScope.Message = 'تم إيقاف الحساب';
                        $rootScope.UserIsLocked = true;
                    }

                    ngProgress.complete();
                    localStorage.clear();
                    return false;
                }
                else {
                    $rootScope.Message = response.data.error_description;
                    ngProgress.complete();
                    localStorage.clear();
                }
            }
        }

        this.fetchUserInfo = function () {
            return $rootScope.userInfo;
        };

        this.GetConfig = function (callback) {
            return $http.post('api/Account/GetConfig').then(function successCallback(response) {
                callback ? callback(response) : $rootScope.chamberSettings = response.data.data;
            }, function errorCallback(response) {
                throw new Error("Error");
            });
        };

        this.logOut = function () {
            ngProgress.start();
            $rootScope.TimeElapsed = 240;
            $rootScope.showSpin = false;
            var tour = uiTourService.getTourByName('demoTour');
            if (tour !== null && tour !== undefined) {
                tour.end();
            }

            angular.forEach($rootScope.intervals, function (interval) {
                $interval.cancel(interval);
            });
            $rootScope.intervals.length = 0;

            sessionStorage.removeItem('meetingConfirmModal');
            sessionStorage.removeItem('meetingTermsModal');

            var deferred = $q.defer();
            if ($window.localStorage['userInfo_' + $location.$$host] !== undefined && $window.localStorage['userInfo_' + $location.$$host] !== null) {
                $rootScope.userInfo = JSON.parse($window.localStorage['userInfo_' + $location.$$host]);
                if ($rootScope.userInfo !== null) {
                    var req = {
                        method: 'POST',
                        url: 'api/Account/Logout',
                        headers: {
                            Authorization: 'Bearer ' + $rootScope.userInfo.accessToken
                        },
                        unique: true,
                        requestId: 'create-comment'
                    };
                    $http(req).then(function (response) {
                        session.destroy();
                        $rootScope.ShowLayout = false;
                        $rootScope.SubmitLogin = false;
                        $rootScope.ErrorLogin = false;
                        $rootScope.Message = "";
                        if ($location.absUrl().indexOf('Landing') !== -1) {
                            $rootScope.ShowLayout = false;
                            $location.path('/Login');
                        } else {
                            $location.path($location.path() !== '/MemberLogin' ? 'MemberLogin/redirectUrl=' + $location.path().substr(1).replace(/\//g, "+").replace("redirectUrl=MemberLogin+", "") : '/MemberLogin');
                        }
                        deferred.resolve(response);
                    });
                } else {
                    session.destroy();
                    $rootScope.ShowLayout = false;
                    $rootScope.SubmitLogin = false;
                    $rootScope.ErrorLogin = false;
                    if ($location.absUrl().indexOf('Landing') !== -1) {
                        $rootScope.ShowLayout = false;
                        $location.path('/Login');
                    } else {
                        $location.path($location.path() !== '/MemberLogin' ? 'MemberLogin/redirectUrl=' + $location.path().substr(1).replace(/\//g, "+").replace("redirectUrl=MemberLogin+", "") : '/MemberLogin');
                    }
                    deferred.resolve(null);
                }
            }
            else {
                if ($location.absUrl().indexOf('Register') !== -1) {
                    $rootScope.ShowLayout = false;
                    document.title = "تسجيل جديد";
                    $location.path('/Register');
                }
                else if ($window.location.href.indexOf("ForgetPassword") > -1) {
                    $rootScope.ShowLayout = false;
                }
                else if ($location.absUrl().indexOf('DocumentVerify') !== -1) {
                    $rootScope.ShowLayout = false;
                    document.title = "التحقق من الوثائق";
                    $location.path('/DocumentVerify');
                }
                else if ($location.absUrl().indexOf('FormVerify') !== -1) {
                    $rootScope.ShowLayout = false;
                    document.title = "FormVerify";
                    $location.path('/FormVerify');
                }
                else if ($location.path() === '/DocumentVerify/:id') {
                    $rootScope.ShowLayout = false;
                    document.title = "DocumentVerify";
                    $location.path('/DocumentVerify/:id');
                }
                else {
                    var x = $location.path().substr(1).replace(/\//g, "+").replace("redirectUrl=MemberLogin+", "").replace("MemberLogin+", "");
                    //$location.path($location.path() !== '/MemberLogin' ? 'MemberLogin/' + x : '/MemberLogin');
                    session.destroy();
                    $rootScope.ShowLayout = false;
                    $rootScope.SubmitLogin = false;
                    $rootScope.ErrorLogin = false;
                }
            }
            ngProgress.complete();
            localStorage.clear();
            return deferred.promise;
        };

        this.CheckPriv = function (key, callback) {
            var checkLogin = this.checkLogin();
            var NullData = {};
            if (checkLogin === true) {
                $http({
                    method: 'GET',
                    url: encodeURIComponent('api/Account/CheckUserPriv/' + key),
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function successCallback(response) {
                    callback(response);
                }, function errorCallback(response) {
                    throw new Error("Error");
                });
            }
            else {
                callback(NullData);
            }
        };

        this.CheckCustomPriv = function (key, callback) {
            var checkLogin = this.checkLogin();
            var NullData = {};
            if (checkLogin === true) {
                if ($rootScope.userInfo.globalSessionValues.CurrentMember != null) {
                    if ($rootScope.userInfo.globalSessionValues.CurrentMember.IsAdmin) {
                        callback(true);
                    } else {
                        var privleges = $rootScope.userInfo.globalSessionValues.CurrentMember.Privleges;
                        if (privleges !== null && privleges !== undefined && privleges !== '') {
                            if (privleges.indexOf(key) !== -1) {
                                callback(true);
                            }
                        } else {
                            callback(NullData);
                        }
                    }
                }
            }
            else {
                callback(NullData);
            }
        };
    }

    // Inject dependencies
    AuthService.$inject = ['$http', '$rootScope', 'session', 'Idle', 'ngProgress', 'uiTourService', 'ngNotify', '$q', '$window', '$location', 'appConst', '$routeParams', 'blockUI','$timeout', 'nzTour', '$interval'];

    // Export
    app.service('authService', AuthService);
})(angular);


;
app.service('auditService', ['$http', '$rootScope', 'authService',
 function AuditService($http, $rootScope, authService) {

        this.InsertAuditPage = function (pageTitle, pageUrl) {
            var checkLogin = authService.checkLogin(); 
            if (checkLogin) { 
                $http({
                    method: 'POST',
                    url: 'api/Users/InsertAuditPage',
                    data: { PageTitle: pageTitle, PageUrl: pageUrl },
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken
                    }
                }).then(function successCallback(response) {
                    return true;
                }, function errorCallback(response) {
                    return false;
                });
            }
        };
         
    }]);



;
app.factory("httpRequestSvc", ['$http', '$q', '$rootScope', 'authService','session',
    function ($http, $q, $rootScope, authService, session) {
 
        function CheckDetailsAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var req = {
                    method: 'GET',
                    url: data.url,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
 
        }
        function CheckDetailsNoAuthorize(data, headers) {
            var deferred = $q.defer();
            if (data != undefined) {
                var req = {
                    method: 'GET',
                    url: data.url,
                };
                if(headers) {
                    req.headers = headers;
                }
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckAddOrUpdateNoAuthorize(data, headers) {
            var deferred = $q.defer();
            if (data != undefined) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                };
                if(headers) req.headers = headers;
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
 
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckDetailsNoAuthorize(data, headers) {
            var deferred = $q.defer();
            if (data != undefined) {
                var req = {
                    method: 'GET',
                    url: data.url,
                };
                if(headers) {
                    req.headers = headers;
                }
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckAddOrUpdateNoAuthorize(data, headers) {
            var deferred = $q.defer();
            if (data != undefined) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                };
                if(headers) req.headers = headers;
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {

                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckAddAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
 
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckAddAuthorizee(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
 
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckDeleteAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
 
        }
        function CheckUpdateAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: data.details,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
 
        }
        function CheckAddAuthorizeWithFiles(data, files) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var fd = new FormData();
                for (var i = 0; i < files.length; i++) {
                    fd.append("file" + i, files[i]);
                }
                var info = data.details;
                fd.append('data', angular.toJson(info));
                var req = {
                    method: 'POST',
                    url: data.url,
                    headers: {
                        'Content-Type': undefined,
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        RequestType: info.RequestType,
                        MembershipClassId: session.getPropertyLocalStorage('MembershipClassId', false),
                        "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                    },
                    transformRequest: angular.identity,
                    data: fd
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function (response) {
 
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckUpdateWithFileAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                var formData = new FormData();
                formData.append("file", data.file);
                formData.append("EmpNum", data.details.EmpNum);
                formData.append("BloodType", data.details.BloodType);
                formData.append("ChildrensNumber", data.details.ChildrensNumber);
                formData.append("DriverLicenseNum", data.details.DriverLicenseNum);
                formData.append("DriverLicenseIssueDate ", data.details.DriverLicenseIssueDate);
                formData.append("DriverLicenseExpiryDate ", data.details.DriverLicenseExpiryDate);
                formData.append("EmpHealthInusranceNum  ", data.details.EmpHealthInusranceNum);
                formData.append("PassportNum  ", data.details.PassportNum);
                formData.append("Passport_IssuePlace  ", data.details.Passport_IssuePlace);
                formData.append("PassportIssueDate  ", data.details.PassportIssueDate);
                formData.append("PassportExpiryDate  ", data.details.PassportExpiryDate);
                var req = {
                    method: 'POST',
                    url: data.url,
                    data: formData,
                    transformRequest: angular.identity,
                    headers: {
                        Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                        'Content-Type': undefined
                    }
                };
                $http(req).then(function (response) {
                    deferred.resolve(response.data);
                });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
        function CheckUpdateWithFileNoDataAuthorize(data) {
            var deferred = $q.defer();
            var checkLogin = authService.checkLogin();
            if (checkLogin) {
                for (var i = 0; i < data.files.length; i++) {
                    var formData = new FormData();
                    formData.append("file", data.files[i]);
                    formData.append("Id", data.details.RequestId);
                    formData.append("AttachmentDesc", data.details.AttachmentDesc);
 
                    var req = {
                        method: 'POST',
                        url: data.url,
                        data: formData,
                        transformRequest: angular.identity,
                        headers: {
                            Authorization: 'Bearer ' + $rootScope.userInfo.accessToken,
                            'Content-Type': undefined,
                            "X-MM-ID": session.getPropertyLocalStorage('CurrentMember.MemberId', false)
                        }
                    };
                    $http(req);
                    console.log(i);
                }
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }
 
        return {
            CheckDetailsAuthorize: CheckDetailsAuthorize,
            CheckAddAuthorize: CheckAddAuthorize,
            CheckUpdateAuthorize: CheckUpdateAuthorize,
            CheckDeleteAuthorize: CheckDeleteAuthorize,
            CheckUpdateWithFileAuthorize: CheckUpdateWithFileAuthorize,
            CheckEdiUpdateFileNoDataAuthorize: CheckUpdateWithFileNoDataAuthorize,
            CheckAddAuthorizeWithFiles: CheckAddAuthorizeWithFiles,
            CheckAddAuthorizee: CheckAddAuthorizee,
            CheckDetailsNoAuthorize: CheckDetailsNoAuthorize,
            CheckAddOrUpdateNoAuthorize: CheckAddOrUpdateNoAuthorize,
        };
    }]);;
(function (angular) {
    function SharedService($rootScope, $window, $filter, toaster, $http, $uibModal, session, Idle, $interval, globalService, $location, blockUI, authService, httpRequestSvc,
        auditService, $route, $q, UsersSvc, appConst, ngNotify, $routeParams, $timeout, CommercialPartnerSvc, registerService) {

        this.GetbrowserInfo = function () {
            var updateLink = '';
            if ($location.absUrl().indexOf('Login') !== -1) {
                var userAgent = $window.navigator.userAgent;
                var browser = '';
                var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };
                for (var key in browsers) {
                    if (browsers[key].test(userAgent)) {
                        browser = key;
                    }
                }

                switch (browser) {
                    case 'ie':
                        var IEVersion = parseInt(userAgent.substring(userAgent.indexOf('MSIE') + 5, userAgent.indexOf('.', userAgent.indexOf('MSIE'))), 10);
                        if (IEVersion <= 10) {
                            updateLink = '<b> يرجى تحديث اصدار المتصفح من على هذا </b> ' + '<a href="https://support.microsoft.com/ar-sa/help/17621/internet-explorer-downloads" target="_blank">الرابط</a> ' + '<b> للعمل بشكل افضل </b> ';
                        }
                        break;
                    case 'firefox':
                        var firefoxVersion = parseInt(/[^/]*$/.exec(userAgent)[0], 10);
                        if (firefoxVersion < 70) {
                            updateLink = '<b> يرجى تحديث اصدار المتصفح من على هذا </b> ' + '<a href="https://support.mozilla.org/en-US/products/firefox/install-and-update-firefox" target="_blank">الرابط</a> ' + '<b> للعمل بشكل افضل </b> ';
                        }
                        break;
                    default:
                }
                if (updateLink !== '') {
                    swal({
                        title: 'تنبيه', type: "warning",
                        text: updateLink,
                        showCloseButton: false,
                        showConfirmButton: false,
                        confirmButtonText: ' موافق!',
                        html: true
                    });
                    return true;
                }
            }
            return false;
        };
         
        this.tour = window.tour = {
            config: {
                //mask: {
                //    visible: true, // Shows the element mask
                //    clickThrough: false, // Allows the user to interact with elements beneath the mask
                //    clickExit: false, // Exit the tour when the user clicks on the mask
                //    scrollThrough: false, // Allows the user to scroll while hovered over the mask
                //    color: 'rgba(0,0,0,.7)' // The mask color
                //},
                //   container: 'body', // The container to mask
                // scrollBox: 'body', // The container to scroll when searching for elements
                previousText: 'السابق',
                nextText: 'التالى',
                finishText: 'إنهاء',
                animationDuration: 400,
            },
            steps: []
        };

        this.CheckInternet = function () {
            $window.addEventListener("offline", function () {
                $rootScope.$apply(function () {
                    swal({
                        title: 'تنبيه',
                        text: "خطأ فى الإتصال بالإنترنت!",
                        showConfirmButton: false,
                        html: true,
                        //imageUrl: $window.location.origin + "/Content/Theme/dist/img/NoInternet.jpg"
                    });
                    $rootScope.online = false;
                });
            }, false);

            $window.addEventListener("online", function () {
                $rootScope.$apply(function () {
                    $rootScope.online = true;
                });
            }, false);
        };

        this.Idle = function () {
            if (($location.absUrl().indexOf('Login') !== -1 && $location.absUrl().indexOf('DocumentVerify') !== -1)
                || $location.absUrl().indexOf('Register') !== -1
                || $location.absUrl().indexOf('CommericalManual') !== -1
                || $location.path() === '/') {
                Idle.unwatch();
                return false;
            }
            $rootScope.started = true;
            Idle.watch();
            $rootScope.$on('IdleStart', function () {
                if ($location.absUrl().indexOf('Login') === -1 && $location.absUrl().indexOf('DocumentVerify') === -1 && $location.absUrl().indexOf('Register') === -1 && $location.absUrl().indexOf('CommericalManual') === -1) {
                    closeModals();
                    swal({
                        title: 'ستنتهي صلاحية جلستك.', type: "warning",
                        showCloseButton: true,
                        confirmButtonText: ' موافق!'
                    });
                }
            });

            $rootScope.$on('IdleEnd', function () {
                closeModals();
            });

            $rootScope.$on('IdleTimeout', function () {
                if ($location.absUrl().indexOf('Login') === -1 && $location.absUrl().indexOf('DocumentVerify') === -1 && $location.absUrl().indexOf('Register') === -1 && $location.absUrl().indexOf('CommericalManual') === -1) {
                    closeModals();
                    swal({
                        title: 'تم انتهاء صلاحية جلستك.', type: "warning",
                        showCloseButton: true,
                        confirmButtonText: ' إعادة تسجيل الدخول'
                    }, function () {
                        window.location.reload();
                    });
                }
                if ($location.path() !== '/Login') {
                    window.location.href = '/#/Login';
                    $route.reload();
                    $rootScope.title = 'تسجيل دخول';
                }
              
            });

            $rootScope.start = function () {
                closeModals();
                Idle.watch();
                $rootScope.started = true;
            };

            $rootScope.stop = function () {
                closeModals();
                Idle.unwatch();
                $rootScope.started = false;
            };

        };

        function closeModals() {
            if ($rootScope.warning) {
                $rootScope.warning.close();
                $rootScope.warning = null;
            }

            if ($rootScope.timedout) {
                $rootScope.timedout.close();
                $rootScope.timedout = null;
            }
        }

        this.HttpGetWalletBalance = function () {
            return httpRequestSvc.CheckDetailsAuthorize({ url: '/api/Authorized/GetWalletBalance' });
        };

        this.GetWalletBalance = function () {
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined) {
                var deferred = $q.defer();
                // $rootScope.chamberInfo = JSON.parse($window.localStorage.chamberContactInfo || '{}');

                $rootScope.showBalanceSpinner = true;
                this.HttpGetWalletBalance().then(function (response) {
                    if (response !== null) {
                        if (response.valid) {

                            if ($rootScope.userInfo.globalSessionValues.CurrentMember) {
                                $rootScope.userInfo.globalSessionValues.CurrentMember.Balance = response.balance;
                                session.updateLocalStorage('CurrentMember', $rootScope.userInfo.globalSessionValues.CurrentMember, false);
                            }

                            session.updateLocalStorage('Balance', response.balance, false);
                            session.updateLocalStorage('ReservedBalance', response.requestsSum, false);

                            $rootScope.showBalanceSpinner = false;
                            deferred.resolve(response.valid);
                            return true;
                        }
                        else {
                            deferred.resolve(false);
                            authService.logOut();
                        }
                    } else {
                        deferred.resolve(false);
                        return false;
                    }
                });





                /////////////////////////////////////////////////////////////////  
                // $rootScope.isPrimalyResponsible = $rootScope.userInfo.globalSessionValues.IsPrimalyResponsible;
                // $rootScope.ShowUsersManagment = $rootScope.userInfo.globalSessionValues.ChamberData.ShowUsersManagment;
                // $rootScope.IsPasswordTemp = $rootScope.userInfo.globalSessionValues.IsPasswordTemp;
                //  $rootScope.CurrentChamberName = $rootScope.userInfo.globalSessionValues.ChamberData.CurrentChamberName;
                //  $rootScope.Balance = $rootScope.userInfo.globalSessionValues.CurrentMember.Balance; 
                // $rootScope.LastLoginDate = $rootScope.userInfo.globalSessionValues.UserData.LastLoginDate;
                $rootScope.IsExpiredDate = $rootScope.userInfo.globalSessionValues.IsExpiredDate;

                $rootScope.ShowLayout = true;
                $rootScope.UserName = $rootScope.userInfo.userName;
                document.title = $route.current.title;

                auditService.InsertAuditPage($route.current.title, $location.path());
                return deferred.promise;
            }
        };

        this.PagesRedirect = function () {
            if ($location.absUrl().indexOf('Register') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "تسجيل جديد";
                $location.path('/Register');
            }
            else if ($window.location.href.indexOf("ForgetPassword") > -1) {
                $rootScope.ShowLayout = false;
            }
            else if ($window.location.href.indexOf("ResetPhoneNumber") > -1) {
                $rootScope.ShowLayout = false;
            }
            else if ($location.absUrl().indexOf('DocumentVerify') !== -1 && $routeParams.Id !== "" && $routeParams.Id !== undefined && $routeParams.Id !== ''
                && $routeParams.mem !== "" && $routeParams.mem !== undefined && $routeParams.mem !== '') {
                $rootScope.ShowLayout = false;
                document.title = "التحقق من الوثائق";
                $location.path('/DocumentVerify/' + $routeParams.Id + '/' + 'mem' + '/' + $routeParams.mem);
            }
            else if ($location.absUrl().indexOf('DocumentVerify') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "التحقق من الوثائق";
                $location.path('/DocumentVerify');
            }
            else if (window.location.pathname === '/Verify') {
                $rootScope.ShowLayout = false;
                document.title = "التحقق من الوثائق"; 
                $location.path('/DocumentVerify');
            }
            else if ($location.absUrl().indexOf('FormVerify') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "FormVerify";
                $location.path('/FormVerify');
            }
            else if ($location.absUrl().indexOf('/Subscription') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "التسجيل فى الجمعية العمومية";
                $location.path('/Meetings/Subscription');
            }
            else if ($location.absUrl().indexOf('/Meetings/Vote') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "التسجيل فى الجمعية العمومية";
                if ($routeParams.uid !== null && $routeParams.uid !== "" && $routeParams.uid !== undefined) {
                    $location.path('/Meetings/Vote/' + $routeParams.id + '/' + $routeParams.uid );
                }
                else {
                    $location.path('/Meetings/Vote/' + $routeParams.id);
                }
            }
            else if ($location.absUrl().indexOf('/Meetings/Attendance') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "تسجيل الحضور فى الجمعية العمومية";
                //if ($routeParams.uid !== null && $routeParams.uid !== "" && $routeParams.uid !== undefined) {
                //    $location.path('/Meetings/Attendance/' + $routeParams.id + '/' + $routeParams.uid);
                //}
                //else {
                   // $location.path('/Meetings/Attendance/' + $routeParams.id);
                //}
            }
            else if ($location.absUrl().indexOf('redirectUrl=Meetings+Vote') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "التصويت - الجمعية العمومية";
                var redirectURL = $location.$$path.substring($location.$$path.lastIndexOf('=') + 1).replace("+", "/");
                redirectURL = redirectURL.replace("+", "/"); 
                $location.path(redirectURL);
            }
            else if ($location.path() === '/DocumentVerify/:id') {
                $rootScope.ShowLayout = false;
                document.title = "DocumentVerify";
                $location.path('/DocumentVerify/:id');
            } else if ($location.absUrl().indexOf('CouncilsCandidate') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "تواصل معناالمجالس القطاعية- طلب ترشح";
                $location.path('/CouncilsCandidate');
                return false;
            }
            else if ($location.absUrl().indexOf('CommercialsPartners') !== -1) {
                $rootScope.ShowLayout = false;
                document.title = "الشريك التجاري";
                $location.path('/CommercialsPartners');
                return false;
            }
            else if ($location.path() === '/') {
                window.location.href = '/#/';
            }
            else if ($location.absUrl().indexOf('Login') === -1) {
                window.location.href = '/#/Login';
            }
            else {
                authService.logOut();
                $rootScope.ShowLayout = false;
                document.title = "تسجيل الدخول - بوابة المشتركين الإلكترونية ";
            }
        };

        this.Intro = function () {
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined && $rootScope.userInfo !== '') {
                $rootScope.IntroOptions = {
                    steps: [
                        {
                            element: '#step0',
                            intro: " <img src='../Logos/" + $rootScope.userInfo.globalSessionValues.ChamberData.ChamberId + ".png'  /><hr /><p class='text-center'>مرحبا بك في بوابة</p><p class='text-center'>خدمات المشتركين الإلكترونية</p> "
                        },
                        {
                            element: '#step1',
                            intro: "الرئيسية",
                            position: 'bottom'
                        },
                        {
                            element: '#step2',
                            intro: "من خلال هذه الشاشة يمكن الإطلاع على بيانات صاحب المنشأة, كما يمكن التعديل على بعض البيانات , وتتيح أيضاًهذه الشاشة الإطلاع على بيانات الملاك و بيانات الموظفين للمنشأة.و عرض و طباعة شهادة الإشتراك للمنشأة" + "كما يمكن أيضاً الإطلاع على جميع السندات للعضوية ويمكن عرض الوثائق التي تم تصديقها و يمكن الإطلاع على بيانات العرض الترويجي وبياناته كاملة كما تم إصدارها من الغرفة. ",
                            position: 'bottom'
                        },
                        {
                            element: '#step3',
                            intro: 'من خلال هذه الشاشة يمكنك تقديم تصديق إلكترونى وأيضاً الإطلاع على جميع التصاديق التى تم تقديمها مسبقاً.',
                            position: 'bottom'
                        },
                        {
                            element: '#step4',
                            intro: "من خلال هذه الشاشة يمكنك الإطلاع على جميع حسابات المستخدمين المنشأة.",
                            position: 'bottom'
                        },
                        {
                            element: '#step5',
                            intro: 'من خلال هذه الشاشة يمكنك إدارة المحفظة من شحنها والإطلاع على كشف الحساب لها..',
                            position: 'bottom'
                        },
                        {
                            element: '#step6',
                            intro: 'رصيد المحفظة الحالى للعضوية.',
                            position: 'bottom'
                        }
                    ],
                    showStepNumbers: false,
                    showBullets: false,
                    exitOnOverlayClick: true,
                    keyboardNavigation: true,
                    scrollToElement: true,
                    exitOnEsc: true,
                    nextLabel: '<strong>التالى</strong>',
                    prevLabel: '<span>السابق</span>',
                    skipLabel: 'تخطى',
                    doneLabel: 'إنهاء',
                    tooltipPosition: 'auto'
                };
            }
        };

        this.approvedMergedMembers = function () {
            $rootScope.approvedMergedMembers = [];
            UsersSvc.ApprovedMergedMembers({}).then(function (response) {
                if (response.success) {
                    $rootScope.approvedMergedMembers = response.data;
                    console.log($rootScope.approvedMergedMembers);
                }
            });
        };

        this.GetNotifications = function () {
            $rootScope.WebNotifications = [];
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined) {
                if ($rootScope.userInfo.globalSessionValues.CurrentMember !== null && $rootScope.userInfo.globalSessionValues.CurrentMember !== undefined) {
                    UsersSvc.GetNotifications({}).then(function (response) {
                        if (response.success) {
                            $rootScope.WebNotifications = response.data;
                        }
                    });
                }
            }
        };

        this.ChangeNotificationStatus = function (notify) {
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined) {
                if ($rootScope.userInfo.globalSessionValues.CurrentMember !== null && $rootScope.userInfo.globalSessionValues.CurrentMember !== undefined) {
                    UsersSvc.ChangeNotificationStatus({ Id: notify.id }).then(function (response) {
                        if (response.success) {
                            window.location.href = '/#' + notify.detailsURL;
                        }
                    });
                }
            }
        };


        this.replaceMember = function (memberId) {
            blockUI.start();
            toaster.pop('wait', 'جاري التبديل ...', null, 15000);
            UsersSvc.ReplaceMember({ NewMemberId: memberId }).then(function (response) {
                toaster.clear();
                if (response.success) {
                    toaster.pop('success', "تبديل العضويات", "تم التبديل بنجاح", null, 5000);
                    session.updateLocalStorage('CurrentMember', globalService.capitalizeObject(response.data), false);
                    $rootScope.userInfo.globalSessionValues.CurrentMember = globalService.capitalizeObject(response.data);
                    $route.reload();
                    blockUI.stop();
                } else {
                    toaster.pop('error', response.message);
                }
                blockUI.stop();
            });
        };

        this.DateDiffMonth = function (fromDate, rentPeriod) {
            var data = {
                url: '/api/Account/DateDiffMonth?fromDate=' + fromDate + '&rentPeriod=' + rentPeriod
            };
            var deferred = $q.defer();
            httpRequestSvc.CheckDetailsAuthorize(data)
                .then(function (response) {
                    deferred.resolve(response);
                });
            return deferred.promise;
        };

        this.ResendConfirmEmail = function () {
            var data = {
                url: '/api/Account/ResendConfirmEmail'
            };
            var deferred = $q.defer();
            httpRequestSvc.CheckDetailsAuthorize(data)
                .then(function (response) {
                    deferred.resolve(response);
                });
            return deferred.promise;
        };

        this.checkExpiredMemberMaster = function () {
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined) {
                if ($rootScope.userInfo.globalSessionValues.SettingExpiredDate === true && $rootScope.userInfo.globalSessionValues.ExpiredNotified !== true) {
                    swal({
                        title: 'تنبيه', type: "warning",
                        text: appConst.memberMasterExpired,
                        showCloseButton: true,
                        confirmButtonText: ' موافق'
                    },
                        function () {
                            session.updateLocalStorage('ExpiredNotified', true, false);
                        });
                } else {
                    session.updateLocalStorage('ExpiredNotified', true, false);
                }
            }
        };

        this.checkMemberEmailConfirmed = function () {
            if ($rootScope.userInfo !== null && $rootScope.userInfo !== undefined) {
                if ($rootScope.userInfo.globalSessionValues.EmailConfirmed === false && $rootScope.userInfo.globalSessionValues.EmailConfirmedMsgShowed !== true
                    && $rootScope.userInfo.globalSessionValues.WaitingConfirmPhone !== true) {
                    session.updateLocalStorage('EmailConfirmedMsgShowed', true, false);
                    $timeout(function () {
                        swal({
                            type: "warning",
                            title: 'تاكيد البريد الالكتروني',
                            text: 'مرحبا, ' + $rootScope.userInfo.userName + ' ' +
                                ' يرجى فحص بريدك الإلكترونى لتوثيق البريد الالكتروني  ',
                            showCloseButton: true,
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            cancelButtonText: 'تم',
                            confirmButtonText: 'أو اعادة ارسال البريد!'
                        }, function (isConfirm) {
                            if (isConfirm) {
                                $rootScope.ResendConfirmEmail();
                            }
                        });
                    }, 1000);
                }
            } else {
                session.updateLocalStorage('EmailConfirmedMsgShowed', true, false);
            }
        };


        this.showMemberExpireAlert = function () {
            swal({
                title: 'يجب تجديد إشتراك عضويتك لدى وزارة التجارة؟',
                type: "warning",
                showCloseButton: true, 
                showCancelButton: true,  
                allowOutsideClick: true,
                allowEscapeKey: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#d84848",
                cancelButtonText: 'التجديد',
                confirmButtonText: 'تم التجديد', 
                focusConfirm: false

            },
                function (isConfirm) {
                    if (isConfirm) {
                        //Update Member Data 
                        blockUI.start();
                        toaster.pop('wait', 'جاري التحديث ...', null, 15000);
                        UsersSvc.ReplaceMember({ NewMemberId: $rootScope.userInfo.globalSessionValues.CurrentMember.MemberId, RelatedType: $rootScope.userInfo.globalSessionValues.CurrentMember.RelatedType }).then(function (response) {
                            toaster.clear();
                            if (response.success) {
                                //Update Current Member Data in Local Storage
                                session.updateLocalStorage('CurrentMember', globalService.capitalizeObject(response.data), false);
                                $rootScope.userInfo.globalSessionValues.CurrentMember = globalService.capitalizeObject(response.data);
                                toaster.pop('success', "تم التحديث بنجاح  ", null, 2000);
                                blockUI.stop();
                                $route.reload();
                            } else {
                                toaster.pop('error', response.message);
                            }
                            blockUI.stop();
                        });
                    }
                    else {
                        //Redirect to Commerce Authority Link

                        window.open("https://cocclient.mc.gov.sa/", "_blank");
                    }
                }
            );
        }

        this.CheckSystemIsHijri = function () {
            $rootScope.isHijri = false;
            if ($rootScope.chamberSettings !== null) {
                $rootScope.isHijri = $rootScope.chamberSettings.IsSystemHijri;
            }
            if ($rootScope.isHijri === false) {
                $rootScope.IsHijriTitle = 'م';
                $rootScope.IsHijriClass = 'datepick';
            }
            else {
                $rootScope.IsHijriTitle = 'هـ';
                $rootScope.IsHijriClass = 'datepickgreg';
            }
            CalendarIsHijri = {
                IsHijri: $rootScope.isHijri, IsHijriTitle: $rootScope.IsHijriTitle, IsHijriClass: $rootScope.IsHijriClass
            };
            return CalendarIsHijri;
        };

        this.stopInterval = function () {
            $interval.cancel(promise);
            session.addDataToLocalStorage("stopInterval", true);
        };

        this.stopComPartnerBanner = function () { 
            $rootScope.userInfo.globalSessionValues.CurrentMember.BannerIsSeen = true;  
            localStorage['userInfo_' + $location.$$host] = JSON.stringify($rootScope.userInfo);
            CommercialPartnerSvc.UpdateCommercialSeen();
        };

        var promise;
        var modalInstance;
        this.CheckMeetingInerval = function () {
            if (session.getPropertyLocalStorage("SettingExpired", false) !== false) {
                return false;
            }
            $rootScope.showMeetingPopUp = false;
            $rootScope.showMeetingTerms = false;
            $rootScope.showMeetingConfirm = false;
            if (localStorage.getItem('stopInterval') === "true") {
                return false;
            }


            var guid = $rootScope.chamberSettings.upComingMeetingTermsUrl;
            $http.post('api/Account/GetConfig').then(function (response) {
                $rootScope.chamberSettings = response.data.data;
                if ($rootScope.chamberSettings.useMeetings) {
                    guid = $rootScope.chamberSettings.upComingMeetingTermsUrl;
                    if (guid !== undefined && guid !== null) {
                        guid = guid.substring(guid.lastIndexOf('/') + 1);
                        $http.post('api/Meetings/GetMeetingById', { MeetingGUID: guid, PageSize: 100, PageIndex: 1 }).then(function (res) {
                            if (res.data.data.meeting.meeting.meetingStatusId === 3) {
                                $rootScope.showMeetingPopUp = false;
                                $rootScope.showMeetingTerms = false;
                                $rootScope.showMeetingConfirm = false;
                                return false;
                            }
                            if (res.data.data.meeting !== null) {
                                $rootScope.chamberSettings.MeetingGUID = res.data.data.meeting.meeting.meetingGUID;
                            }
                            var i = 1;
                            var extra = 0;
                            var holdFor = 5;
                            var showEvery = 10
                            if (res.data.data.meetingMembers.length > 0) {
                                return false;
                            }

                            var checkViewModal = function () {
                                if (sessionStorage.getItem("meetingConfirmModal") !== "true") {
                                    if ($filter('date')(new Date(), 'yyyy-MM-dd HH:mm') >= $filter('date')(res.data.data.meeting.meeting.attendanceDate, 'yyyy-MM-dd HH:mm')) {
                                        //عرض تاكيد
                                        var redirectURL = res.data.data.meeting.meeting.publishLink !== null && res.data.data.meeting.meeting.publishLink !== undefined
                                            ? res.data.data.meeting.meeting.publishLink.substring(res.data.data.meeting.meeting.publishLink.lastIndexOf('=') + 1).replace("+", "/") : "Home";
                                        redirectURL = redirectURL.replace("+", "/");
                                        $rootScope.MeetingConfirmUrl = '/#/' + redirectURL;

                                        $rootScope.showMeetingPopUp = true;
                                        $rootScope.showMeetingTerms = false;
                                        $rootScope.showMeetingConfirm = true;
                                        if (modalInstance) {
                                            modalInstance.close();
                                        }
                                        modalInstance = $uibModal.open({
                                            animation: true,
                                            templateUrl: 'meetingModal.html',
                                            controller: 'ModalInstanceCtrl'
                                        });
                                        sessionStorage.setItem('meetingConfirmModal', true);
                                    }
                                }

                                if (sessionStorage.getItem("meetingTermsModal") !== "true") {
                                    if ($filter('date')(new Date(), 'yyyy-MM-dd HH:mm') >= $filter('date')(res.data.data.meeting.meeting.startDate, 'yyyy-MM-dd HH:mm')
                                        && $filter('date')(new Date(), 'yyyy-MM-dd HH:mm') < $filter('date')(res.data.data.meeting.meeting.attendanceDate, 'yyyy-MM-dd HH:mm')) {

                                        if (modalInstance) {
                                            modalInstance.close();
                                        }
                                        modalInstance = $uibModal.open({
                                            animation: true,
                                            templateUrl: 'meetingModal.html',
                                            controller: 'ModalInstanceCtrl'
                                        });
                                        sessionStorage.setItem('meetingTermsModal', true);
                                        //البنود
                                        $rootScope.showMeetingPopUp = true;
                                        $rootScope.showMeetingTerms = true;
                                        $rootScope.showMeetingConfirm = false;
                                    }
                                }
                            }

                            $rootScope.intervals.push($interval(checkViewModal, 5000));
                        }).catch(function (res) {
                        });
                    }
                }
            });
        };

        // Send OTP Abshir
        this.SendOTP = function (model) {
            var deferred = $q.defer();
            $http.post('api/Account/SendOTP', model).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

        this.ValidateIdentityOTP = function (model) {
            var deferred = $q.defer();
            $http.post('api/Account/ValidateIdentityOTP', model).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

        this.CheckIdentityRegistered = function (id, memberId) {
            var deferred = $q.defer();
            $http.get('api/Account/CheckIdentityRegistered/' + id + '/' + memberId).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

    }

    // Inject dependencies
    SharedService.$inject = ['$rootScope', '$window', '$filter', 'toaster', '$http', '$uibModal', 'session', 'Idle', '$interval', 'globalService', '$location',
        'blockUI', 'authService', 'httpRequestSvc', 'auditService', '$route', '$q', 'UsersSvc', 'appConst', 'ngNotify', '$routeParams', '$timeout', 'CommercialPartnerSvc', 'registerService'];

    // Export
    app.service('sharedService', SharedService);
})(angular);


;
app.service("registerService", ['$http', '$q', 'httpRequestSvc', 'globalService', function ($http, $q, httpRequestSvc, globalService) {
    
    this.Register = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/Register', chamberDomain), model);
    };

    this.SendRegisterCode = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/SendRegisterCode', chamberDomain), model);
    };


    this.SendValidateIdentity = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/SendValidateIdentity', chamberDomain), model);
    };

    this.SendValidateIdentityViaNafath = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/NafathRegister', chamberDomain), model);
    };

    this.ValidateIdentityRegisterByChamber = function (model, chamberDomain) { 
        return $http.post(globalService.concatApiPath('api/Account/ValidateIdentityRegisterByChamber', chamberDomain), model);
    };


    this.ValidateIdentityOTP = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/ValidateIdentityOTP', chamberDomain), model);
    };

    this.ValidateSMSCode = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Account/ValidateSMSCode', chamberDomain), model);
    };

    this.SendOTP = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/SendOTP', chamberDomain) , model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    this.ResetPhoneNumber = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/ResetPhoneNumber', chamberDomain) , model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    this.SendRestPhoneNumberOTP = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/SendRestPhoneNumberOTP', chamberDomain) , model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    this.SendForgetPassword = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/SendForgetPassword', chamberDomain), model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    this.RegisterValidateKey = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/RegisterValidateKey', chamberDomain), model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    this.ResetPassword = function (model, chamberDomain) {
        var deferred = $q.defer();
        $http.post(globalService.concatApiPath('api/Account/ResetPassword', chamberDomain), model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    
    this.CheckMemberRegister = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Users/CheckMemberRegister', chamberDomain) , model);
    };
    this.GetMemberId = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Users/GetMemberId', chamberDomain) , model);
    };

    this.GetMembersMastersToMerge = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Authorized/GetMembersMastersToMerge', chamberDomain) , model);
    };

    this.SendConfirmMergeSMS = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Authorized/SendConfirmMergeSMS', chamberDomain) , model);
    };

    

    this.GetMemberOwnerResponsible = function (model, chamberDomain) {
        return $http.post(globalService.concatApiPath('api/Users/GetMemberOwnerResponsible', chamberDomain) , model);
    };

    this.CheckUserName = function (model) {
        return $http.post('api/Users/CheckUserName', model);
    };

    this.CheckEmail = function (model) {
        return $http.post('api/Users/CheckEmail', model);
    };
    this.CheckIdentity = function (model) {
        return $http.post('api/Users/CheckIdentity', model);
    };
    this.VerfirySMSMergeCode = function (vm, chamberDomain) {
        var data = {
            url: globalService.concatApiPath('api/Account/ResetPassword', chamberDomain) ,
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    this.CheckIdentityWithAuth = function (vm) {
        var data = {
            url: 'api/Users/CheckIdentity',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    this.CheckEmailWithAuth = function (vm) {
        var data = {
            url: 'api/Users/CheckEmail',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    this.CheckPhoneNumber = function (vm) {
        var data = {
            url: 'api/Users/CheckPhoneNumber',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    this.GetCommericalManual = function (model) {
        var deferred = $q.defer();
        $http.post('api/Account/GetCommericalManual', model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

}]);;
app.service("handleHttpRequestService", ['session', '$http', '$q', function (session, $http, $q) {

    this.CheckAddAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };
        if (checkLogin) {
            var req = {
                method: 'POST',
                url: data.url,
                data: data.details,
                headers: {
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId,
                    MembershipClassId: session.getUserInfo().globalSessionValues.MembershipClassId
                }
            };
            $http(req).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);
        }
        return deferred.promise;
    };

    this.CheckDetailsAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };

        if (checkLogin) {
            var req = {
                method: 'GET',
                url: data.url,
                headers: {
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId,
                    MembershipClassId: session.getUserInfo().globalSessionValues.MembershipClassId
                }
            };
            $http(req).then(function (response) {

                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);

        }
        return deferred.promise;

    };

    this.CheckAddAuthorizeWithFiles = function (data, files) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };
        if (checkLogin) {
            var fd = new FormData();
            for (var i = 0; i < files.length; i++) {
                fd.append("file" + i, files[i]);
            }
            var info = data.details;
            fd.append('data', angular.toJson(info));
            var req = {
                method: 'POST',
                url: data.url,
                headers: {
                    'Content-Type': undefined,
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId,
                    MembershipClassId: session.getUserInfo().globalSessionValues.MembershipClassId,
                    RequestType: info.RequestType
                },
                transformRequest: angular.identity,
                data: fd
            };
            $http(req).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {

                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);

        }
        return deferred.promise;
    };

    this.CheckDeleteAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };

        if (checkLogin) {
            var req = {
                method: 'POST',
                url: data.url,
                data: data.details,
                headers: {
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId,
                    MembershipClassId: session.getUserInfo().globalSessionValues.MembershipClassId
                }
            };
            $http(req).then(function (response) {

                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);
        }
        return deferred.promise;

    };

    this.CheckEditAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };

        if (checkLogin) {
            var req = {
                method: 'POST',
                url: data.url,
                data: data.details,
                headers: {
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId,
                    MembershipClassId: session.getUserInfo().globalSessionValues.MembershipClassId
                }
            };
            $http(req).then(function (response) {

                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);

        }
        return deferred.promise;

    };

    this.CheckEditWithFileAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };

        if (checkLogin) {
            var formData = new FormData();
            formData.append("file", data.file);
            formData.append("EmpNum", data.details.EmpNum);
            formData.append("BloodType", data.details.BloodType);
            formData.append("ChildrensNumber", data.details.ChildrensNumber);
            formData.append("DriverLicenseNum", data.details.DriverLicenseNum);
            formData.append("DriverLicenseIssueDate ", data.details.DriverLicenseIssueDate);
            formData.append("DriverLicenseExpiryDate ", data.details.DriverLicenseExpiryDate);
            formData.append("EmpHealthInusranceNum  ", data.details.EmpHealthInusranceNum);
            formData.append("PassportNum  ", data.details.PassportNum);
            formData.append("Passport_IssuePlace  ", data.details.Passport_IssuePlace);
            formData.append("PassportIssueDate  ", data.details.PassportIssueDate);
            formData.append("PassportExpiryDate  ", data.details.PassportExpiryDate);
            var req = {
                method: 'POST',
                url: data.url,
                data: formData,
                transformRequest: angular.identity,
                headers: {
                    Authorization: 'Bearer ' + session.getAccessToken(),
                    'Content-Type': undefined,
                    ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                    MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId
                }
            };
            $http(req).then(function (response) {

                deferred.resolve(response.data);
            });
        }
        else {
            deferred.resolve(NullData);

        }
        return deferred.promise;
    };

    this.CheckEditWithFileNoDataAuthorize = function (data) {
        var deferred = $q.defer();
        var checkLogin = CheckLogin();
        var NullData = {
        };

        if (checkLogin) {
            for (var i = 0; i < data.files.length; i++) {
                var formData = new FormData();
                formData.append("file", data.files[i]);
                formData.append("Id", data.details.RequestId);
                formData.append("AttachmentDesc", data.details.AttachmentDesc);

                var req = {
                    method: 'POST',
                    url: data.url,
                    data: formData,
                    transformRequest: angular.identity,
                    headers: {
                        Authorization: 'Bearer ' + session.getAccessToken(),
                        'Content-Type': undefined,
                        ChamberId: session.getUserInfo().globalSessionValues.GlobalChamberId,
                        MemberId: session.getUserInfo().globalSessionValues.GlobalMemberId
                    }
                };
                $http(req);
                console.log(i);
            }
        }
        else {
            deferred.resolve(NullData);
        }
        return deferred.promise;
    };

}]);





;
app.service('appConst', [function () {
    this.passwordPattern = '/(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,30})$/';
    this.passwordPatternMsg = "فضلاً ,يجب ألا تقل كلمة المرور عن 8 خانات تحتوى على حروف وأرقام فقط !  ";
    this.identityPattern = '^(1|2)([0-9]{9})$';
    this.userNamePattern = '^[a-zA-Z0-9]*$';
    this.captchaKey = '6LfZPY8UAAAAAPId2zEnccJ4PSbTVXTEey9VxGRo';
    //this.froalaActivationKey = 'Ig1A7vA5A2B2C1B1H5mEZXQUVJe1EZb1IWIAUKLJZMBQuF2C1G1I1A10C1B6A1F6C4==';
    this.froalaActivationKey = '4NC5fB4D4H4B3C2C4B3D-13TMIBDIa2NTMNZFFPFZe2a1Id1f1I1fA8D6C4B4G3H3D2A18A16B3==';
    this.notRobotCaptcha = "check I 'm not a robot please";
    this.savingInprogress = 'جارى التسجيل ...';
    this.memberIdRequired = "يرجى إدخال رقم المنشأة !";
    this.memberIdLength = "يرجى إدخال رقم المنشأة بشكل صحيح";
    this.memberHasAccountBefore = "رقم العضوية مسجل له حساب مسبقا ";
    this.completeFormRegisterData = "يرجى إستكمال البيانات لإتمام عملية التسجيل بشكل صحيح !";
    this.completeFormData = "يرجى إستكمال البيانات المطلوبة بشكل صحيح !";
    this.noAgreement = '<div class="register-note"> <i class="fa fa-info-circle" aria-hidden="true"></i>لا تـــــــــوجد إتفاقيـــــة</div>';
    this.identityRequired = 'رقم الهوية مطلوب';
    this.identityNotValid = 'أدخل رقم هوية بشكل صحيح';
    this.identityLength = "فضلاً , أدخل رقم هوية لايقل عن 10 ارقام !  ";
    this.errorOccurred = "حدث خطأ ما ,  يرجى المحاولة مرة أخرى !";
    this.mergeSuccess = 'تمت العملية بنجاح';
    this.mergeCancelSuccess = 'تم إلغاء الطلب بنجاح';
    this.userNameExist = 'إسم المستخدم مسجل مسبقا';
    this.emailExist = 'البريد الالكترونى مسجل مسبقا';
    this.identityNotMatchChamber = "تنبيه ,  رقم الهوية المدخل غير مطابق للموجود بالغرفة يرجى تحديث بياناتك فى أقرب وقت !";
    this.codeSentSuccess = "تم إرسال الكود بنجاح يرجى فحص الجوال";
    this.registerByChamberSuccess = "تم اضافة المستخدم بنجاح يمكنك تسجيل الدخول بعد طباعة نموذج التفعيل والذهاب للغرفة ";
    this.registerByPhoneSuccess = "تم تسجيل المستخدم للعضوية بنجاح يرجى تسجيل الدخول ";
    this.memberMasterExpired = "إشتراك العضوية منتهى !";
    this.requestNotActive = "عفوا , الطلب غير مفعل حاليا  !";
    this.requestNotActiveForAdmin = "لايوجد صلاحية لتقديم هذا الطلب يرجي  تسجيل الخروج والدخول مره اخري ";
    this.requestNotActiveForNotAdmin = " لايوجد صلاحية لتقديم هذا الطلب يرجي التواصل مع مدير العضوية";
    this.memberStatusExpiredForRequests = "عفواً. لا يمكن تقديم طلبات نظراً لإنتهاء إشتراك العضوية !";
    this.cannotAddRequestAtThisTime = " لا يمكن تقديم الطلبات في الوقت الحالي";
    this.selectRequestType = 'يرجى اختيار نوع الطلب.';
    this.deleteRequestDone = 'تم إلغاء الطلب بنجاح';
    this.pauseRequestDone = 'تم إيقاف الطلب بنجاح';
    this.cancelRequestReasonTitle = 'سبب الرفض مطلوب';
    this.cancelRequestReason = 'فضلا أدخل سبب الإلغاء';
    this.confirmCancelRequest = 'هل أنت متأكد من إلغاء هذا الطلب؟';
    this.startEndDatesCompare = 'عفواً , تاريخ بداية البحث اكبر من تاريخ نهايته';
    this.fileDownloadedSuccess = "تم تحميل الطلب بنجاح";
    this.activationFileDownloadedSuccess = "تم تحميل نموذج التفعيل بنجاح";
    this.fileTypeNotSupported = 'عفواً..صيغة الملف المرفوع غير مدعومة !';
    this.uploadFileMaxSize = 'لا يمكن اضافة مرفق اكبر من 2 ميجا';

    this.uploadOneFilesOnly = 'لايمكن اضافة اكتر من مرفق';
    this.fileAPINotSupported = 'Your browser doesnot support to File API';
    this.addAttachment = 'فضلاً . اضف المرفق .';
    this.insertEmailSendRequest = 'فضلاً , أدخل البريد المراد إرسال النموذج إليه';
    this.insertValidEmail = "يرجى إدخال البريد الإلكترونى بشكل صحيح";
    this.mailSendSuccess = "تم إرسال الوثيقة بنجاح";
    this.dataSavedSuccess = "تم حفظ البيانات بنجاح ";
    this.updateInProgress = "جارى  التعديل  ...";
    this.insertValidEntries = "فضلا , أدخل قيم صحيحة";
    this.phoneNumberRequired = "يرجى ادخال رقم الجوال.";
    this.enterValidPhoneNumber = " يرجى ادخال رقم الجوال بشكل صحيح .";
    this.enterPhoneNumberMatch = " يجب أن يكون رقم الجوال مماثل 05xxxxxxxx .";
    this.SelectChamber = 'عفواً , يرجى إختيار الغرفة لإستكمال البحث  ! ';
    this.completeSearchInputs = "يرجى إدخال البيانات اللازمة لإستكمال عملية البحث بشكل صحيح !";
    this.completeMergeMembers = "يرجى إستكمال ربط العضوية";
    this.confirmGoBack = 'تأكيد الرجوع للخطوة السابقة؟';
    this.unCompletedDataContinueSave = 'لديك بيانات مُدخلة لم يتم حفظها. هل تريد الإستمرار ؟';
    this.alertRegisterMegreMembersWithExistUser = '<hr/><b> عزيزي المشترك رقم الهوية المُسجل سبق وأن تم إستخدامه فى حساب أخر ,  فى حالة كان لديكم الرغية فى ربط العضوية مع حسابكم السابق يرجى الضغط على ربط العضوية </b><hr/><b>أو الضغط على إغلاق لإكمال عملية التسجيل فى حساب جديد.</b>';
    this.confirmCancelRegisterMegre = 'هل تريد إلغاء إستكمال خطوات ربط العضوية و إستمرار التسجيل بإدخال البيانات ';

    this.userLoginInfoError = "خطأ باسم المستخدم أو كلمة المرور برجاء المحاولة مرة أخرى";
    this.connectionError = "حدث خطا فى الاتصال حاول مرة اخرى";
    this.memberMasterNotActive = "عفوا هذه العضوية غير مفعلة من الغرفة";
    this.accountNotActivatedGoChamber = "الحساب غير مفعل يرجى التوجه للغرفة لتفعيل الحساب.";
    this.updateInfoAddPhoneNumber = "يرجى تعديل البيانات الخاصة بك بإضافة رقم الجوال !";
    this.userAccountIsExpired = "عفوا تاريخ صلاحية المستخدم منتهى";
    this.addingUserInProgress = 'جارى  إضافة المستخدم  ...';
    this.userPriceFromWalletAlert = 'سيتم خصم قيمة إضافة مستخدم جديد من المحفظة ,  هل تريد الإستمرار ؟';
    this.noPrivileges = "لا توجد صلاحيات متاحة.";
    this.deleteUserConfirm = 'هل أنت متأكد من حذف هذا المستخدم';
    this.removeUserDelegateConfirm = 'هل أنت متأكد من إلغاء تفويض هذا المستخدم';
    this.deleteDoneSuccess = "تم مسح البيانات بنجاح ";
    this.DelegateRemovedSuccess = "تم إلغاء التفويض بنجاح ";
    this.phoneNumberConfirmedSuccess = "تم تأكيد رقم الجوال بنجاح ";
    this.phonesAreIdentical = 'رقم الجوال المُدخل مُطابق لرقم الجوال الحالى للحساب';
    this.areYouSureAccept = 'هل أنت متأكد من الموافقة ؟';
    this.areYouSureReject = 'هل أنت متأكد من الرفض ؟ ';
    this.acceptInProgress = 'جارى الموافقة على الطلب ...';
    this.rejectInProgress = 'جارى رفض الطلب ...';
    this.RatificationDisabled = 'لا يمكن تقديم طلبات نظراً لايقاف التصديق من قبل الغرفة – راجع الغرفة';
    this.pinedRequestsCount = 6;
    this.memberNotExist = "رقم العضوية الذي أدخلته غير صحيح , برجاء المحاولة مرة أخرى برقم صحيح";
    this.FailedPayment = "فشلت عملية الدفع برجاء محاولة الشحن مرة أخرى أو إستخدام بطاقة أخرى ";
    this.NonMembersFailedPayment = "فشلت عملية الدفع برجاء محاولة الدفع مرة أخرى أو إستخدام بطاقة أخرى ";

    this.addUserConfirm = 'تأكيد إضافة المفوض ؟';
    this.editUserConfirm = 'تأكيد تعديل المفوض ؟';
    this.identityNotRegistered = 'رقم الهوية ليس لديه حساب  , يجب التسجيل أولا على بوابة الخدمات اإلكترونية لإضافته كمفوض. ';

    this.NonMemberRequestPaidStatus = 13;
    this.NonMemberRequestWaitingPaidStatus = 12;

    this.wssPayUrl = 'https://payapi.worldofss.com';
    this.wssPayAuthorization = 'Basic U0NBUFA6MTIz';
    //this.wssPayUrl = 'https://www.worldofss.net:3333';
    //this.wssPayAuthorization = "Basic U0NBUFA6MTIz";

    this.pauseRequestAlert = '<div>سيتم إيقاف صلاحية الطلب . هل أنت متأكد من إيقاف صلاحية الطلب ؟</div><br /> <div style="color:orangered"> علماً بأن مبلغ الطلب لن تُسترد قيمته</div>';
    this.pauseRequestReasonRequired = 'أدخل سبب إيقاف الطلب';
    this.timeElapsed = 240;
    this.trialStamp = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAWgAAADRCAYAAADhVyjcAAAABHNCSVQICAgIfAhkiAAAAAFzUkdCAK7OHOkAAAAEZ0FNQQAAsY8L/GEFAAAACXBIWXMAABYlAAAWJQFJUiTwAABAnElEQVR4Xu2dC3hdVZWAd4stoggFROUZawOkRcpDYAbBwBQ7tFhBCL5IS3lowcEoE5kBLJgLyICDVCVQlBltA4HpAK0gKa8KtrEFgcKgPAxQbAMFsSAgyKM8mjn/umed7Jyc+75pTtr1f9/6crLf5yR33X3WXnvtYT0BLuDtt992CxYscLfccotbuXKle/PNN0k2DMMwBpj3ve99bsyYMe7www93xxxzjNt0000lXRT0mjVr3Le//W335JNPSqJhGIYxOHziE59wra2t7qMf/agbtnbt2p7p06ebcjYMw0gJzKavvvpqN+x//ud/en74wx9K4ogRI9wpp5ziPve5z7kPf/jDkmYYhmEMLK+//rrr6OhwP/7xj90777wjac3NzW6TD3zgA5kXXnhBEk499VTHbDpIk98NwzCMgWfkyJHuk5/8pNt8883d3XffLWmvvPKKG86CoMLM2TAMwxgcpkyZEl4599RTT7nhvreGmTUMwzAGD2bQCp51w8NrwzAMI2WYgjYMw0gppqANwzBSiilowzCMlDJEFfRL7orzLg2vDcMwNkxsBm0YhpFShqiC3tp943vfCq8NwzA2TGwGbRiGkVJMQRuGYaQUU9DGkIbF4o/NCOTnK8KUl9yiW293k2wR2dgAGPapT31KAvbD8uXLwyvDMAxjMNh3333DK5tBG4ZhpBZT0IZhGCnFTBzGRs2tt97q3nvvPbfTTjtJ9DDkrbfecuvWrZN4vA8//LDbZZdd3FZbbeU+9rGPub/+9a9u7dq17uMf/7j8pDw/aeO1115zDz30kJTfcsst3fbbb+9eeukl98Ybb8gxRloeISg7kSQffPBBV1tb67bYYgu34447updfftn97W9/kza0bcpq3QceeEBO2yDq2c477yxlGdNuu+3Wp7zew3333SflifHOmBnjX/7yFzd27Nio3LvvvitjHD58uPvd734nY91ss83c6NGjJZD8s88+K7GKaZ/y3CvpnKNH7GLKc4Ye/XBP3d3dbvz48X3K//3vf3fvf//73dKlS6VdDgfhHsknrObee+8dPRPG/eqr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'
}]);;




app.factory('AllRequestSvc', ['$http', '$q', 'httpRequestSvc',  function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/Request/';
    var AllRequestSvcFactory = {};

    AllRequestSvcFactory.CheckWalletBalanceForRequest = function (vm) {
        var data = {
            url: urlBase + 'CheckWalletBalanceForRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.SendRequestSMSCode = function (id) {
        var data = {
            url: urlBase + 'SendRequestSMSCode/'+ id
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.CheckCommitteeRequest = function (vm) {
        var data = {
            url: urlBase + 'CheckCommitteeRequest',
            details:vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.Add = function (vm) {
        var data = {
            url: urlBase + '/Add',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    
    AllRequestSvcFactory.PreviewServiceAmount = function (vm) {
        var data = {
            url: urlBase + '/PreviewServiceAmount',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    AllRequestSvcFactory.ConfirmRequest = function (vm) {
        var data = {
            url: urlBase + 'ConfirmRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.AcceptOrRejectWithWorkFlow = function (vm) {
        var data = {
            url: urlBase + 'AcceptOrRejectWithWorkFlow',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    AllRequestSvcFactory.GetChamberActivatedRequests = function () {
        var data = {
            url: urlBase + 'GetChamberActivatedRequests' 
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetMemberMasterName = function (vm) {
        var data = {
            url: urlBase + 'GetMemberMasterName',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetMemberCity = function (vm) {
        var data = {
            url: urlBase + 'GetMemberCity',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    AllRequestSvcFactory.CheckActivityExcepted = function (vm) {
        var data = {
            url: urlBase + 'CheckActivityExcepted',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    
    AllRequestSvcFactory.GetRequestsByMemberId = function (vm) {
        var data = {
            url: urlBase + 'GetRequestsByMemberId',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.RequestMovements = function (vm) {
        var data = {
            url: urlBase + 'RequestMovements',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.Details = function (vm) {
        var data = {
            url: urlBase + 'Details',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetPrintByRequestType = function (vm) {
        var data = {
            url: urlBase + 'GetPrintByRequestType',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.PreviewRequestDownload = function (vm) {
        var data = {
            url: urlBase + 'PreviewRequestDownload',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetRequestAttachments = function (vm) {
        var data = {
            url: '/api/Attachment/GetRequestAttachmentByRequestId',
            details:vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.FetchRequest = function (vm) {
        var data = {
            url: '/api/Committees/FetchRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetRequestsByRequestId = function (vm) {
        var data = {
            url: '/api/Request/GetRequestsByRequestId',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.FileDownload = function (vm) {
        var data = {
            url: '/api/Request/FileDownload',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.DownloadInstrument = function (vm) {
        var data = {
            url: '/api/Request/DownloadInstrument',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };




    AllRequestSvcFactory.RequestFileDownload = function (vm) {
        var data = {
            url: '/api/Request/RequestFileDownload',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.SendRequestHtmlToEmail = function (vm) {
        var data = {
            url: '/api/Request/SendRequestHtmlToEmail',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.VerifyRequest = function (data) {
        var deferred = $q.defer();
        $http.post('api/RequesNonAuth/VerifyRequest', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    AllRequestSvcFactory.CheckRequest = function (data) {
        var deferred = $q.defer();
        $http.post('api/RequesNonAuth/CheckRequest', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    AllRequestSvcFactory.DeleteRequest = function (vm) {
        var data = {
            url: urlBase + 'DeleteRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDeleteAuthorize(data)
            .then(function (response) {
                var res = response;
                deferred.resolve(res);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.PauseRequest = function (vm) {
        var data = {
            url: urlBase + 'PauseRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDeleteAuthorize(data)
            .then(function (response) {
                var res = response;
                deferred.resolve(res);
            });
        return deferred.promise;
    };
     
    AllRequestSvcFactory.showPdf = function (vm) {
        var data = {
            url: urlBase + '/CreatePdf',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };


    AllRequestSvcFactory.GetDrops = function (vm) {

        var data = {
            url: '/api/Request/GetDrops',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };

    AllRequestSvcFactory.OppAttachmentDownload = function (vm) {
        var data = {
            url: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.PinRequestType = function (vm) {
        var data = {
            url: urlBase + 'PinRequestType',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    
    AllRequestSvcFactory.RemovePinRequestType = function (vm) {
        var data = {
            url: urlBase + 'RemovePinRequestType',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.InitNewRequestPage = function (vm) {
        var data = {
            url: urlBase + 'InitNewRequestPage',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    return AllRequestSvcFactory;
}]);


;

app.factory('UsersSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc, globalService ) {
    var urlBase = 'api/Authorized';
    var UsersFactory = {};

    UsersFactory.GetIdentityRelatedDelegatedMembersGrid = function (model) {
        var data = {
            url: urlBase + '/GetIdentityRelatedDelegatedMembersGrid',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.UpdateIdentityMembers = function (model) {
        const url = urlBase + '/UpdateIdentityMembers'
        var data = {
            url,
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetDelegatedUsers = function (model) {
        var data = {
            url: urlBase + '/GetDelegatedUsers',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };


    UsersFactory.MemberUserDetail = function (model) {
        var data = {
            url: urlBase + '/MemberUserDetail',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetMemberCard = function (vm) {
        var data = {
            url: urlBase + '/GetMemberCard',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    UsersFactory.GetMemberMergeAccounts = function (model) {
        var data = {
            url: urlBase + '/GetMemberMergeAccounts',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetNewUserServiceAmount = function (model) {
        var data = {
            url: urlBase + '/GetNewUserServiceAmount',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.ReplaceMember = function (model) {
        var data = {
            url: urlBase + '/ReplaceMember',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;

    };
    UsersFactory.ApprovedMergedMembers = function (model) {
        var data = {
            url: urlBase + '/ApprovedMergedMembers',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetNotifications = function (model) {
        var data = {
            url: urlBase + '/GetNotifications',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };


    UsersFactory.ChangeNotificationStatus = function (model) {
        var data = {
            url: urlBase + '/ChangeNotificationStatus',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.SendChangePhoneNumberOTP = function (model) {
        var data = {
            url: urlBase + '/SendChangePhoneNumberOTP',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;

    };

    UsersFactory.SendConfirmPhoneNumberSMS = function (model) {
        var data = {
            url: urlBase + '/SendConfirmPhoneNumberSMS',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.VerifyConfirmPhoneNumber = function (model) {
        var data = {
            url: urlBase + '/VerifyConfirmPhoneNumber',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.CheckSendMergeSMS = function (model) {
        var data = {
            url: urlBase + '/CheckSendMergeSMS',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.CheckChangeStatusSMS = function (model) {
        var data = {
            url: urlBase + '/CheckChangeStatusSMS',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.ChangeMergeStatus = function (model) {
        var data = {
            url: urlBase + '/ChangeMergeStatus',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.AddEditUser = function (model) {
        var data = {
            url: urlBase + '/AddEditUser',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.UpdateUser = function (model) {
        var data = {
            url: urlBase + '/UpdateUser',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckUpdateAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    UsersFactory.RemoveDelegate = function (model) {
        var data = {
            url: urlBase + '/RemoveDelegate',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckUpdateAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.DeleteUser = function (model) {
        var data = {
            url: urlBase + '/DeleteUser',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckUpdateAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetUserPrivilegesByUserName = function (model) {
        var data = {
            url: urlBase + '/GetUserPrivilegesByUserName',
            details: model

        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.GetPrivileges = function (model) {
        var data = {
            url: urlBase + '/GetPrivileges',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.UpdateUserPrivileges = function (vm) {
        var data = {
            url: urlBase + '/UpdateUserPrivileges',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    UsersFactory.CheckUserNamData = function (postedData) {
        var url = '/api/Account/CheckUserNamData';
        return $http.post(url, postedData);
    };

    UsersFactory.CheckEmailData = function (postedData) {
        var url = '/api/Account/CheckEmailData';
        return $http.post(url, postedData);
    };

    UsersFactory.CheckIdentityData = function (IdentityNo) {
        var data = {
            url: urlBase + '/CheckIdentityData/?IdentityNo=' + IdentityNo
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.DownloadActivationForm = function (data) {
        var deferred = $q.defer();
        $http.post(urlBase + '/DownloadActivationForm', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };


    UsersFactory.GetUserProfileAttachments = function (model) {
        var data = {
            url: '/api/Account/GetUserProfileAttachments',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    UsersFactory.UpdateUserAgreement = function (model) {
        var data = {
            url: '/api/Account/UpdateUserAgreement',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    UsersFactory.UpdateCommercial = function (model) {
        var data = {
            url: 'api/Users/UpdateCommercial',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    return UsersFactory;
}]);



;
app.factory('HomeSvc', ['$q', 'httpRequestSvc', function ($q, httpRequestSvc) {
    var urlBase = '/api/GateWay';
    var HomeSvcFactory = {};

    HomeSvcFactory.GetMemberData = function (vm) {
        var data = {
            url: urlBase + '/GetMemberData',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    HomeSvcFactory.EditMemberData = function (vm) {
        var data = {
            url: urlBase + '/EditMemberData',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    HomeSvcFactory.getMemberOwners = function (vm) {
        var data = {
            url: urlBase + '/GetMembersOwners',

            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };


    HomeSvcFactory.getMemberAuthorized = function (vm) {
        var data = {
            url: urlBase + '/GetAuthorizedSig',

            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };

    HomeSvcFactory.showPdf = function (vm) {
        var data = {
            url: urlBase + '/CreatePdf',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };
    HomeSvcFactory.DocumentImageDownload = function (lnk) {
        var data = {
            url: lnk
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };
    return HomeSvcFactory;
}]);


;
 
    "use strict"; 
    app.factory('sendSmsSvc', ['$http', '$q', function ($http, $q) {

        var svc = {};
        svc.sendSms = function (data) {
            var deferred = $q.defer();
            $http.post('/api/SMS/SendSmsWithCode', data).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };


        svc.SendSuccessRegisterSms = function (data) {
            var deferred = $q.defer();
            $http.post('/api/SMS/SendSuccessRegisterSms', data).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

        svc.DownloadActivationForm = function (data) {
            var deferred = $q.defer();
            $http.post('/api/Request/DownloadActivationForm', data).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

        function SendMessageWithCode(Phone) {
            return $http.post('/api/Message/SendMessageWithCode', Phone);
        }

        svc.CheckEmailConfirmed = function (data) {
            var deferred = $q.defer(); 
            $http.post('/api/GateWay/CheckEmailConfirmed', data).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;

        };
        return svc;

    }]);



 



;

"use strict";

app.factory('GateWaySvc', ['$http', '$q', function ($http, $q) {
    /* Check for the validation of the chamber and member id and Record status */

    function checkChamberValidation(chamberData) {
        return $http.post('api/GateWay/Check_Chamber_Validation', chamberData);
    }
    function CheckMemberSig(chamberData) {
        return $http.post('api/GateWay/CheckMemberSig', chamberData);
    }
    function GetChamberAgreement(chamberData) {
        return $http.post('api/GateWay/GetChamberAgreement', chamberData);
    }
    function GetRequestDataByRequestId(details) {
        return $http.post('api/Request/GetRequestDataByRequestId', details);
    }
    function GetRequestDataByRequestIdNonAuth(details) {
        return $http.post('api/RequesNonAuth/GetRequestDataByRequestId', details);
    }
    function GetVerifyRequestNonAuth(data) {
        var deferred = $q.defer();
        $http.post('api/RequesNonAuth/VerifyRequest', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;

        // return $http.post('api/RequesNonAuth/VerifyRequest', details);
    }

    function GetCommericalManual(data) {
        var deferred = $q.defer();
        $http.post('/api/GateWay/GetCommericalManual', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }




    function GetPrintByRequestType(details) {
        return $http.post('api/Print/GetPrintByRequestType', details);
    }

    function CheckMemberOwnerIsResponsibleUser(registerData) {
        return $http.post('api/GateWay/CheckMemberOwnerIsResponsibleUser', registerData);
    }

    function saveMemberUserData(postedData) {
        return $http.post('api/MembersUsers/SaveUser', postedData);
    }

    function CheckUserNamData(postedData) {
        return $http.post('api/Account/CheckUserNamData', postedData);
    }

    function CheckEmailData(postedData) {
        return $http.post('api/Account/CheckEmailData', postedData);
    }


    function getUsers(userInfo) {
        return $http.post('api/Account/GetUsers', userInfo);
    }


    function UserForgetPassword(chamberData) {
        return $http.post('api/GateWay/UserForgetPassword', chamberData);
    }


    function sendPass(data) {
        var deferred = $q.defer();
        $http.post('api/MembersUsers/SendPass', data).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

    return {
        checkChamberValidation: checkChamberValidation,
        CheckMemberSig: CheckMemberSig,
        GetChamberAgreement: GetChamberAgreement,
        CheckMemberOwnerIsResponsibleUser: CheckMemberOwnerIsResponsibleUser,
        saveMemberUserData: saveMemberUserData,
        getUsers: getUsers,
        sendPass: sendPass,
        CheckUserNamData: CheckUserNamData,
        CheckEmailData: CheckEmailData,
        GetRequestDataByRequestId: GetRequestDataByRequestId,
        GetPrintByRequestType: GetPrintByRequestType,
        UserForgetPassword: UserForgetPassword,
        GetRequestDataByRequestIdNonAuth: GetRequestDataByRequestIdNonAuth,
        GetVerifyRequestNonAuth: GetVerifyRequestNonAuth
    };

}]);
;
app.factory('PrintSvc', ['$q', 'authService', function ($q, authService) {
    var PrintSvcFactory = {};

    PrintSvcFactory.GetPrintByRequestType = function (vm) {
        var data = {
            url: '/api/Print/GetPrintByRequestType',

            details: vm
        };
        var deferred = $q.defer();
        authService.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return PrintSvcFactory;
}]);


;
app.factory('WalletSvc', ['$q', 'httpRequestSvc', function ($q, httpRequestSvc) {
    var urlBase = '/api/Wallet';
    var WalletSvcFactory = {};

    WalletSvcFactory.WalletTransactions = function (vm) {
        var data = {
            url: urlBase + '/WalletTransactions',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.GetWalletsTransInfoChart = function (vm) {
        var data = {
            url: urlBase + '/GetWalletsTransInfoChart'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.Pay = function (vm) {
        var data = {
            url: '/api/Charge/Pay',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.ValidateTransfer = function (vm) {
        var data = {
            url: urlBase + '/ValidateTransfer',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.ConfirmTransfer = function (vm) {
        var data = {
            url: urlBase + '/ConfirmTransfer',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };



    WalletSvcFactory.GetPayment = function (vm) {
        var data = {
            url: urlBase + '/GetPayment',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.CreatePayment = function (vm) {
        var data = {
            url: urlBase + '/CreatePayment',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    WalletSvcFactory.MoyasarUpdatePayId = function (vm) {
        var data = {
            url: urlBase + '/MoyasarUpdatePayId',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    WalletSvcFactory.CreateCreditPayment = function (vm) {
        var data = {
            url: urlBase + '/CreateCreditPayment',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.DirectCreateCreditPayment = function (vm) {
        var data = {
            url: 'https://api.moyasar.com/v1/payments.html',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    WalletSvcFactory.CreateWalletCharge = function (vm) {
        var data = {
            url: urlBase + '/CreateWalletCharge',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };



    WalletSvcFactory.GetWalletsInfo = function (vm) {
        var data = {
            url: '/api/GateWay/GetWalletsInfo',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    WalletSvcFactory.PayTabVerify = function (vm) {
        var data = {
            url: urlBase + '/PayTabVerify',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    WalletSvcFactory.TapVerify = function (vm) {
        var data = {
            url: urlBase + '/TapVerify',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    WalletSvcFactory.CheckTapVerify = function (vm) {
        var data = {
            url: urlBase + '/CheckTapVerify',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    WalletSvcFactory.TapCreatePage = function (vm) {
        var data = {
            url: urlBase + '/TapCreatePage',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.GetDrops = function () {
        var data = {
            url: urlBase + '/GetDrops'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    WalletSvcFactory.GetPortalTransactionsTypesDrop = function () {
        var data = {
            url: urlBase + '/GetPortalTransactionsTypesDrop'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    WalletSvcFactory.CheckPayTabVerify = function (vm) {
        var data = {
            url: urlBase + '/CheckPayTabVerify',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    
    WalletSvcFactory.InstrumentDetails = function (vm) {
        var data = {
            url: urlBase + '/InstrumentDetails',

            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.PayTabCreatePage = function (vm) {
        var data = {
            url: urlBase + '/PayTabCreatePage',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    WalletSvcFactory.MoyasarCreatePage = function (vm) {
        var data = {
            url: urlBase + '/MoyasarCreatePage',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return WalletSvcFactory;
}]);


;
 
    "use strict";
    app.factory('PagerService',[ function () {
     
        // service definition
        var service = {};

        service.GetPager = GetPager;

        return service;

        // service implementation
        function GetPager(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = currentPage || 1;

            // default page size is 10
            pageSize = pageSize || 10;

            // calculate total pages
            var totalPages = Math.ceil(totalItems / pageSize);

            var startPage, endPage;
            if (totalPages <= 10) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }
            }

            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control
            var pages =[];
            for (var i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

               // .range(startPage, endPage + 1);

            // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }

    }]); 
 
 
;
app.config(['TourConfigProvider', '$routeProvider', function (TourConfigProvider) {
    TourConfigProvider.set('scrollOffset', 50);
    TourConfigProvider.set('onStart', function () {
        console.log('Started Tour');
        console.log(TourConfigProvider);
    });
    TourConfigProvider.set('onNext', function () {
        console.log('Moving on...');
    });
}]);

app.run(['uiTourService', function (TourService) {
    TourService.createDetachedTour('detachedDemoTour', {
        name: 'detachedDemoTour',
        debug: true,
        useHotkeys: true
    }); 
}]);;

app.config(['KeepaliveProvider', 'IdleProvider', function (KeepaliveProvider, IdleProvider) {
    IdleProvider.idle(10 * 60);
    IdleProvider.timeout(1 * 60);
    KeepaliveProvider.interval(1);
}]);;

app.factory('ChartSvc', ['$q', 'httpRequestSvc', function ($q, httpRequestSvc) {
    var ChartSvcFactory = {};

    ChartSvcFactory.GetRequestsChart = function (vm) {
        var data = {
            url: '/api/Request/GetRequestsChart',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return ChartSvcFactory;
}]);

;
app.factory('ProfileSvc', ['$q', '$http', 'httpRequestSvc', function ($q, $http, httpRequestSvc) {

    var urlBase = '/api/Profile';
    var ProfileSvcFactory = {};

    ProfileSvcFactory.GetMemberData = function () {
        var data = {
            url: urlBase + '/GetMemberData'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetMemberOwners = function (vm) {
        var data = {
            url: urlBase + '/GetMemberOwners',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetContactData = function () {
        var data = {
            url: urlBase + '/GetContactData',
            details: {}
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.changePassword = function (vm) {
        var data = {
            url: '/api/Account/ChangePassword',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.SetPassword = function (vm) {
        var data = {
            url: '/api/Account/SetPassword',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.addNewUser = function (vm) {
        var data = {
            url: '/api/MembersUsers/AddNewUser',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetDrops = function (vm) {
        var data = {
            url: '/api/MembersUsers/GetDrops',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetUsersByMemberId = function (vm) {
        var data = {
            url: '/api/MembersUsers/GetUsersByMemberId',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.ActiveStop = function (vm) {
        var data = {
            url: '/api/MembersUsers/ActiveStop',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.DeleteSelectedUser = function (vm) {
        var data = {
            url: '/api/MembersUsers/DeleteSelectedUser',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDeleteAuthorize(data)
            .then(function (response) {
                var res = response;
                deferred.resolve(res);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetImageByDocumentId = function (vm) {
        var data = {
            url: urlBase + '/GetImageByDocumentId',

            details: vm
        };
        var deferred = $q.defer();
        authService.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);


            });
        return deferred.promise;
    };

    ProfileSvcFactory.DailyInstruments = function (vm) {
        var data = {
            url: urlBase + '/DailyInstruments',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.CertificatesOfOrigin = function (vm) {
        var data = {
            url: urlBase + '/CertificatesOfOrigin',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetPromotions = function (vm) {
        var data = {
            url: urlBase + '/GetPromotions',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.UpdateMemberData = function (vm) {
        var data = {
            url: urlBase + '/UpdateMemberData',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetContests = function (vm) {
        var data = {
            url: urlBase + '/GetContests',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.CreatePdf = function (model) {
        var deferred = $q.defer();
        $http.post('https://www.coccertificate.org/api/MembersCertificate/CertificateAsBase64', model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    ProfileSvcFactory.DocumentImageDownload = function (lnk) {
        var data = {
            url: urlBase + '/DocumentImageDownload',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    ProfileSvcFactory.GetMemberDocuments = function (vm) {
        var data = {
            url: urlBase + '/GetMemberDocuments',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

   

    ProfileSvcFactory.GetAuthorizedSignature = function (vm) {
        var data = {
            url: urlBase + '/GetAuthorizedSignature',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return ProfileSvcFactory;
}]);


;
//$scope.RenderFile = function (type, name, id, link) {
//    var model = link + "FileName=" + name + "&fileType=" + $scope.FileType + "&id=" + id;
//    var params = {
//        MemberId: GeneralInfo.globalSessionValues.GlobalMemberId
//    };

//    //Add authentication headers in URL
//    var url = [model, $.param(params)].join('&');

//    HomeSvc.documentImageDownload(url).then(function (response) {
//        if (response.success) {
//            var linkElement = document.createElement('a');
//            try {
//                var blob = b64toBlob(response.data, type);
//                var url = URL.createObjectURL(blob);
//                linkElement.setAttribute('href', url);
//                linkElement.setAttribute("download", name);

//                var clickEvent = new MouseEvent("click", {
//                    "view": window,
//                    "bubbles": true,
//                    "cancelable": false
//                });
//                linkElement.dispatchEvent(clickEvent);
//            } catch (ex) {
//                console.log(ex);
//            }
//        }
//    });
//};


app.service('renderFile',[ function () {
    var render = {};
    render.init = function (data) {
        var linkElement = document.createElement('a');
        try {
            var blob = b64toBlob(data.data, data.type);
            var url = URL.createObjectURL(blob);
            linkElement.setAttribute('href', url);
            linkElement.setAttribute("download", data.name);

            var clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            linkElement.dispatchEvent(clickEvent);
        } catch (ex) {
            console.log(ex);
        }
    };


    render.generateFileType = function (fileExtension) {
        try {
            var fileType = null;
            switch (fileExtension.toLowerCase()) {
                case "doc":
                case "docx":
                    fileType = "application/msword";
                    break;
                case "xls":
                case "xlsx":
                    fileType = "application/vnd.ms-excel";
                    break;
                case "pps":
                case "ppt":
                    fileType = "application/vnd.ms-powerpoint";
                    break;
                case "txt":
                    fileType = "text/plain";
                    break;
                case "rtf":
                    fileType = "application/rtf";
                    break;
                case "pdf":
                    fileType = "application/pdf";
                    break;
                case "msg":
                case "eml":
                    fileType = "application/vnd.ms-outlook";
                    break;
                case "gif":
                case "bmp":
                case "png":
                case "jpg":
                case "jpeg":
                case "peg":
                    fileType = "image/JPEG";
                    break;
                case "dwg":
                    fileType = "application/acad";
                    break;
                case "zip":
                    fileType = "application/x-zip-compressed";
                    break;
                case "rar":
                    fileType = "application/x-rar-compressed";
                    break;
            }
        } catch (ex) {
            console.log(ex);
        }
        return fileType;
    };


    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = []; 
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }


    return render;

}]);;



 
    app.factory('LookupSvc', ['$q', 'httpRequestSvc','$http',  function ($q, httpRequestSvc, $http) {
        var urlBase = '/api/Lookup';
        var LookupFactory = {};

        LookupFactory.GetLookups = function (values, key, filterValue) {
            var data = {
                url: urlBase + '/GetLookups/' + values + '/' + key + '/' + filterValue
            };
            var deferred = $q.defer();
            httpRequestSvc.CheckDetailsAuthorize(data)
                .then(function (response) {
                    console.log(response);
                    var data = response;
                    deferred.resolve(data);
                });
            return deferred.promise;
        };

        LookupFactory.NonMemberGetLookups = function (values, key, filterValue) {
            var data = {
                url: urlBase + '/NonMemberGetLookups/' + values + '/' + key + '/' + filterValue
            };
            var deferred = $q.defer();
            httpRequestSvc.CheckDetailsAuthorize(data)
                .then(function (response) {
                    console.log(response);
                    var data = response;
                    deferred.resolve(data);
                });
            return deferred.promise;
        };

        LookupFactory.GetPublicLookups = function (id,values, key, filterValue) {
            var deferred = $q.defer();
            $http.get(urlBase + '/GetPublicLookups/'+id + '/' + values + '/' + key + '/' + filterValue).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };
        LookupFactory.GetChambersDrops = function () {
            var deferred = $q.defer();
            $http.get(urlBase +'/GetChambersDrops').then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };
        LookupFactory.GetChambersDrops = function () {
            var deferred = $q.defer();
            $http.get(urlBase +'/GetChambersDrops').then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };
        LookupFactory.Relations = function () {
            var deferred = $q.defer();
            $http.get(urlBase +'/Relations').then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };
        LookupFactory.Specializations = function () {
            var deferred = $q.defer();
            $http.get(urlBase +'/Specializations').then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };


        return LookupFactory;
    }]);
 

;
app.service('requestsValidationSvc', ['globalService', 'sharedService', '$filter', '$rootScope',
    function requestsValidationSvc(globalService, sharedService, $filter, $rootScope) {

        var Errors = [];

        this.validateFormInputs = function () {

        };


        this.validateRequest = function (model, page, reasons, benefits, gridsArray) {
            Errors = [];
            switch (model.requestType) {
                case 1:
                    return this.Request_1(model, page);
                case 2:
                    return this.Request_2(model, page);
                case 3:
                    return this.Request_3(model, page);
                case 5:
                    return this.Request_5(model, page);
                case 6:
                    return this.Request_6(model, page, reasons, benefits);
                case 8:
                    return this.Request_8(model, page);
                case 9:
                    return this.Request_9(model, page);
                case 10:
                    return this.Request_10(model, page, reasons, benefits);
                case 11:
                    return this.Request_11(model, page);
                case 12:
                    return this.Request_12(model, page, reasons, benefits);
                case 15:
                    return this.Request_15(model, page);
                case 16:
                    return this.Request_16(model, page);
                case 17:
                    return this.Request_17(model, page, reasons, benefits);
                case 18:
                    return this.Request_18(model, page, reasons, benefits);
                case 19:
                    return this.Request_19(model, page, reasons, benefits);
                case 20:
                    return this.Request_20(model, page, reasons, benefits);
                case 21:
                    return this.Request_21(model, page, reasons, benefits);
                case 22:
                    return this.Request_22(model, page, reasons, benefits);
                case 23:
                    return this.Request_23(model, page);
                case 24:
                    return this.Request_24(model, page);
                case 25:
                    return this.Request_25(model, page);
                case 26:
                    return this.Request_26(model, page);
                case 27:
                    return this.Request_27(model, page);
                case 28:
                    return this.Request_28(model, page);
                //  case 29:
                //      return this.Request_29(model);
                case 32:
                    return this.Request_32(model, page);
                case 33:
                    return this.Request_33(model, page);
                case 35:
                    return this.Request_35(model, page, reasons);
                case 36:
                    return this.Request_36(model, page);
                case 38:
                    return this.Request_38(model, page);
                case 39:
                    return this.Request_39(model, page);
                case 40:
                    return this.Request_40(model, page);
                case 42:
                    return this.Request_42(model, page);
                case 43:
                    return this.Request_43(model, page, reasons);
                case 44:
                    return this.Request_45(model, page);
                case 46:
                    return this.Request_46(model, page, reasons);
                case 49:
                    return this.Request_49(model, page);
                case 50:
                    return this.Request_50(model, page, reasons);
                case 52:
                    return this.Request_52(model, page, reasons);
                case 57:
                    return this.Request_57(model, page, gridsArray);
                case 58:
                    return this.Request_58(model, page, gridsArray);
                case 61:
                    return this.Request_5(model, page);
                default:
                    return Errors;
            }
        };

        this.Request_1 = function (model, page) {
            var filteredList = $.grep(model.UpdateRequestFields, function (e) { return e.Checked === true; });
            //$filter("filter")(model.UpdateRequestFields, { Checked: true });
            if (filteredList.length === 0) {
                Errors.push('قم بتحديد البيانات المراد تحديثها !');
            }
            return Errors;
        };

        this.Request_2 = function (model, page) {
            DateYear = null;
            if (model.MC_BillDate === null || model.MC_BillDate === '' || model.MC_BillDate === undefined) {
                Errors.push("تاريخ الفاتورة مطلوب.");
                return Errors;
            }
            if ($rootScope.chamberSettings.id != 601) {
                if (model.MC_CertificateOfOriginDate === null || model.MC_CertificateOfOriginDate === '' || model.MC_CertificateOfOriginDate === undefined) {
                    Errors.push("تاريخ شهادة المنشأ مطلوب.");
                    return Errors;
                }
            }


            DateYear = model.MC_BillDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.MC_BillDate > page.CurrentDateGr) {
                    Errors.push('تاريخ الفاتورة أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else { //Hijri
                if (model.MC_BillDate > page.CurrentDateHi) {
                    Errors.push('تاريخ الفاتورة أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            ///////////////////////////////////////
            DateYear = model.MC_CertificateOfOriginDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.MC_CertificateOfOriginDate > page.CurrentDateGr) {
                    Errors.push('تاريخ شهادة المنشأ أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else { //Hijri
                if (model.MC_CertificateOfOriginDate > page.CurrentDateHi) {
                    Errors.push('تاريخ شهادة المنشأ أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            if (model.ShowObligation === true) {
                var lfckv = document.getElementById("checkbox1").checked;
                if (lfckv === false) {
                    Errors.push("فضلاً , وافق على الشروط  .");
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_3 = function (model, page) {
            DateYear = null;
            if (model.StartDate === null || model.StartDate === '' || model.StartDate === undefined) {
                Errors.push('فضلاً . أختر تاريخ البداية .');
                return Errors;
            }
            if (model.EndDate === null || model.EndDate === '' || model.EndDate === undefined) {
                Errors.push('فضلاً . أختر تاريخ النهاية .');
                return Errors;
            }
            DateYear = model.StartDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.StartDate < page.CurrentDateGr) {
                    Errors.push('تاريخ بدء العرض يجب ان يكون اكبر من او يساوي تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.EndDate < model.StartDate) {
                    Errors.push('تاريخ انتهاء العرض اصغر من تاريخ بدا العرض .');
                    return Errors;
                }
            }
            else { //Hijri
                if (model.StartDate < page.CurrentDateHi) {
                    Errors.push('تاريخ بدء العرض يجب ان يكون اكبر من او يساوي تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.EndDate < model.StartDate) {
                    Errors.push('تاريخ انتهاء العرض اصغر من تاريخ بدا العرض .');
                    return Errors;
                }
            }

            var date2 = new Date(model.EndDate);
            var date1 = new Date(model.StartDate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var monthDifference = dayDifference / 30;
            if (model.ExpireDateInterval !== null) {
                if (monthDifference > model.ExpireDateInterval) {
                    Errors.push('لا يمكن ان تزيد مدة العرض عن ' + model.ExpireDateInterval + ' ' + 'شهر');
                    return Errors;
                }
            }

            return Errors;
        };

        this.Request_5 = function (model, page) {
            if (!$rootScope.chamberSettings.enableFroalaEditor) {
                return this.Request_5_old(model, page);
            } else {
                $(".note-editable p").css("line-height", "1.2");
                if (model.RequestText === "<p><br></p>" || model.RequestText === '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>') {
                    Errors.push('يرجى ادخال نص الطلب.');
                    return Errors;
                }
                var content = model.RequestText.replace(/\/>/g, '')
                    .replace(/<\//g, '')
                    .replace(/[<>]/g, '');
                var minCharacteres = 50;
                model.RequestTextLength = content.length;
                if (model.RequestTextLength < minCharacteres) {
                    Errors.push('يجب ان يتعدي النص المٌدخل 50 حرف');
                    return Errors;
                }


                if (model.RequestTextLength > 2000000) {
                    Errors.push('النص المٌدخل تعدي الحد المسموح');
                    return Errors;
                }

                return Errors;
            }
        };

        this.Request_5_old = function (model, page) {
            $(".note-editable p").css("line-height", "1.2");
            var content = $("<div />").html($("#summernote").code());

            var HtmlBodyContent = content[0].innerText;
            var RequestText = HtmlBodyContent.replace("AL-Mohanad", "Arial");
            var res = isNullOrWhitespace(RequestText);

            if (res === true) {
                Errors.push('يرجى ادخال نص الطلب.');
                return Errors;
            }

            if (RequestText === "<p><br></p>") {
                Errors.push('يرجى ادخال نص الطلب.');
                return Errors;
            }

            var minCharacteres = 50;
            var totalCaracteres = HtmlBodyContent.length;
            //   var imageCount = HtmlBodyContent.find('img').length;
            if (totalCaracteres < minCharacteres) {
                Errors.push('يجب ان يتعدي النص المٌدخل 50 حرف');
                return Errors;
            }


            if (totalCaracteres > 2000000) {
                Errors.push('النص المٌدخل تعدي الحد المسموح');
                return Errors;
            }

            return Errors;
        };


        this.Request_6 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };

        this.Request_8 = function (model, page) {
            if (model.IdNumber !== null && model.IdNumber !== undefined && model.IdNumber !== '') {
                var FIndex = model.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                    return Errors;
                }
            }
            if (model.AuthorizationPeriod !== '' && model.AuthorizationPeriod !== undefined && model.AuthorizationPeriod !== null) {
                model.AuthorizationPeriod = globalService.ConvertToEnglishNumbers(model.AuthorizationPeriod);
                model.AuthorizationPeriod = Number(model.AuthorizationPeriod);
                var givenIntervalSetting = model.ExpireDateInterval / 30;
                if (model.AuthorizationPeriod > givenIntervalSetting) {
                    Errors.push("يجب الا تتعدى مدة التفويض عن " + model.ExpireDateInterval / 30 + " شهر  ");
                    return Errors;
                }
            }
            return Errors;
        };


        this.Request_9 = function (model, page) {
            if (model.WorkStartDate === null || model.WorkStartDate === '' || model.WorkStartDate === undefined) {
                Errors.push('فضلاً . أختر تاريخ بدء العمل .');
                return Errors;
            }
            if (model.WorkStartDate.substring(0, 4) > 1754) {
                if (model.WorkStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ بدء العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {
                if (model.WorkStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ بدء العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            if (model.IdNumber !== null && model.IdNumber !== undefined && model.IdNumber !== '') {
                var FIndex = model.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_10 = function (model, page, reasons, benefits) {
            if (model.IdNumber !== null && model.IdNumber !== undefined && model.IdNumber !== '') {
                FIndex = model.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                    return Errors;
                }
            }
            DateYear = null;
            if (model.AuthorizedExpireDate === null || model.AuthorizedExpireDate === '' || model.AuthorizedExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ إنتهاء التفويض.");
                return Errors;
            }
            DateYear = model.AuthorizedExpireDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.AuthorizedExpireDate < page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.AuthorizedExpireDate < page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من  أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            Errors = this.checkReasonsAssigned(model, reasons);
            //  Errors = this.checkBenefits(benefits);
            return Errors;
        };

        this.Request_11 = function (model, page) {
            DateYear = null;
            if (model.WorkStartDate === null || model.WorkStartDate === '' || model.WorkStartDate === undefined) {
                Errors.push("فضلاً , حدد  تاريخ بدء العمل .");
                return Errors;
            }
            if (model.WorkStartDate.substring(0, 4) > 1754) {
                if (model.WorkStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ بدأ العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {
                if (model.WorkStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ بدأ العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            if (model.IdNumber !== null && model.IdNumber !== undefined && model.IdNumber !== '') {
                FIndex = model.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0" || FIndex === 1) {
                    Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_12 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            //رقم الحدود
            if (reasons.length === 1 && reasons[0].id !== 1) {
                for (var r = 0; r < benefits.length; r++) {
                    var n = benefits[r];
                    if (n !== null) {
                        if (n.benefitId !== null && n.benefitId !== undefined && n.benefitId !== '') {
                            if (n.benefitId.length < 10) {
                                Errors.push("فضلاً , أدخل رقم هوية مكون من 10 ارقام !  ");
                            }
                            FIndex = n.benefitId.charAt(0);
                            if (FIndex > "2" || FIndex === "0") {
                                Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                            }
                        }
                    }
                }
            }

            return Errors;
        };



        //function firstDigit(n) {
        //    // Remove last digit from number
        //    // till only one digit is left
        //    while (n >= 10)
        //        n /= 10;

        //    // return the first digit
        //    return Math.floor(n);
        //}

        //// Find the last digit
        //function lastDigit(n) {
        //    // return the last digit
        //    return Math.floor(n % 10);
        //}

        this.Request_15 = function (model, page) {
            if (model.IdentityIssueDate === null || model.IdentityIssueDate === '' || model.IdentityIssueDate === undefined) {
                Errors.push('فضلاً . أختر تاريخ اصدار الهوية .');
                return Errors;
            }
            if (model.IdentityIssueDate.substring(0, 4) > 1754) {
                if (model.IdentityIssueDate > page.CurrentDateGr) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {
                if (model.IdentityIssueDate > page.CurrentDateHi) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            return Errors;
        };
        this.Request_16 = function (model, page) {
            if (model.IdentityIssueDate === null || model.IdentityIssueDate === '' || model.IdentityIssueDate === undefined) {
                Errors.push('فضلاً . أختر تاريخ اصدار الهوية .');
                return Errors;
            }
            if (model.IdentityIssueDate.substring(0, 4) > 1754) {
                if (model.IdentityIssueDate > page.CurrentDateGr) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {
                if (model.IdentityIssueDate > page.CurrentDateHi) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            return Errors;
        };
        this.Request_17 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_18 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_19 = function (model, page, reasons, benefits) {

            DateYear = null;
            DateYear = model.MunicipalityIsssueDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.MunicipalityIsssueDate > page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ رخصة البلدية أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.MunicipalityIsssueDate > page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ رخصة البلدية  أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            DateYear = model.FirstIdNumberIsssueDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.FirstIdNumberIsssueDate > page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ اصدار الهوية  الطرف الأول أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.FirstIdNumberIsssueDate > page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ اصدار الهوية الطرف الأول  أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            DateYear = model.SecondIdNumberIsssueDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.SecondIdNumberIsssueDate > page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ اصدار الهوية الطرف الثاني  أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.SecondIdNumberIsssueDate > page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ اصدار الهوية  الطرف الثاني أكبر من   تاريخ اليوم الحالى");
                    return Errors;
                }
            }

            return Errors;
        };
        this.Request_20 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_21 = function (model, page, reasons, benefits) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };

        this.Request_22 = function (model, page, reasons, benefits) {
            if (model.IdNumber !== null && model.IdNumber !== undefined && model.IdNumber !== '') {
                FIndex = model.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                    return Errors;
                }
            }
            DateYear = null;
            if (model.AuthorizedExpireDate === null || model.AuthorizedExpireDate === '' || model.AuthorizedExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ إنتهاء التفويض.");
                return Errors;
            }
            DateYear = model.AuthorizedExpireDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.AuthorizedExpireDate < page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.AuthorizedExpireDate < page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            Errors = this.checkReasonsAssigned(model, reasons);
            Errors = this.checkBenefits(benefits);
            return Errors;
        };

        this.Request_23 = function (model, page) {
            var DateYear = null;
            if (model.IdStartDate === null || model.IdStartDate === '' || model.IdStartDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  اصدار الهوية  .");
                return Errors;
            }

            DateYear = model.IdStartDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.IdStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {  //Hijri
                if (model.IdStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ اصدار الهوية أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            return Errors;
        };
        this.Request_24 = function (model, page) {
            var DateYear = null;
            if (model.IdStartDate === null || model.IdStartDate === '' || model.IdStartDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  اصدار الهوية  .");
                return Errors;
            }
            if (model.IdExpireDate === null || model.IdExpireDate === '' || model.IdExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  انتهاء الهوية  .");
                return Errors;
            }
            DateYear = model.IdStartDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.IdStartDate >= page.CurrentDateGr) {
                    Errors.push('تاريخ إصدار الهوية يجب أن يكون أقل من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.IdStartDate > model.IdExpireDate) {
                    Errors.push("فضلاً ,  تاريخ اصدارالهويةاكبر من تاريخ الانتهاء  .");
                    return Errors;
                }
                if (model.IdExpireDate <= page.CurrentDateGr) {
                    Errors.push('تاريخ إنتهاء الهوية يجب أن يكون أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {  //Hijri
                if (model.IdStartDate >= page.CurrentDateHi) {
                    Errors.push('تاريخ إصدار الهوية يجب أن يكون أقل من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.IdStartDate > model.IdExpireDate) {
                    Errors.push("فضلاً ,  تاريخ اصدارالهويةاكبر من تاريخ الانتهاء  .");
                    return Errors;
                }
                if (model.IdExpireDate <= page.CurrentDateHi) {
                    Errors.push('تاريخ إنتهاء الهوية يجب أن يكون أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_25 = function (model, page) {
            var DateYear = null;
            if (model.WorkStartDate === null || model.WorkStartDate === undefined || model.WorkStartDate === '') {
                Errors.push("فضلاً , حدد تاريخ  بداية العمل  .");
                return Errors;
            }
            DateYear = model.WorkStartDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.WorkStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ بداية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else { //Hijri
                if (model.WorkStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ بداية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_26 = function (model, page) {
            var DateYear = null;
            if (model.WorkStartDate === null || model.WorkStartDate === undefined || model.WorkStartDate === '') {
                Errors.push("فضلاً , حدد تاريخ  بداية العمل  .");
                return Errors;
            }
            if (model.WorkEndDate === null || model.WorkEndDate === undefined || model.WorkEndDate === '') {
                Errors.push("فضلاً , حدد تاريخ  نهاية العمل  .");
                return Errors;
            }
            DateYear = model.WorkStartDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.WorkStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ بداية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.WorkEndDate > page.CurrentDateGr) {
                    Errors.push('تاريخ نهاية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.WorkStartDate > model.WorkEndDate) {
                    Errors.push("فضلاً ,  تاريخ بداية العمل اكبر من نهاية العمل  .");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.WorkStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ بداية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.WorkEndDate > page.CurrentDateHi) {
                    Errors.push('تاريخ نهاية العمل أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.WorkStartDate > model.WorkEndDate) {
                    Errors.push("فضلاً ,  تاريخ بداية العمل اكبر من نهاية العمل  .");
                    return Errors;
                }
            }
            return Errors;
        };

        // *  طلب تعهد جمركى  *//
        this.Request_27 = function (model, page) {
            if (model.EstPhone === null || model.EstPhone === undefined || model.EstPhone === '') {
                Errors.push("فضلاً , ادخل رقم الهاتف !  ");
                return Errors;
            }
            if (model.EstAddress === null || model.EstAddress === undefined || model.EstAddress === '') {
                Errors.push("فضلاً , ادخل العنوان  !  ");
                return Errors;
            }
            if (model.EstFax === null || model.EstFax === undefined || model.EstFax === '') {
                Errors.push("فضلاً , ادخل الفاكس  !  ");
                return Errors;
            }

            if (model.EstEmail === null || model.EstEmail === undefined || model.EstEmail === '') {
                Errors.push("فضلاً , ادخل البريد الالكترونى  !  ");
                return Errors;
            }
            if (model.MM_AdrPOBox === null || model.MM_AdrPOBox === undefined || model.MM_AdrPOBox === '') {
                Errors.push("فضلاً , ادخل صندوق البريد  !  ");
                return Errors;
            }
            if (model.ReceiveDate === null || model.ReceiveDate === undefined || model.ReceiveDate === '') {
                Errors.push("فضلاً , ادخل تاريخ الاستلام !  ");
                return Errors;
            }

            DateYear = model.ReceiveDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.ReceiveDate < page.CurrentDateGr) {
                    Errors.push('تاريخ الإستلام يجب ان يكون اكبر من او يساوي تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else { //Hijri
                if (model.ReceiveDate < page.CurrentDateHi) {
                    Errors.push('تاريخ الإستلام يجب ان يكون اكبر من او يساوي تاريخ اليوم الحالى .');
                    return Errors;
                }
            }


            return Errors;
        };

        this.Request_28 = function (model, page) {
            var DateYear = null;
            if (model.ContestStartDate === null || model.ContestStartDate === '' || model.ContestStartDate === undefined) {
                Errors.push('تاريخ بدا المسابقة مطلوب.');
                return Errors;
            }
            if (model.ContestEndDate === null || model.ContestEndDate === '' || model.ContestEndDate === undefined) {
                Errors.push('تاريخ نهاية المسابقة مطلوب.');
                return Errors;
            }
            if (model.SortingDate === null || model.SortingDate === '' || model.SortingDate === undefined) {
                Errors.push('تاريخ اجراء الفرز مطلوب.');
                return Errors;
            }
            if (model.ResultsDate === null || model.ResultsDate === '' || model.ResultsDate === undefined) {
                Errors.push('تاريخ إعلان النتائج مطلوب.');
                return Errors;
            }
            if (model.AwardsDate === null || model.AwardsDate === '' || model.AwardsDate === undefined) {
                Errors.push('تاريخ توزيع الجوائز مطلوب.');
                return Errors;
            }
            if (model.DeadlineAcceptingContestCouponDate === null ||
                model.DeadlineAcceptingContestCouponDate === '' ||
                model.DeadlineAcceptingContestCouponDate === undefined) {
                Errors.push('آخـر موعد لقبول قسيمة الاشتراك بالمسابقة مطلوب.');
                return Errors;
            }
            if ((model.ContestStartDate.substring(0, 4) > 1754 && model.ContestEndDate.substring(0, 4) < 1754)
                || (model.ContestStartDate.substring(0, 4) < 1754 && model.ContestEndDate.substring(0, 4) > 1754)) {
                Errors.push('من فضلك ادخل التواريخ بصيغة موحدة اما هجريا او ميلاديا .');
                return Errors;
            }
            if ((model.SortingDate.substring(0, 4) > 1754 && model.ContestStartDate.substring(0, 4) < 1754)
                || (model.SortingDate.substring(0, 4) < 1754 && model.ContestStartDate.substring(0, 4) > 1754)) {
                Errors.push('من فضلك ادخل التواريخ بصيغة موحدة اما هجريا او ميلاديا .');
                return Errors;
            }
            if ((model.ResultsDate.substring(0, 4) > 1754 && model.SortingDate.substring(0, 4) < 1754)
                || (model.ResultsDate.substring(0, 4) < 1754 && model.SortingDate.substring(0, 4) > 1754)) {
                Errors.push('من فضلك ادخل التواريخ بصيغة موحدة اما هجريا او ميلاديا .');
                return Errors;
            }
            if ((model.AwardsDate.substring(0, 4) > 1754 && model.SortingDate.substring(0, 4) < 1754)
                || (model.AwardsDate.substring(0, 4) < 1754 && model.SortingDate.substring(0, 4) > 1754)) {
                Errors.push('من فضلك ادخل التواريخ بصيغة موحدة اما هجريا او ميلاديا .');
                return Errors;
            }
            if ((model.DeadlineAcceptingContestCouponDate.substring(0, 4) > 1754 && model.ContestStartDate.substring(0, 4) < 1754)
                || (model.DeadlineAcceptingContestCouponDate.substring(0, 4) < 1754 && model.ContestStartDate.substring(0, 4) > 1754)) {
                Errors.push('من فضلك ادخل التواريخ بصيغة موحدة اما هجريا او ميلاديا .');
                return Errors;
            }

            var allowedPeriodForStart = model.MaxBeforeCompetitionStart;
            DateYear = model.ContestStartDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                const maxAllowedDate = moment().add(allowedPeriodForStart, 'days').format('YYYY-MM-DD');
                if (model.ContestStartDate < maxAllowedDate) {
                    Errors.push('تاريخ بداية المسابقة يجب أن يكون أكبر من أو يساوي ' + allowedPeriodForStart +' يوم من تاريخ اليوم .');
                    return Errors;
                }
                const maxEndDate = moment(model.ContestStartDate).add(60, 'days').format('YYYY-MM-DD');
                if (model.ContestEndDate >= maxEndDate) {
                    Errors.push('تاريخ نهاية المسابقة لا يسمح أن يكون أكبر من تاريخ البداية ب٦٠ يوم .');
                    return Errors;
                }
                if (model.ContestEndDate < model.ContestStartDate) {
                    Errors.push('تاريخ انتهاء المسابقة اصغر من تاريخ بدا المسابقة .');
                    return Errors;
                }
                if (model.SortingDate < model.ContestEndDate) {
                    Errors.push('تاريخ اجراء الفرز اصغر من تاريخ نهاية المسابقة .');
                    return Errors;
                }
                if (model.ResultsDate < model.SortingDate) {
                    Errors.push('تاريخ إعلان النتائج اصغر من تاريخ اجراء الفرز .');
                    return Errors;
                }
                const maxResultsDate = moment(model.ContestEndDate).add(30, 'days').format('YYYY-MM-DD');
                if (model.ResultsDate >= maxResultsDate) {
                    Errors.push('لايمكن تاريخ اعلان النتائج أكبر من 30 يوم من تاريخ نهاية المسابقة .');
                    return Errors;
                }
                if (model.AwardsDate < model.SortingDate) {
                    Errors.push('تاريخ توزيع الجوائز اصغر من تاريخ اجراء الفرز .');
                    return Errors;
                }
                const maxawardsDate = moment(model.ResultsDate).add(7, 'days').format('YYYY-MM-DD');
                if (model.AwardsDate >= maxawardsDate) {
                    Errors.push('لايمكن تاريخ توزيع الجوائز ان يكون أكبر من 7 أيام من تاريخ انتهاء المسابقة .');
                    return Errors;
                }
                if (model.DeadlineAcceptingContestCouponDate < model.ContestStartDate) {
                    Errors.push('آخـر موعد لقبول قسيمة الاشتراك يجب ان يكون فى خلال مدة المسابقة المحددة .');
                    return Errors;
                }
                if (model.DeadlineAcceptingContestCouponDate > model.ContestEndDate) {
                    Errors.push('آخـر موعد لقبول قسيمة الاشتراك يجب ان يكون خلال مدة المسابقة المحددة .');
                    return Errors;
                }
            }
            else { //Hijri
                const maxAllowedDate = moment().add(allowedPeriodForStart, 'days').format('iYYYY/iMM/iDD');
                if (model.ContestStartDate < maxAllowedDate) {
                    Errors.push('تاريخ بداية المسابقة يجب أن يكون أكبر من أو يساوي ' + allowedPeriodForStart + ' يوم من تاريخ اليوم .');
                    return Errors;
                }
                const maxEndDate = moment(model.ContestStartDate).add(60, 'days').format('iYYYY/iMM/iDD');
                if (model.ContestEndDate >= maxEndDate) {
                    Errors.push('تاريخ نهاية المسابقة لا يسمح أن يكون أكبر من تاريخ البداية ب٦٠ يوم .');
                    return Errors;
                }
                if (model.ContestStartDate < page.CurrentDateHi) {
                    Errors.push('تاريخ بدء المسابقة اصغر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.ContestEndDate < model.ContestStartDate) {
                    Errors.push('تاريخ انتهاء المسابقة اصغر من تاريخ بدا المسابقة .');
                    return Errors;
                }
                if (model.SortingDate < model.ContestEndDate) {
                    Errors.push('تاريخ اجراء الفرز اصغر من تاريخ نهاية المسابقة .');
                    return Errors;
                }
                if (model.ResultsDate < model.SortingDate) {
                    Errors.push('تاريخ إعلان النتائج اصغر من تاريخ اجراء الفرز .');
                    return Errors;
                }
                if (model.AwardsDate < model.SortingDate) {
                    Errors.push('تاريخ توزيع الجوائز اصغر من تاريخ اجراء الفرز .');
                    return Errors;
                }
                if (model.DeadlineAcceptingContestCouponDate < model.ContestStartDate) {
                    Errors.push('آخـر موعد لقبول قسيمة الاشتراك يجب ان يكون فى خلال المسابقة المحددة .');
                    return Errors;
                }
                if (model.DeadlineAcceptingContestCouponDate > model.ContestEndDate) {
                    Errors.push('آخـر موعد لقبول قسيمة الاشتراك يجب ان يكون خلال مدة المسابقة المحددة .');
                    return Errors;
                }
            }
            if (model.ContestCouponsFrom > model.ContestCouponsTo) {
                Errors.push('   بداية الرقم اصغر من نهاية الرقم  .');
                return Errors;
            }

            if (model.ContestCouponsNumbers === 0) {
                Errors.push('  لايمكن ان تكون عدد القسائم بصفر  ! .');
                return Errors;
            }


            var firstDate = model.ContestEndDate;
            secondDate = model.ContestStartDate;
            var date2 = new Date(secondDate);
            var date1 = new Date(firstDate);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var monthDifference = dayDifference / 30;
            if (model.ExpireDateInterval !== null) {
                if (model.monthDifference > model.ExpireDateInterval) {
                    Errors.push('لا يمكن ان تزيد مدة العرض عن ' + model.ExpireDateInterval + ' ' + 'شهر');
                    return Errors;
                }
            }

            if (model.ContestQuestions.length <= 0) {
                Errors.push('فضلاً , أدخل أسئلة المسابقة.');
            }

            return Errors;
        };

        this.Request_32 = function (model, page) {
            if (model.IdentityExpireDate.substring(0, 4) > 1754) {
                if (model.IdentityExpireDate <= page.CurrentDateGr) {
                    Errors.push('تاريخ إنتهاء الإقامة يجب أن يكون أكبر من اليوم الحالى');
                    return Errors;
                }
            }
            else {
                if (model.IdentityExpireDate <= page.CurrentDateHi) {
                    Errors.push('تاريخ إنتهاء الإقامة يجب أن يكون أكبر من اليوم الحالى');
                    return Errors;
                }
            }
            return Errors;
        };

        this.Request_33 = function (model, page) {
            var DateYear = null;
            if (model.BirthDate === null || model.BirthDate === '' || model.BirthDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  الميلاد .");
            }
            DateYear = model.BirthDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.BirthDate >= page.CurrentDateGr) {
                    Errors.push('تاريخ الميلاد يجب ان يكون أقل من تاريخ اليوم الحالى .');
                }

            }
            else {  //Hijri
                if (model.BirthDate >= page.CurrentDateHi) {
                    Errors.push('تاريخ الميلاد يجب ان يكون أقل من تاريخ اليوم الحالى .');
                }
            }

            return Errors;
        };

        this.Request_36 = function (model, page) {

            if (model.FirstMemberId === model.SecondMemberId) {
                Errors.push("رقم العضوية للطرف الثاني غير صحيح ");
                return Errors;
            }

            if (model.FirstCRNumber === model.SecondCRNumber) {
                Errors.push("رقم السجل للطرف الثاني غير صحيح ");
                return Errors;
            }
            if (model.SecondMemberName === null || model.SecondMemberName === '' || model.SecondMemberName === undefined) {
                Errors.push("إسم منشأة الطرف الثانى مطلوب - يرجي التأكد من رقم السجل و رقم العضوية للطرف الثاني. ");
                return Errors;
            }
            if (model.noActiveUsers) {
                Errors.push("لا يوجد حسابات مفعلة لدى هذه العضوية ");
                return Errors;
            }

            if (page.useSummerNote) {
                return this.Request_36_old(model, page);
            } else {
                $(".note-editable p").css("line-height", "1.2");
                if (model.RequestText === "<p><br></p>" || model.RequestText === '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>') {
                    Errors.push('يرجى ادخال نص الطلب.');
                    return Errors;
                }




                if (model.RequestText === "<p><br></p>" || model.RequestText.includes('<p style="line-height: 1.2;"><br></p>') || model.RequestText === undefined || model.RequestText === "") {
                    Errors.push('يرجى ادخال نص الطلب.');
                    return Errors;
                }

                var content = model.RequestText.replace(/\/>/g, '')
                    .replace(/<\//g, '')
                    .replace(/[<>]/g, '');
                var minCharacteres = 50;
                model.RequestTextLength = content.length;
                if (model.RequestTextLength < minCharacteres) {
                    Errors.push('يجب ان يتعدي النص المٌدخل 50 حرف');
                    return Errors;
                }

                if (model.RequestTextLength > 2000000) {
                    Errors.push('النص المٌدخل تعدي الحد المسموح');
                    return Errors;
                }

                return Errors;
            }
        };

        this.Request_36_old = function (model, page) {
            if (model.noActiveUsers) {
                Errors.push("لا يوجد حسابات مفعلة لدى هذه العضوية ");
                return Errors;
            }


            if (model.FirstMemberId === model.SecondMemberId) {
                Errors.push("رقم العضوية للطرف الثاني غير صحيح ");
                return Errors;
            }

            if (model.FirstCRNumber === model.SecondCRNumber) {
                Errors.push("رقم السجل للطرف الثاني غير صحيح ");
                return Errors;
            }

            $(".note-editable p").css("line-height", "1.2");
            var brcount = (($(this).find('.note-editable br')).length);
            if (brcount > 0) {
                $("note-editable br").remove();
            }


            var content = $("<div />").html($("#summernote2").code());
            var HtmlBodyContent = content[0].innerHTML;
            var RequestText = HtmlBodyContent.replace("AL-Mohanad", "Arial");
            var res = isNullOrWhitespace(RequestText);
            if (res === true) {
                Errors.push('يرجى ادخال نص الطلب.');
                return Errors;
            }

            if (RequestText === "<p><br></p>" || RequestText.includes('<p style="line-height: 1.2;"><br></p>') || RequestText === undefined || RequestText === "") {
                Errors.push('يرجى ادخال نص الطلب.');
                return Errors;
            }
            return Errors;
        };



        this.Request_38 = function (model, page) {
            var DateYear = null;
            if (model.RentStartDate === null || model.RentStartDate === '' || model.RentStartDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  البداية .");
            }
            DateYear = model.RentStartDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.RentStartDate > page.CurrentDateGr) {
                    Errors.push('تاريخ بداية الايجار أكبر من تاريخ اليوم الحالى .');
                }
                if (model.RentStartDate > model.IdExpireDate) {
                    Errors.push("فضلاً ,  تاريخ بداية الايجار اكبر من تاريخ الانتهاء  .");
                }
                if (model.SecondPartIdIssueDate > page.CurrentDateGr) {
                    Errors.push("فضلاً ,  تاريخ اصدار هوية المستأجر اكبر من تاريخ اليوم  .");
                }
            }
            else {  //Hijri
                if (model.RentStartDate > page.CurrentDateHi) {
                    Errors.push('تاريخ بداية الايجار  أكبر من تاريخ اليوم الحالى .');
                }
                if (model.RentStartDate < page.CurrentDateHi) {
                    Errors.push('تاريخ إنتهاء الايجار اصغر من تاريخ اليوم الحالى .');
                }
                if (model.SecondPartIdIssueDate > page.CurrentDateHi) {
                    Errors.push("فضلاً ,  تاريخ اصدار هوية المستأجر اكبر من تاريخ اليوم  .");
                }
            }
            if (model.RentPeriod === null || model.RentPeriod === '' || model.RentPeriod === undefined) {
                Errors.push("فضلاً , حدد مدة العقد بالأشهر   .");
            }
            return Errors;
        };

        this.Request_40 = function (model, page) {
            var DateYear = null;
            if (model.PassportIssueDate === null || model.PassportIssueDate === '' || model.PassportIssueDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  الاصدار   .");
            }
            if (model.PassportExpireDate === null || model.PassportExpireDate === '' || model.PassportExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ  الانتهاء   .");
            }
            DateYear = model.PassportIssueDate.substring(0, 4);
            if (DateYear > 1754) {  // gri
                if (model.PassportIssueDate > page.CurrentDateGr) {
                    Errors.push('تاريخ الاصدار أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.PassportIssueDate > model.PassportExpireDate) {
                    Errors.push("فضلاً ,  تاريخ الاصدار اكبر من تاريخ الانتهاء  .");
                    return Errors;
                }
                if (model.PassportExpireDate <= page.CurrentDateGr) {
                    Errors.push('تاريخ الانتهاء يجب أن يكون أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }
            else {  //Hijri
                if (model.PassportIssueDate > page.CurrentDateHi) {
                    Errors.push('تاريخ الاصدار  أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
                if (model.PassportIssueDate > model.PassportExpireDate) {
                    Errors.push("فضلاً ,  تاريخ الاصدار اكبر من تاريخ الانتهاء  .");
                    return Errors;
                }
                if (model.PassportExpireDate <= page.CurrentDateHi) {
                    Errors.push('تاريخ الانتهاء يجب أن يكون أكبر من تاريخ اليوم الحالى .');
                    return Errors;
                }
            }

            angular.forEach(model.Followers, function (v, key) {
                //  var issueDate = null, expireDate = null;
                DateYear = v.PassportIssueDate.substring(0, 4);
                if (DateYear > 1754) {  // gri
                    if (v.PassportIssueDate > page.CurrentDateGr) {
                        Errors.push('تاريخ الاصدار أكبر من تاريخ اليوم الحالى . المرافقين- ');
                        return Errors;
                    }
                    if (v.PassportIssueDate > v.PassportExpireDate) {
                        Errors.push("فضلاً ,  تاريخ الاصدار اكبر من تاريخ الانتهاء  . المرافقين- ");
                        return Errors;
                    }
                    if (v.PassportExpireDate < page.CurrentDateGr) {
                        Errors.push('تاريخ الانتهاء اصغر من تاريخ اليوم الحالى . المرافقين- ');
                        return Errors;
                    }
                }
                else {  //Hijri
                    if (v.PassportIssueDate > page.CurrentDateHi) {
                        Errors.push('تاريخ الاصدار  أكبر من تاريخ اليوم الحالى . المرافقين- ');
                        return Errors;
                    }
                    if (v.PassportIssueDate > v.PassportExpireDate) {
                        Errors.push("فضلاً ,  تاريخ الاصدار اكبر من تاريخ الانتهاء  . المرافقين- ");
                        return Errors;
                    }
                    if (v.PassportExpireDate < page.CurrentDateHi) {
                        Errors.push('تاريخ الانتهاء  اصغر من تاريخ اليوم الحالى . المرافقين- ');
                        return Errors;
                    }
                }

            });



            return Errors;
        };
        this.Request_42 = function (model, page) {
            DateYear = null;
            if (model.AuthorizedExpireDate === null || model.AuthorizedExpireDate === '' || model.AuthorizedExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ إنتهاء التفويض.");
                return Errors;
            }
            DateYear = model.AuthorizedExpireDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.AuthorizedExpireDate < page.CurrentDateGr) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }
            else { //Hijri
                if (model.AuthorizedExpireDate < page.CurrentDateHi) {
                    Errors.push("عفواً , تاريخ إنتهاء التفويض يجب ان يكون أكبر من  أو يساوى تاريخ اليوم الحالى");
                    return Errors;
                }
            }

            return Errors;
        };
        this.Request_35 = function (model, page, reasons) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_39 = function (model, page) {
            DateYear = null;
            if (model.WorkStartDate === null || model.WorkStartDate === '' || model.WorkStartDate === undefined) {
                Errors.push("تاريخ العقد مطلوب.");
                return Errors;
            }

            //DateYear = model.WorkStartDate.substring(0, 4);
            //if (DateYear > 1754) {  // gri
            //    if (model.WorkStartDate > page.CurrentDateGr) {
            //        Errors.push('تاريخ الفاتورة أكبر من تاريخ اليوم الحالى .');
            //        return Errors;
            //    }
            //}
            //else { //Hijri
            //    if (model.WorkStartDate > page.CurrentDateHi) {
            //        Errors.push('تاريخ الفاتورة أكبر من تاريخ اليوم الحالى .');
            //        return Errors;
            //    }
            //}
            return Errors;
        };
        this.Request_43 = function (model, page, reasons) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_45 = function (model, page) {
            if (model.CityName === null || model.CityName === '' || model.CityName === undefined) {
                Errors.push("فضلاً التواصل مع الغرفة لتحديث البيانات او تقديم طلب تحديث بيانات  .");
            }
            if (model.CityName.length <= 1) {
                Errors.push('المدينة المرتبطة ببيانات العضوية غير صحيحة');
            }
            return Errors;
        };
        this.Request_46 = function (model, page, reasons) {
            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };
        this.Request_49 = function (model, page) {

            if (model.Date === null || model.Date === undefined || model.Date.length < 10) {
                Errors.push("فضلاً اختيار تاريخ مناسب");
            }
            DateYear = null;
            DateYear = model.Date.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.Date < page.CurrentDateGr) {
                    Errors.push("فضلاً ,  التاريخ أقل من تاريخ اليوم الحالي  .");
                }

            }
            else { //Hijri
                if (model.Date < page.CurrentDateHi) {
                    Errors.push("فضلاً ,  التاريخ أقل من تاريخ اليوم الحالي  .");
                }

            }
            return Errors;
        };
        this.Request_50 = function (model, page, reasons) {

            if (model.SupportedIssuedDate > model.SupportedExpireDate) {
                Errors.push("فضلاً ,  تاريخ نهاية السجل التجاري أقل من تاريخ اصدار السجل التجاري  .");
            }
            DateYear = null;
            DateYear = model.SupportedIssuedDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.SupportedExpireDate < page.CurrentDateGr) {
                    Errors.push("فضلاً ,  تاريخ نهاية السجل التجاري أقل من تاريخ اليوم الحالي  .");
                }
                if (model.SupportedIssuedDate > page.CurrentDateGr) {
                    Errors.push("فضلاً ,  تاريخ اصدار السجل التجاري أكبر من تاريخ اليوم الحالي  .");
                }
            }
            else { //Hijri
                if (model.SupportedExpireDate < page.CurrentDateHi) {
                    Errors.push("فضلاً ,  تاريخ نهاية السجل التجاري أقل من تاريخ اليوم الحالي  .");
                }
                if (model.SupportedIssuedDate > page.CurrentDateHi) {
                    Errors.push("فضلاً ,  تاريخ اصدار السجل التجاري أكبر من تاريخ اليوم الحالي  .");
                }
            }
            return Errors;
        };


        this.Request_52 = function (model, page, reasons) {
            var DateYear = null;
            if (model.BirthDate === null || model.BirthDate === '' || model.BirthDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ الميلاد  .");
                return Errors;
            }
            if (model.IdNumberExpireDate === null || model.IdNumberExpireDate === '' || model.IdNumberExpireDate === undefined) {
                Errors.push("فضلاً , حدد تاريخ انتهاء الهوية  .");
                return Errors;
            }
            if (model.BirthDate > page.CurrentDateGr) {
                Errors.push('تاريخ الميلاد يجب أن يكون أقل من اليوم الحالى .');
                return Errors;
            }

            if (model.IdNumberExpireDate < page.CurrentDateGr) {
                Errors.push('تاريخ انتهاء الهوية  يجب أن يكون أكبر من اليوم الحالى .');
                return Errors;
            }

            Errors = this.checkReasonsAssigned(model, reasons);
            return Errors;
        };

        this.Request_57 = function (model, page, gridsArray) {
            if (model.CompetitionStartDate > model.CompetitionEndDate) {
                Errors.push("فضلاً ,  تاريخ نهاية المسابقة أقل من تاريخ بدء المسابقة  .");
            }
            DateYear = null;
            DateYear = model.CompetitionStartDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.CompetitionStartDate < page.CurrentDateGr) {
                    Errors.push("فضلاً ,  تاريخ بدء المسابقة أقل من تاريخ اليوم الحالي  .");
                }
            }
            else { //Hijri
                if (model.CompetitionStartDate < page.CurrentDateHi) {
                    Errors.push("فضلاً ,  تاريخ بدء المسابقة أقل من تاريخ اليوم الحالي  .");
                }
            }
            DateYear = model.CompetitionEndDate.substring(0, 4);
            if (DateYear > 1754) { // gri
                if (model.CompetitionEndDate < page.CurrentDateGr) {
                    Errors.push("فضلاً ,  تاريخ نهاية المسابقة أقل من تاريخ اليوم الحالي  .");
                }
            }
            else { //Hijri
                if (model.CompetitionEndDate < page.CurrentDateHi) {
                    Errors.push("فضلاً ,  تاريخ نهاية المسابقة أقل من تاريخ اليوم الحالي  .");
                }
            }

            const CompetitionStartDate = new Date(model.CompetitionStartDate);
            const CompetitionEndDate = new Date(model.CompetitionEndDate);
            const diffTime = Math.abs(CompetitionEndDate - CompetitionStartDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 60) {
                Errors.push("يجب ألا تزيد مدة المسابقة عن 60 يوم  .");
            }


            var dates = [];
            var list = gridsArray.find(v => v.ParentName == 'WithdrawalsInformations').Grid;
            angular.forEach(list, function (val) {
                angular.forEach(val.SmallGrid, function (v) {
                    if (v.fieldType === 3) {
                        dates.push(v.WithdrawalsDate);
                    }
                });
            });

            angular.forEach(dates, function (val) {
                if (val > model.CompetitionEndDate || val < model.CompetitionStartDate) {
                    Errors.push("يجب أن يكون تاريخ السحب بين تاريخ  بدء ونهاية المسابقة  .");
                    return Errors;
                }
            });
            return Errors;
        };

        this.Request_58 = function (model, page, gridsArray) {
            Errors = [];
            angular.forEach(model.AuthorizedSignatoriesForPurchaseOrders, function (v, key) {
                var FIndex = v.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("المفوضين بالتوقيع على أوامر الشراء وإستلام الفواتير - أدخل رقم هوية صحيح !  ");
                    return Errors;
                }

                FIndex = v.Mobile.substring(0, 2);
                if (FIndex !== '05') {
                    Errors.push("المفوضين بالتوقيع على أوامر الشراء وإستلام الفواتير - أدخل رقم جوال صحيح !  ");
                    return Errors;
                }

            });

            angular.forEach(model.AuthorizedSignatoriesToReceiveTheMaterials, function (v, key) {
                var FIndex = v.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("المفوضين بالتوقيع لاستلام المواد - أدخل رقم هوية صحيح !  ");
                    return Errors;
                }

                FIndex = v.Mobile.substring(0, 2);
                if (FIndex !== '05') {
                    Errors.push("المفوضين بالتوقيع لاستلام المواد - أدخل رقم جوال صحيح !  ");
                    return Errors;
                }
            });

            angular.forEach(model.AuthorizedSignatoriesToAuthenticateValidityOfBalance, function (v, key) {
                var FIndex = v.IdNumber.charAt(0);
                if (FIndex > "2" || FIndex === "0") {
                    Errors.push("المفوضون بالتوقيع للمصادقة على صحة الرصيد - أدخل رقم هوية صحيح !  ");
                    return Errors;
                }

                FIndex = v.Mobile.substring(0, 2);
                if (FIndex !== '05') {
                    Errors.push("المفوضون بالتوقيع للمصادقة على صحة الرصيد - أدخل رقم جوال صحيح !  ");
                    return Errors;
                }
            });

            return Errors;
        };

        this.checkReasonsAssigned = function (model, reasons) {
            var requestReason = '';
            var Count = 0;
            reasons = $filter('filter')(reasons, { requestType: model.requestType, isChecked: true });
            for (var x = 0; x < reasons.length; x++) {
                var i = reasons[x];
                Count++;
                if (model.MaxSelectedOptions !== null) {
                    if (Count > model.MaxSelectedOptions) {
                        Errors.push('لايمكن تحديد اكثر من ' + model.MaxSelectedOptions + ' ');
                        return Errors;
                    }
                }

                if (i.id === 32 || i.id === 20 || i.id === 21 || i.id === 3) {
                    if (i.Period === '' || i.Period === null || i.Period === undefined) {
                        Errors.push('من فضلك ادخل  .' + i.name + ' ' + '؟');
                        return Errors;
                    }
                    //رقم التاشيرة الخاص بتفويض خدمات وزارة العمل
                    if (i.Period.length < 10 && (i.id === 3 || i.id === 32)) {
                        Errors.push('من فضلك ادخل رقم التاشيرة لايقل عن 10 ارقام  .');
                        return Errors;
                    }

                    if (requestReason === '') {
                        requestReason = requestReason + i.name + ' ' + i.Period;
                    }
                    else {
                        requestReason = requestReason + ' - ' + i.name + ' ' + i.Period;
                    }
                }
                if (i.id !== 32 && i.id !== 20 && i.id !== 21 && i.id !== 3 && model.requestType !== 52) {
                    if (requestReason === '') {
                        requestReason = requestReason + i.name;
                    }
                    else {
                        requestReason = requestReason + ' - ' + i.name;
                    }
                }
                if (model.requestType === 52) {
                    if (requestReason === '') {
                        requestReason = requestReason + i.name + ',' + i.Note;
                    }
                    else {
                        requestReason = requestReason + ' - ' + i.name + ', ' + i.Note;
                    }
                }
            }
            if (model.requestType === 52 && requestReason === '') {
                Errors.push('فضلاً , اختر برنامج واحد على الأقل  .');
                return Errors;
            }
            if (requestReason === '') {
                Errors.push('فضلاً , اختر سبب طلب التفويض .');
            }
            return Errors;
        };

        this.checkBenefits = function (benefits) {
            for (var r = 0; r < benefits.length; r++) {
                var n = benefits[r];
                if (n !== null) {
                    if (n.benefitId !== null && n.benefitId !== undefined && n.benefitId !== '') {
                        if (n.benefitId.length < 10) {
                            Errors.push("فضلاً , أدخل رقم هوية مكون من 10 ارقام !  ");
                            return Errors;
                        }
                        FIndex = n.benefitId.charAt(0);
                        if (FIndex > "2" || FIndex === "0") {
                            Errors.push("فضلاً , أدخل رقم هوية صحيح !  ");
                            return Errors;
                        }
                    }
                }
            }
            return Errors;
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.DateDiffMonth = function (startDate, rentPeriod) {
            sharedService.DateDiffMonth(startDate, rentPeriod).then(function (res) {
                if (res.success) {
                    return res.data;
                }
            });
        };


        function isNullOrWhitespace(input) {
            input = input.replace(/&nbsp;/gi, '');
            input = input.replace(/\s/g, '');
            if (input === "<p><br></p>" || input === "<p></p>") {
                return true;
            }
            return false;
        }
    }]);;
app.factory('CommitteeSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/Committees/';
    var CommitteeFactory = {};

    CommitteeFactory.GetPortalCommittees = function (vm) {
        var data = {
            url: urlBase + 'GetPortalCommittees',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommitteeFactory.FetchRequest = function (vm) {
        var data = {
            url: urlBase + 'FetchRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommitteeFactory.GetPreviousSectoralCouncils = function (vm) {
        var data = {
            url: urlBase + 'GetPreviousSectoralCouncils',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    CommitteeFactory.UpdateCommittee = function (vm) {
        var data = {
            url: urlBase + 'UpdateCommittee',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    return CommitteeFactory;
}]);


;
app.factory('CommercialPartnerSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/CommmercialPartner/';
    var CommercialPartnerFactory = {};

    CommercialPartnerFactory.GetPortalCommercialPartner = function (model) {
        var deferred = $q.defer();
        $http.post(urlBase + 'GetPortalCommercialPartner', model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetServiceConditionsAndAgreements = function (vm) {
        var data = {
            url: urlBase + 'GetServiceConditionsAndAgreements',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetSubscribtion = function (vm) {
        var data = {
            url: urlBase + 'GetSubscribtion',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddSubscribtion = function (vm) {
        var data = {
            url: urlBase + 'AddSubscribtion',   
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    
    CommercialPartnerFactory.UpdateCommercialSeen = function () {
        var data = {
            url: urlBase + 'UpdateCommercialSeen'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetInfo = function () {
        var data = {
            url: urlBase + 'GetInfo'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddComParnterMembersData = function (vm) {
        var data = {
            url: urlBase + 'AddComParnterMembersData',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddComplain = function (vm) {
        var data = {
            url: urlBase + 'AddComplain',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetComplaines = function (vm) {
        var data = {
            url: urlBase + 'GetComplaines',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return CommercialPartnerFactory;
}]);;


(function (angular) {
    function GlobalService($http, $sce, appConst) {

        this.capitalizeObject = function (model) {
            var key, keys = Object.keys(model);
            var n = keys.length;
            var newobj = {};
            while (n--) {
                key = keys[n];
                newobj[key.charAt(0).toUpperCase() + key.substr(1)] = model[key];
            }
            model = newobj;
            return model;
        };

        this.capitalizeArray = function (data) {
            var result = [];
            angular.forEach(data, function (model) {
                var key, keys = Object.keys(model);
                var n = keys.length;
                var newobj = {};
                while (n--) {
                    key = keys[n];
                    newobj[key.charAt(0).toUpperCase() + key.substr(1)] = model[key];
                }
                result.push(newobj);
            });
            return result;
        };

        this.ConvertToEnglishNumbers = function (number) {
            if (number !== undefined && number !== null) {
                var englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
                var arabicNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];

                var numberToString = number.toString();
                for (var i = 0; i < englishNumbers.length; i++) {
                    numberToString = numberToString.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
                }
                return numberToString;
            }
        };

        this.fileDownload = function (data, id) {
            var sampleArr = this.base64ToArrayBuffer(data);
            var blob = new Blob([sampleArr], { type: "application/pdf" });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = id + ".pdf";
            link.click();
        };

        this.filePreviewPDF = function (data) {
            var pdfArr = this.base64ToArrayBuffer(data);
            var blob = new Blob([pdfArr], { type: "application/pdf" });
            var fileURL = window.URL.createObjectURL(blob);

            if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
                // For Safari, create a download link
                var link = document.createElement('a');
                link.href = fileURL;
                link.download = 'file.pdf';
                link.click();
            } else {
                // For other browsers
                window.open(fileURL);
            }
        };

        this.previewPDF = function (data) {
            var file = this.base64ToBlob(data);
            var fileURL = URL.createObjectURL(file);
            return $sce.trustAsResourceUrl(fileURL);
        };

        this.base64ToArrayBuffer = function (base64) {
            try {
                base64 = base64.replace('data:image/png;base64,', '');
                var binaryString = window.atob(base64);
                var binaryLen = binaryString.length;
                var bytes = new Uint8Array(binaryLen);
                for (var i = 0; i < binaryLen; i++) {
                    var ascii = binaryString.charCodeAt(i);
                    bytes[i] = ascii;
                }
                return bytes;
            } catch (e) {
            }

        }

        this.arrayBufferToBase64 = function (buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);

        }

        this.base64ToBlob = function (base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; ++i) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return new Blob([bytes], { type: 'application/pdf' });
        };

        this.ConvertToEnglishNumbers = function (number) {
            if (number !== undefined && number !== null) {
                var englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
                var arabicNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];

                var numberToString = number.toString();
                for (var i = 0; i < englishNumbers.length; i++) {
                    numberToString = numberToString.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
                }
                return numberToString;
            }
        };

        this.Timer = function (number) {
            $scope.page.showSmsTime = true;
            $scope.page.smsTimer = 240;
            var x = setInterval(function () {
                $scope.page.smsTimer = --$scope.page.smsTimer;
                if ($scope.page.smsTimer <= 0) {
                    clearInterval(x);
                    $scope.page.showSmsTime = false;
                    $scope.page.smsTimer = 0;
                }
            }, 1000);
        };

        this.isNullOrEmpty = function (value) {
            return value === null || value === undefined || value === '' || value === 'undefined';
        }

        this.containsObject = function (obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i] === obj) {
                    return true;
                }
            }

            return false;
        }

        this.setSummerNote = function () {
            return {
                height: 300,
                focus: true,
                airMode: true,
                popover: {
                    image: [
                        ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
                        ['float', ['floatLeft', 'floatRight', 'floatNone']],
                        ['remove', ['removeMedia']]
                    ],
                    link: [
                        ['link', ['linkDialogShow', 'unlink']]
                    ],
                    table: [
                        ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
                        ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
                    ],
                    air: [
                        ['color', ['color']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['para', ['ul', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['picture']]
                    ]
                },
                toolbar: [
                    ['edit', ['undo', 'redo']],
                    ['headline', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['table', ['table']],
                    ['insert', ['picture']],
                    ['view', ['fullscreen']],
                    ['help', ['help']]
                ],
                cleaner: {
                    notTime: 2400, // Time to display Notifications.
                    action: 'both', // both|button|paste 'button' only cleans via toolbar button, 'paste' only clean when pasting content, both does both options.
                    newline: '<br>', // Summernote's default is to use '<p><br></p>'
                    notStyle: 'position:absolute;bottom:0;left:2px', // Position of Notification
                    icon: '<i class="note-icon">[Your Button]</i>'
                }
            };
        };




        this.setFroala = function () {
            return {
                placeholderText: 'أكتب النص هنا ..',
                toolbarButtons:
                    ['bold', 'italic', 'underline', 'insertTable', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'subscript', 'superscript', 'fontFamily', 'fontSize'
                        , 'formatOLSimple', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'undo', 'redo', 'fullscreen']//,
                //'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']

                ,//inlineMode: false , //pastePlain: true,
                //  useClasses: false,
                //direction: 'rtl',
                //  iframe: true,
                //  htmlUntouched: true,
                // pastePlain: false,

                language: 'ar',
                //  charCounterMax: 140,
                // charCounterCount: false,
                //  charCounterMin: 50,
                // theme: 'gray',
                // toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontFamily', 'fontSize', '|', 'inlineStyle', 'paragraphFormat', 'align', 'undo', 'redo', 'html'],

                //fontFamily: {
                //    "Roboto,sans-serif": 'Roboto',
                //    "Oswald,sans-serif": 'Oswald',
                //    "Montserrat,sans-serif": 'Montserrat',
                //    "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
                //},
                //  wordPasteModal: false,
                height: 500,
                quickInsertTags: [''],
                attribution: false,
                key: appConst.froalaActivationKey,
                // fontFamilyDefaultSelection: 'Droid Arabic Kufi',
                //  fontFamilySelection: true,
                fontSize: ['8', '10', '12', '14', '18', '30', '60', '96']//,
                // quickInsertButtons: ['image', 'table', 'ol', 'ul', 'myButton'],
                // pluginsEnabled: ['image', 'table', 'lists'],
                //events: {
                //    'froalaEditor': function () {
                //        // Use the methods like this.
                //        $scope.froalaOptions.froalaEditor.selection.get();
                //    }
                //}
            };
        };


        this.LoadPDFWithAnnotation = function (pdfString, imageSrc, loadStamp, containerId, scale = 1.3, pageImageCompression = 'MEDIUM') {
            var pdf = new PDFAnnotate(
                containerId,
                pdfString,
                {
                    ready() {
                        //if (loadStamp == true && imageSrc)
                            //pdf.addBase64ImageToCanvas(imageSrc, 300, false, false);
                    },
                    scale,
                    pageImageCompression, // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
                },
                {
                    stopContextMenu: true,
                    fireRightClick: true
                }
            );
            return pdf
        }
        this.concatApiPath = function (Api, chamberDomain) {
            if (chamberDomain && !chamberDomain.startsWith('http')) chamberDomain = 'https://' + chamberDomain  
            return (chamberDomain ? (chamberDomain + '/') : '') + Api
        }

        //this.showMore = function (page, totalCount,itemsPerPage,callback) {
        //    if (page > (Math.ceil(totalCount / itemsPerPage))) {
        //        return false;
        //    }
        //    $scope.searchModel.currentPage = page;
        //    if ($scope.pageIndex === 2) {
        //        $scope.getNonMemberRequests();
        //    } else {
        //        $scope.getDelegationRequests();
        //    }
        //    callback();
        //};

        // this.convertGregToHijri = function (date) {
        //$http.get('../NgApp/Shared/Directives/datesMap.json').then(function (data) {
        //    angular.forEach(data.data, function (value, key) {
        //        if (value.greg === date) {
        //            date = value.hij;
        //        }
        //    });
        //});
        //return date;
        //}
        this.checkFormValidityAndUpdateStatus = function (form) {
            if (form.$invalid) {
                angular.forEach(form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField?.$setTouched();
                    })
                });
                return false
            }
            return true
        }
        this.dataURLtoFile = function(base64, mime, filename) {
            var bstr = atob(base64), 
                n = bstr.length, 
                u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type:mime});
        }
    }

    // Inject dependencies
    GlobalService.$inject = ['$http', '$sce', 'appConst'];

    // Export
    angular.module('AppModule').service('globalService', GlobalService);
})(angular);




;
app.factory('CouncilSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/Request/';
    var CouncilFactory = {};
    CouncilFactory.VerifyIdentity = function (vm) {
        var data = {
            url: urlBase + 'SendRequestSMSCode'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    CouncilFactory.CheckCommitteeRequest = function (vm) {
       
        var req = {
            method: 'POST',
            url: urlBase + 'CheckCommitteeRequestPublic',
            data: vm
        };
        var deferred = $q.defer();
        $http(req).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
    CouncilFactory.Add = function (vm) {
        var req = {
            method: 'POST',
            url: urlBase + 'AddPublic',
            data: vm
        };
        var deferred = $q.defer();
        $http(req).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
    
    CouncilFactory.SendRequestSMSCode = function (vm) {
        var req = {
            method: 'POST',
            url: urlBase + 'SendRequestSMSCodePublic',
            data: vm
        };
        var deferred = $q.defer();
        $http(req).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
    CouncilFactory.ConfirmRequest = function (vm) {
        var data = {
            url: urlBase + 'ConfirmRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };
    CouncilFactory.GetMemberMasterName = function (vm) {
        var req = {
            method: 'POST',
            url: urlBase + 'GetMemberMasterNamePublic',
            data: vm
        };
        var deferred = $q.defer();
        $http(req).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
    return CouncilFactory;
}]);


;
app.factory('MeetingSvc', ['$http', '$q', 'httpRequestSvc', '$window', function ($http, $q, httpRequestSvc, $window) {
    var urlBase = '/api/Meetings/';
    var MeetingFactory = {};

    MeetingFactory.GetMeetingById = function (vm) {
        var deferred = $q.defer();
        $http.post('api/Meetings/GetMeetingById', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
    MeetingFactory.ValidateRegister = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateRegister', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.ValidateRegisterOTP = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateRegisterOTP', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    

    MeetingFactory.GetTermAttachment = function (vm) {
        var deferred = $q.defer();
        $http.post('api/Meetings/GetTermAttachment', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.ValidateVote = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateVote', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.ValidateVoteOTP = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateVoteOTP', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.GetDelegatedUsers = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'GetDelegatedUsers', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.InsertMeetingMember = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'InsertMeetingMember', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };


    MeetingFactory.InsertVote = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'InsertVote', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };



    //MeetingFactory.ValidateRegister = function (vm) {
    //    var data = {
    //        url: urlBase + 'ValidateRegister',
    //        details: vm
    //    };
    //    var deferred = $q.defer();
    //    httpRequestSvc.CheckAddAuthorize(data)
    //        .then(function (response) {
    //            console.log(response);
    //            var data = response;
    //            deferred.resolve(data);
    //        });
    //    return deferred.promise;
    //};


    MeetingFactory.ValidateAttendance = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateAttendance', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.ValidateAttendanceOTP = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ValidateAttendanceOTP', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    MeetingFactory.SendSMSCode = function (vm) {
        var data = {
            url: urlBase + 'SendSMSCode'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    MeetingFactory.ConfirmAttendance = function (vm) {
        var deferred = $q.defer();
        $http.post(urlBase + 'ConfirmAttendance', vm).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    return MeetingFactory;
}]);


;
app.factory('NotificationSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/Notifications/';
    var NotificationFactory = {};

    NotificationFactory.GetNotifications = function (vm) {
        var data = {
            url: urlBase + 'GetNotifications',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return NotificationFactory;
}]);;




app.factory('NonMembersRequestsSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/NonMembersRequests/';
    var AllRequestSvcFactory = {};

    AllRequestSvcFactory.GetMemberMasterName = function (vm) {
        var data = {
            url: urlBase + 'GetMemberMasterName',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) { 
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    AllRequestSvcFactory.AddDelegation = function (vm) {
        var data = {
            url: urlBase + 'AddDelegation',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) { 
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetNonMembersRequestsByIdentity = function (vm) {
        var data = {
            url: urlBase + 'GetNonMembersRequestsByIdentity',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetSubsciberNonMembersDelegationRequests  = function (vm) {
        var data = {
            url: urlBase + 'GetSubsciberNonMembersDelegationRequests',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };


    AllRequestSvcFactory.HandleDelegationRequest = function (vm) {
        var data = {
            url: urlBase + 'HandleDelegationRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetRequestTypeSettingById = function (vm) {
        var data = {
            url: urlBase + 'GetRequestTypeSettingById',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.InitRequest = function (vm) {
        var data = {
            url: urlBase + 'InitRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetNonMembersGeneralRequests = function (vm) {
        var data = {
            url: urlBase + 'GetNonMembersGeneralRequests',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.UpdateRequest = function (vm) {
        var data = {
            url: urlBase + 'UpdateRequest',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.RequestDetails = function (vm) {
        var data = {
            url: urlBase + 'RequestDetails',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.GetReceipt = function (vm) {
        var data = {
            url: urlBase + 'GetReceipt',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.PreviewRequestDownload = function (vm) {
        var data = {
            url: urlBase + 'PreviewRequestDownload',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    AllRequestSvcFactory.Download = function (vm) {
        var data = {
            url: urlBase + 'Download',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    /////////////////////////////////////////////////////////////////////////////////////////////
     


    return AllRequestSvcFactory;
}]);


;
app.factory('MessageSvc', ['$q', 'httpRequestSvc', '$http', function ($q, httpRequestSvc, $http) {
    var urlBase = '/api/Messages/';
    var MessagesFactory = {};

    MessagesFactory.SMSByUserName = function (vm) {
        var data = {
            url: urlBase + 'SMSByUserName',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return MessagesFactory;
}]);
;
app.factory('IntegrationSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc) {
    var urlBase = '/api/Integration/';
    var CommercialPartnerFactory = {};

    CommercialPartnerFactory.GetDetails = function () {
        var data = {
            url: urlBase + 'GetDetails'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetTakamolDetails = function (model) {
        var deferred = $q.defer();
         $http.post(urlBase + 'GetTakamolDetails', model).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };
  


    CommercialPartnerFactory.AddEdit = function (vm) {
        var data = {
            url: urlBase + 'AddEdit',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetSubscribtion = function (vm) {
        var data = {
            url: urlBase + 'GetSubscribtion',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddSubscribtion = function (vm) {
        var data = {
            url: urlBase + 'AddSubscribtion',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

  

    CommercialPartnerFactory.GetInfo = function () {
        var data = {
            url: urlBase + 'GetInfo'
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddComParnterMembersData = function (vm) {
        var data = {
            url: urlBase + 'AddComParnterMembersData',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.AddComplain = function (vm) {
        var data = {
            url: urlBase + 'AddComplain',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    CommercialPartnerFactory.GetComplaines = function (vm) {
        var data = {
            url: urlBase + 'GetComplaines',
            details: vm
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddAuthorize(data)
            .then(function (response) {
                console.log(response);
                var data = response;
                deferred.resolve(data);
            });
        return deferred.promise;
    };

    return CommercialPartnerFactory;
}]);;
app.factory('NominationCommitteesSvc', ['$http', '$q', 'httpRequestSvc', '$window', function ($http, $q, httpRequestSvc, $window) {
    var info = JSON.parse($window.localStorage.userInfo || '{}');
    var urlBase_Committee = '/api/NominationCommittees';
    var urlBase_Candidate = '/api/NominationCandidate';

    var NominationCommitteesFactory = {};
    
    NominationCommitteesFactory.viewNominationCommitteeById = function (id) {
        var data = {
            url: urlBase_Committee + '/View?Id='+id
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCommitteesFactory.GetNominationCommitteeWinners = function (id, pageIndex, pageSize) {
        var data = {
            url: urlBase_Committee + '/Winners?id=' + id + '&pageIndex=' + pageIndex + '&pageSize=' + pageSize
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCommitteesFactory.CheckNominationCandidate = function (model, token) {
        var data = {
            url: urlBase_Candidate + '/CheckNominationCandidate',
            details: model
        };
        var headers = {
            identityAuth: token
        }
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data, headers)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };

    NominationCommitteesFactory.Slogans = function () {
        var data = {
          url: `${location.origin}/Content/static/slogan.json`,
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data).then(function (response) {
          deferred.resolve(response);
        });
        return deferred.promise;
      }
    return NominationCommitteesFactory;
}]);;
app.factory('NominationCandidateSvc', ['$http', '$q', 'httpRequestSvc', function ($http, $q, httpRequestSvc  ) {
    var urlBase = '/api/NominationCandidate';
    var NominationCandidateFactory = {};
 
    NominationCandidateFactory.request = function (model) {
        var data = {
            url: urlBase + '/Request',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.validateCrActivity = function (model, token) {
        var data = {
            url: urlBase + '/ValidateCrActivity',
            details: model
        };
        var headers = {
            identityAuth: token
        }
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data, headers)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.getActiveNominationCommittees = function (availableToVote) {
        var data = {
            url: urlBase + '/GetActiveNominationCommittees?availableToVote=' + availableToVote 
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.GetMembershipsList = function (identityNumber, token) {
        var data = {
            url: urlBase + '/GetMembershipsList/' + identityNumber
        };
        var headers = {
            "identityAuth": token
        }
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data, headers)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.sendOtp = function (body) {
        var data = {
            url: urlBase + '/AbsherOTP/Send',
            details : body
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.validateOtp = function (model) {
        var data = {
            url: urlBase + '/AbsherOTP/Validate',
            details : model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.requests = function(model) {
        var data = {
            url: urlBase + '/Requests',
            details: model
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data)
            .then(function (response) {
                deferred.resolve(response);
            });
        return deferred.promise;
    };
    NominationCandidateFactory.DetailsCandidate = function (id) {
        var data = {
            url: urlBase + "/View?id=" + id,
        };
        var deferred = $q.defer();
        httpRequestSvc.CheckDetailsNoAuthorize(data).then(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    };
    NominationCandidateFactory.ForVoting = function (model, token) {
        var data = {
            url: urlBase + "/ForVoting",
            details: model
        };
        var headers = {
            identityAuth: token
        }
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data, headers).then(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    NominationCandidateFactory.AddVotes = function (model, token) {
        var data = {
            url: urlBase + "/AddVotes",
            details: model
        };
        var headers = {
            identityAuth: token
        }
        var deferred = $q.defer();
        httpRequestSvc.CheckAddOrUpdateNoAuthorize(data, headers).then(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    };

    return NominationCandidateFactory
}]);;
app.factory('NominationVoteSvc', ['$http', '$q', 'httpRequestSvc', '$window', function ($http, $q, httpRequestSvc, $window) {
    var info = JSON.parse($window.localStorage.userInfo || '{}');
    var urlBase = '/api/NominationVote';
    var NominationVoteFactory = {};
    // add your apis here
    
    return NominationVoteFactory;
}]);


;
app.factory("signalRSvc", [
  "$q",
  "$rootScope",
  "authService",
  "session",
  function ($q, $rootScope, authService, session) {
    
    var connection;
    var hubProxy;
    var signalRId = "signalRId";

    function init(hubName, listeners) {
      
      if (session.getDataFromLocalStorage(signalRId) == null) {
        session.addDataToLocalStorage(signalRId, Math.random().toString(36).substring(7));
      }
      connection = $.hubConnection();
        connection.qs = `SignalId=${session.getDataFromLocalStorage(signalRId)}`;
        window.console.log(connection.qs);
      //connection.qs = "SignalId=12345";
      connection.logging = true;
      hubProxy = connection.createHubProxy(hubName);

      if (listeners && Array.isArray(listeners)) {
        listeners.forEach((element) => {
          hubProxy.on(element.eventName, element.callbackFn);
        });
      } else {
        hubProxy.on(element.eventName, element.callbackFn);
      }
      // Register connection lifecycle events
      connection.reconnecting(function () {
        
        console.log("SignalR is reconnecting...");
      });

      connection.reconnected(function () {
        
        console.log("SignalR reconnected.");
      });

      connection.disconnected(function () {
        
        console.log("SignalR disconnected.");
        setTimeout(function () {
          startConnection();
        }, 5000);
      });
    }

    function startConnection() {
      var deferred = $q.defer();
      connection
        .start()
        .done(function () {
          console.log("SignalR connected.");
          deferred.resolve();
        })
        .fail(function (error) {
          console.log("SignalR could not connect: " + error);
          deferred.reject(error);
        });
      return deferred.promise;
    }

    function invokeServerMethod(methodName, data) {
      var deferred = $q.defer();
      hubProxy
        .invoke(methodName, data)
        .done(function (result) {
          deferred.resolve(result);
        })
        .fail(function (error) {
          deferred.reject(error);
        });
      return deferred.promise;
    }

    function stopConnection() {
      if (connection && connection.state === $.signalR.connectionState.connected) {
        connection.stop();
      }
    }

    function getHubProxy() {
      return hubProxy;
    }

    return {
      init: init,
      startConnection: startConnection,
      stopConnection: stopConnection,
      invokeServerMethod: invokeServerMethod,
    };
  },
]);
;
