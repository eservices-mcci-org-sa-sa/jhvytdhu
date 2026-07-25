/* Minification failed. Returning unminified contents.
(1075,31-32): run-time error JS1014: Invalid character: `
(1075,38-42): run-time error JS1004: Expected ';': must
(1075,85-86): run-time error JS1004: Expected ';': !
(1075,88-89): run-time error JS1014: Invalid character: `
 */
'use strict';
app.directive('memeimage', ['authService', '$rootScope', function (authService, $rootScope) {
    return {
        restrict: 'EA',
        template: '<canvas></canvas>',
        replace: true,
        link: function (scope, el) {
            scope.upperText = "";
            scope.fontsize = 25;
            var c = el[0];
            c.height = 50;
            c.width = 250;
            var ctx = c.getContext("2d");

            scope.drawCanvas = function () {
                var number = authService.GenerateRandom();

                scope.upperText = number;
                // c.width = c.width;
                ctx.font = scope.fontsize + "px  Impact";
                ctx.fillStyle = '#265378';
                ctx.strokeStyle = 'white';
                var x = c.width / 2;
                var y = c.height / 2;
                ctx.textAlign = 'center';
                ctx.fillText(scope.upperText, x, y);
                ctx.lineWidth = 1;
                ctx.strokeText(scope.upperText, x, y);

                $rootScope.CaptchaNum = number;
            };
            scope.drawCanvas();
        }
    };
}]);


app.directive('pdfViewerr', function () {
    return {
        restrict: 'E',
        scope: {
            url: '@' // URL of the PDF document
        },
        link: function (scope, element) {
            var pdfContainer = element[0];
            var pdfUrl = scope.url;
            var stampImage = 'https://localhost:44392/Logos/identity/201.svg'; // Path to the stamp image

            var stampPosition = { x: 0, y: 0 };
            var isDragging = false;
            var dragOffset = { x: 0, y: 0 };

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var img = new Image(100, "auto");
            function drawStamp() {
                //context.clearRect(0, 0, canvas.width, canvas.height);
                
                img.src = stampImage;
                img.onload = function () {
                    context.drawImage(img, stampPosition.x, stampPosition.y);
                };
            }

            function handleMouseDown(event) {
                var rect = canvas.getBoundingClientRect();
                var offsetX = event.clientX - rect.left;
                var offsetY = event.clientY - rect.top;

                if (
                    offsetX >= stampPosition.x &&
                    offsetX <= stampPosition.x + img.width &&
                    offsetY >= stampPosition.y &&
                    offsetY <= stampPosition.y + img.height
                ) {
                    isDragging = true;
                    dragOffset.x = offsetX - stampPosition.x;
                    dragOffset.y = offsetY - stampPosition.y;
                }
                drawStamp();
            }

            function handleMouseMove(event) {
                if (isDragging) {
                    var rect = canvas.getBoundingClientRect();
                    var offsetX = event.clientX - rect.left;
                    var offsetY = event.clientY - rect.top;

                    stampPosition.x = offsetX - dragOffset.x;
                    stampPosition.y = offsetY - dragOffset.y;

                    drawStamp();
                }
            }

            function handleMouseUp(event) {
                isDragging = false;

            }

            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);

            pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
                // Rendering the first page of the PDF document
                pdf.getPage(1).then(function (page) {
                    var scale = 1.5;
                    var viewport = page.getViewport({ scale: scale });

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext).promise.then(function () {
                        pdfContainer.appendChild(canvas);
                        //drawStamp();
                    });
                });
            });
        }
    };
});
;
app.directive('formAutofillFix', ['$timeout', function ($timeout) {
    return function (scope, element, attrs) {
        element.prop('method', 'post');
        if (attrs.ngSubmit) {
            $timeout(function () {
                element
                    .unbind('submit')
                    .bind('submit', function (event) {
                        event.preventDefault();
                        element
                            .find('input, textarea, select')
                            .trigger('input')
                            .trigger('change')
                            .trigger('keydown');
                        scope.$apply(attrs.ngSubmit);
                    });
            });
        }
    };
}]);;


app.directive('confirmPwd', ['$interpolate', '$parse', function ($interpolate, $parse) {
    return {
        require: 'ngModel',
        link: function (scope, attr, ngModelCtrl) {
            if (attr.confirmPwd !== null && attr.confirmPwd !== undefined && attr.confirmPwd !== '') {
                var pwdToMatch = $parse(attr.confirmPwd);
                var pwdFn = $interpolate(attr.confirmPwd)(scope);

                scope.$watch(pwdFn, function (newVal) {
                    ngModelCtrl.$setValidity('password', ngModelCtrl.$viewValue === newVal);
                });

                ngModelCtrl.$validators.password = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    return value === pwdToMatch(scope);
                };
            } 
        }
    };
}]);


var passCompareTo = function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=passCompareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
};

app.directive("passCompareTo", passCompareTo);

;
app.directive('checkPermissions', ['authService', function (authService) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            elem.hide();
            if (attrs.permissions !== '') { 
                function CheckPrivCallbackFunction(response) {
                    if (response.data !== true) { 
                        elem.remove();
                    } else {
                        elem.show();
                    }
                }
               
                authService.CheckPriv(attrs.checkPermissions, CheckPrivCallbackFunction); 
            } else {
                elem.remove();
            }
        }
    };
}]);;
app.directive('dateControl', ['$http', '$rootScope', 'sharedService', function ($http, $rootScope, sharedService) {
    return {
        restrict: 'AEC',
        template:
            '<div  style="padding-right:0 !important;" class="col-md-12 col-xs-12 no-padding input-group date form_datetime form_datetime bs-datetime" ><div class="custom-date-input"><input type="text" name="{{name}}" placeholder="{{placeholder}}" class="{{class}} form-control WSSCalender" maxDate="maxDate" ng-disabled="isDisabled"  ng-readonly="true" ng-required="isRequired"  ng-model="mydate" maxlength="10" /></div><div ng-hide="showHidden" class="custom-date-button"><button class="WSSCalenderSwitch"  type="button" >{{title}}</button></div></div>',
        scope: {
            title: '@title',
            name: '@name',
            class: '@class',
            placeholder: '@placeholder',
            isDisabled: '=',
            isRequired: '=',
            isReadonly: '=',
            mydate: "=",
            showHidden: '=?',
            maxDate:"="
        },
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var inputElm = $(element[0].children[0].children[0].children[0]);
            var btnElm = $(element[0].children[0].children[1].children[0]);
           

            var isHijri = sharedService.CheckSystemIsHijri();
            if ($rootScope.IsHijriClass === null || $rootScope.IsHijriClass === undefined) {
                scope.title = calender === undefined ? 'هـ' : calender.IsHijriTitle;
                scope.class = calender === undefined ? 'datepickgreg' : calender.IsHijriClass;
                scope.placeholder = calender === undefined ? "يوم- شهر - سنة" : "يوم/ شهر / سنة";
                console.log(calender);
            }
            
            if (scope.title === 'م') { 
                $(function () {
                    inputElm.removeClass('datepick form-control').addClass('datepickgreg form-control');
                    inputElm.calendarsPicker({ calendar: $.calendars.instance('ummalqura'), dateFormat: 'yyyy/mm/dd', onSelect: function (date) { $(this).change(); } });
                });
            }
            else {
                $(function () {
                    inputElm.removeClass('datepickgreg form-control').addClass('datepick form-control');
                    inputElm.calendarsPicker({ calendar: $.calendars.instance('gregorian'), dateFormat: 'yyyy-mm-dd', onSelect: function (date) { $(this).change(); } });
                });
            }
            btnElm.on('click', function () {
                inputElm.calendarsPicker('destroy');
                if (scope.title === 'هـ') {
                    scope.title = 'م';
                    $(function () {
                        inputElm.removeClass('datepick form-control').addClass('datepickgreg form-control');
                        inputElm.calendarsPicker({ calendar: $.calendars.instance('ummalqura'), dateFormat: 'yyyy/mm/dd', onSelect: function (date) { $(this).change(); } });
                    });
                }
                else {
                    scope.title = 'هـ';
                    $(function () {
                        inputElm.removeClass('datepickgreg form-control').addClass('datepick form-control');
                        inputElm.calendarsPicker({ calendar: $.calendars.instance('gregorian'), dateFormat: 'yyyy-mm-dd', onSelect: function (date) { $(this).change(); } });
                    });
                }
                var ngModel = element.find('.WSSCalender').controller('ngModel');
                $http.get('../NgApp/Shared/Directives/datesMap.json').then(function (data) {
                    console.log(scope.mydate);
                    angular.forEach(data.data, function (value, key) {
                        if (inputElm.hasClass('datepick') && value.hij === ngModel.$viewValue) {
                            scope.mydate = value.greg;
                        }
                        if (inputElm.hasClass('datepickgreg') && value.greg === ngModel.$viewValue) {
                            scope.mydate = value.hij;
                        }
                    });
                });
                scope.$apply();
            });
        }
    };
}]);


app.directive('gregDate', ['$http', '$rootScope', 'sharedService', function ($http, $rootScope, sharedService) {
    return {
        restrict: 'AEC',
        template:
            '<div style="padding-right:0 !important;"class= "col-md-12 col-xs-12 no-padding input-group date form_datetime form_datetime bs-datetime" ><div class="custom-date-input"><input type="text" name="{{name}}" placeholder="{{placeholder}}" class="datepickgreg form-control WSSCalender" ng-disabled="isDisabled" ng-readonly="true" ng-required="isRequired" ng-model="mydate" maxlength="10" /></div> </div>',
        scope: {
            title: '@title',
            name: '@name',
            class: '@class',
            placeholder: '@placeholder',
            isDisabled: '=',
            isRequired: '=',
            isReadonly: '=',
            mydate: "=",
            showHidden: '=?'
        },
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var inputElm = $(element[0].children[0].children[0].children[0]); 

            var isHijri = sharedService.CheckSystemIsHijri();
            if ($rootScope.IsHijriClass === null || $rootScope.IsHijriClass === undefined) {
                scope.title = calender === undefined ? 'هـ' : calender.IsHijriTitle;
                scope.class = calender === undefined ? 'datepickgreg' : calender.IsHijriClass;
                scope.placeholder = calender === undefined ? "يوم- شهر - سنة" : "يوم/ شهر / سنة";
                console.log(calender);
            }
 


            if (scope.title === 'م') {
                $(function () {
                    inputElm.removeClass('datepick form-control').addClass('datepickgreg form-control');
                    inputElm.calendarsPicker({ calendar: $.calendars.instance('ummalqura'), dateFormat: 'yyyy/mm/dd', onSelect: function (date) { $(this).change(); } });
                });
            }
            else {
                $(function () {
                    inputElm.removeClass('datepickgreg form-control').addClass('datepick form-control');
                    inputElm.calendarsPicker({ calendar: $.calendars.instance('gregorian'), dateFormat: 'yyyy-mm-dd', onSelect: function (date) { $(this).change(); } });
                });
            }
        }
    };
}]);;

app.directive('modal',[ function () {
    return {
        template: '<div class="modal fade"  data-backdrop="static" data-keyboard="false">' +
            '<div class="modal-dialog">' +
              '<div class="modal-content">' +
                '<div class="modal-header">' +
                  '<button type="button" class="close btn btn-default red" data-dismiss="modal" >&times;</button>' +
                  '<h4 class="modal-title">{{ title }}</h4>' +
                '</div>' +
                '<div class="modal-body" ng-transclude ></div>' +
              '</div>' +
            '</div>' +
          '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function (value) {
                if (value === true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
}]);


;


app.directive('numbersOnly',[ function () {
    return {
        require: 'ngModel',
        link: function (ngModelCtrl) {
            function fromUser(text) {
                if (text) { 
                    if (text !== undefined && text !== null) {
                        var englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
                        var arabicNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];

                        for (var i = 0; i < englishNumbers.length; i++) {
                            text = text.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
                        }
                    }
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            if (ngModelCtrl.$parsers !== undefined) {
                ngModelCtrl.$parsers.push(fromUser);
            }
        }
    };
}]);

;
app.directive('onlyEnglishLettersInput',[ function onlyLettersInput() {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                var transformedInput = text.replace(/[^a-zA-Z\_\- ]/g, '');
               // var transformedInput = text.replace(/[^a-zA-Z]/g, '');

                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);

app.directive('onlyEnglishLettersNumbersInput', [function onlyLettersInput() {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                var transformedInput = text.replace(/[^a-zA-Z0-9]/g, '');
                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);

;

app.directive('onlyEnglishNumbersLettersInput',[ function onlyLettersInput() {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {

                var transformedInput = text.replace(/^[\u0621-\u064A\u0660-\u0669 ]+$/, '');
                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                var arabic = /[\u0600-\u06FF]/;
                if (arabic.test(text) === true) {
                    transformedInput = '';
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);;
(function () { 
    var onlyInt = function () { 
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                function fromUser(inputValue) {
                    var transformedInput = "";
                    var isNumber = /[^0-9]/;
                    if (isNaN(inputValue)) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    } else {
                        transformedInput = inputValue;
                    }
                    return transformedInput;
                }
                modelCtrl.$parsers.push(fromUser); 
            }
        };
    }; 
    app.directive("onlyInt", [onlyInt]);
}());


(function () {
    var onlyIntNoDot = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                function fromUser(inputValue) {
                    var transformedInput = "";
                    if (isNaN(inputValue) || inputValue.indexOf(".") >= 0) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    } else {
                        transformedInput = inputValue;
                    }
                    return transformedInput;
                }
                modelCtrl.$parsers.push(fromUser);
            }
        };
    };
    app.directive("onlyIntNoDot", [onlyIntNoDot]);
}());;
app.directive('onlyLettersInput', [function onlyLettersInput() {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                var transformedInput = text.replace(/^\d*$/g, '');
                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);
app.directive('onlyArabicLettersInput', [function onlyArabicLettersInput() {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) { 
                var transformedInput = "";
                var isArabic = /^[\u0621-\u064A\u0660-\u0669 ]+$/; 
                if (!isArabic.test(text)) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                } else {
                    transformedInput = text;
                } 
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);;
(function () {
    'use strict';
    app.directive('preventRightClick', [
        function () {
            return {
                restrict: 'A',
                link: function ($ele) {
                    $ele.bind("contextmenu", function (e) {
                        e.preventDefault();
                    });
                }
            };
        }
    ]);
})();;
! function (a) {
    "use strict";

    function b() {
        function a(a, d, e) {
            if (d.on("click",
                    function () {
                        var a = document.getElementById(e.printElementId);
                        a && c(a);
            }),
                window.matchMedia) {
                var f = window.matchMedia("print");
                f.addListener(function (a) {
                    a.matches || b();
                });
            }
            window.onafterprint = b;
        }

        function b() {
            d.innerHTML = "";
        }

        function c(a) {
            var b = a.cloneNode(!0);
            d.innerHTML = "", d.appendChild(b), window.print();
        }
        var d = document.getElementById("printSection");
        return d || (d = document.createElement("div"), d.id = "printSection",
            document.body.appendChild(d)), {
                link: a,
                restrict: "A"
            };
    } 
    app.directive('ngPrint', [b]);
}(window.angular);
;
app.directive('refresh', ['$location', '$route', function ($location, $route) {
    return {
        restrict: 'E',
        template: '<a class="btn btn-circle btn-icon-only btn-default " data-original-title="{{name}}" placeholder="{{name}}" title="{{name}}"><i class="fa fa-refresh" aria-hidden="true"></i> </a>',
        scope: {
            back: '@name',
            icons: '@icons'
        },
        link: function (scope, element, attrs) {
            $(element[0]).on('click', function () {
                $route.reload();
            });
        }
    };
}]);;
app.directive('showErrors',[ function () {
    return {
        restrict: 'A',
        require: '^form',
        link: function (scope, el, formCtrl) {
            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector("[name]");
            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box
            var inputName = inputNgEl.attr('name');

            // only apply the has-error class after the user leaves the text box
            inputNgEl.bind('blur', function () {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$watch(function () {
                return scope.showErrorsCheckValidity;
            }, function (newVal, oldVal) {
                if (!newVal) { return; }
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });
        }
    };
}]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// just put <form-errors><form-errors> wherever you want form errors
// to be displayed! (well, not WHEREVER, it has to be in a form/ngForm)
app.directive('formErrors', ['FormErrorsOptions', function (opts) {
    return {
        // only works if embedded in a form or an ngForm (that's in a form).
        // It does use its closest parent that is a form OR ngForm
        template: function (elem) {
            if (!angular.isUndefined(elem.attr('errors-tmpl'))) {
                return '<div ng-include src="\'' + elem.attr('errors-tmpl') + '\'"></div>';
            }
            return '' +
                '<ul class="form-errors">' +
                '<li class="form-error" ng-repeat="error in errors track by $index">' +
                '{{ error.message }}' +
                '</li>' +
                '</ul>';
        },
        replace: true,
        // this directive needs a higher priority than errorMessages directive
        priority: 1,
        restrict: 'AE',
        require: ['?^form', 'formErrors'],
        // isolated scope is required so we can embed ngForms and errors
        scope: { form: '=?', recurse: '=?showChildErrors' },
        // the controller doesn't need to do anything here, it just 
        // needs to exist so that other directives can do stuff with it
        controller: [function () { }],
        link: function postLink(scope, elem, attrs, ctrls) {
            var ngModelCtrl = ctrls[0];
            var formErrorsCtrl = ctrls[1];

            // if we don't provide
            if (scope.form) ngModelCtrl = scope.form;

            if (!ngModelCtrl) throw new Error('You must either specify a "form" attr or place formErrors directive inside a form/ngForm.');

            var thisCrawlErrors = angular.bind(formErrorsCtrl, crawlErrors);
            var getErrors = function () {
                scope.errors = thisCrawlErrors(ngModelCtrl, scope.recurse);
            };

            // only update the list of errors if there was actually a change in $error
            scope.$watch(function () { return ngModelCtrl.$error; }, getErrors, true);
            // or if they changed the value to show child errors for some reason
            scope.$watch('recurse', getErrors);
        }
    };

    // humanize words, turning:
    //     camelCase  --> Camel Case
    //     dash-case  --> Dash Case
    //     snake_case --> Snake Case
    function humanize(str) {
        return str
            // turn _ and - into spaces
            .replace(/[-_+]/g, ' ')
            // put a splace before every capital letter
            .replace(/([A-Z])/g, ' $1')
            // capitalize the first letter of each word
            .replace(/^([a-z])|\s+([a-z])/g,
                function ($1) { return $1.toUpperCase(); }
            );
    }

    function isController(obj) {
        // if it doesn't have a $modelValue, it's
        // an ngForm (as compared to an ngModel)
        return !obj.hasOwnProperty('$modelValue');
    }

    // this is where we form our message
    function errorMessage(name, error, props, defaultErrorMessages) {
        // get the nice name if they used the niceName
        // directive or humanize the name and call it good
        var niceName = props.$niceName || humanize(name);

        // if it doesn't have a $modelValue, it's an ngForm
        if (isController(props)) {
            error = 'form';
        }

        // get a message from our default set
        var message = defaultErrorMessages[error] || defaultErrorMessages.fallback;

        // if they used the errorMessages directive, grab that message
        if (typeof props.$errorMessages === 'object')
            message = props.$errorMessages[error];
        else if (typeof props.$errorMessages === 'string')
            message = props.$errorMessages;

        // return our nicely formatted message
        return niceName + ' ' + message;
    }

    function crawlErrors(ctrl, recurse, errors) {
        // "this" will be this directive's controller
        var errorMessages = angular.extend(opts.defaultErrorMessages, this.$errorMessages);

        recurse = !!recurse;
        if (!angular.isArray(errors)) errors = [];

        angular.forEach(ctrl, function (props, name) {
            // name has some internal properties we don't want to iterate over
            if (name[0] === '$') return;

            // if show-child-errors was true, this we
            // want to recurse through the child errors
            if (recurse && isController(props)) {
                crawlErrors(props, recurse, errors);
                // if we're recursing, we don't want to show ngForm errors
                // (cuz we're showing their children ngModel errors instead)
                return;
            }

            angular.forEach(props.$error, function (isInvalid, error) {
                // don't need to even try and get a a message unless it's invalid
                if (isInvalid) {
                    errors.push(new Error(errorMessage(name, error, props, errorMessages)));
                }
            });
        });

        return errors;
    }
}])

    // set a nice name to $niceName on the ngModel ctrl for later use
    .directive('niceName', [function () {
        return {
            require: ['?ngModel', '?form'],
            link: function (scope, elem, attrs, ctrls) {
                var ctrl = ctrls[0] || ctrls[1];

                if (ctrl) ctrl.$niceName = attrs.niceName;
            }
        };
    }])

    // ngForm version of ngModel's niceName
    .directive('formNiceName', [function () {
        return {
            require: 'form',
            link: function (scope, elem, attrs, ctrl) {
                console.warn('formNiceName is deprecated. Please use niceName instead.');
                ctrl.$niceName = attrs.formNiceName;
            }
        };
    }])

    // set an errorMessage(s) to $errorMessages on the formError or ngModel ctrl for later use
    .directive('errorMessages', [function () {
        return {
            require: ['?ngModel', '?formErrors'],
            link: function errorMessagesLink(scope, elem, attrs, ctrls) {

                var ctrl = ctrls[0] || ctrls[1];

                if (!ctrl) throw new Error('You attach errorMessages to either an ngModel or formErrors.');

                // attrs.errorMessages can be:
                //    1) "must be filled out."
                //    2) "'must be filled out.'"
                //    3) "{ required: 'must be filled out.' }"
                // 1 & 2) will be the message for any kind of error
                // 3) allows you to specify each error (it will use the
                // defaultErrorMessages if you don't specify a specific error)
                try {
                    ctrl.$errorMessages = scope.$eval(attrs.errorMessages);
                } catch (e) {
                    ctrl.$errorMessages = attrs.errorMessages;
                }

                if (ctrls[1] && ctrl.$errorMessages) {
                    if (!angular.isObject(ctrl.$errorMessages) || angular.isArray(ctrl.$errorMessages)) {
                        ctrl.$errorMessages = undefined;
                        throw new Error('errorMessages defined on a formErrors must be an object.');
                    }
                }
            }
        };
    }])

    // give us a way to override some options
    .provider('FormErrorsOptions', [function () {
        // list of some default error messages
        var options = {
            defaultErrorMessages: {
                required: 'is required.',
                minlength: 'is too short.',
                maxlength: 'is too long.',
                email: 'is not a valid email address.',
                pattern: 'does not match the expected pattern.',
                number: 'is not a number.',
                url: 'is not a valid URL.',
                form: 'has errors.',

                fallback: 'is invalid.'
            }
        };

        this.extendDefaultErrorMessages = function (messages) {
            options.defaultErrorMessages = angular.extend(options.defaultErrorMessages, messages);
        };

        this.$get = function () {
            return options;
        };
    }]);;
app.directive('siteFooter', [function () {
    return {
        restrict: 'E',
        //template: '<button class="btn">{{back}}</button><button  class="btn">{{forward}}</button>',
        template: '<button  type="button" class="sp-main-button sp-transparent-button" title="{{back}}">{{back}}  <i class="fa fa-times-circle"></i></button>',
        scope: {
            back: '@back',
            //forward: '@forward',
            icons: '@icons'
        },
        link: function (scope, element, attrs) {
            $(element[0]).on('click', function () {
                //if (scope.navigated) {
                //    history.back();
                //    scope.$apply();
                //}
                history.back();
                scope.$apply();
            });
            //$(element[1]).on('click', function () {
            //    history.forward();
            //    scope.$apply();
            //});
        }
    };
}]);;
app.directive('siteHeader',[ function () {
    return {
        restrict: 'E',
        template: '<button type="button" class="btn btn-circle btn-icon-only btn-default " title="{{back}}">  <i class="fa fa-arrow-left "></i></button>',
        scope: {
            back: '@back',
            icons: '@icons'
        },
        link: function (scope, element, attrs) {
            $(element[0]).on('click', function () {
                history.back();
                scope.$apply();
            });
        }
    };
}]);;
app.directive('staticInclude', ['$http', '$templateCache', '$compile', function ($http, $templateCache, $compile) {
    return function (scope, element, attrs) {
        var templatePath = attrs.staticInclude;
        var res = $http.get(templatePath, { cache: $templateCache });
        var d = res.then(function (response) {
            var contents = element.html(response.data).contents();
            $compile(contents)(scope);
        });
    };
}]);


 app.directive('embedSrc', function () {
     return {
         restrict: 'A',
         link: function (scope, element, attrs) {
             var current = element;
             scope.$watch(function () { return attrs.embedSrc; }, function () {
                 var clone = element
                     .clone()
                     .attr('src', attrs.embedSrc);
                 current.replaceWith(clone);
                 current = clone;
             });
         }
     }
 });
app.directive('validateEmail',[ function () {
    return {
        require: 'ngModel',
        restrict: '',
        link: function (scope, elm, attrs, ctrl) {
            // only apply the validator if ngModel is present and Angular has added the email validator
            if (ctrl && ctrl.$validators.email) {
                var EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                // this will overwrite the default Angular email validator
                ctrl.$validators.email = function (modelValue) {
                    return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                };
            };
        }
    };
}]);
;
app.directive('restrictInput',[ function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            //ctrl.$asyncValidators.checkPattern = function (modelValue, viewValue) {
            //        var value = modelValue || viewValue;
            //        if (value !== null && value !== undefined && value !== '') {
            //            return registerService.CheckEmail({ UserName: null, Email: value }).then(function (response) {
            //                if (response.data.success) {
            //                    // it says to validator that it's valid
            //                    return true;
            //                } else {
            //                    // it says to validator that it's not valid
            //                    // and also send the error message
            //                    return $q.reject('Invalid field');
            //                }
            //            }, $q.reject); // invalidate in case of any errors on your api or request 
            //        }
            //    };




            ctrl.$parsers.unshift(function (viewValue) {
                var options = scope.$eval(attr.restrictInput);
                if (!options.regex && options.type) {
                    switch (options.type) {
                        case 'digitsOnly': options.regex = '^[0-9]*$'; break;
                        case 'decimalInteger': options.regex = '^[0-9]+\.?[0-9]*$'; break;
                        case 'smsCode': options.regex = '^[0-9]{4,4}$'; break;
                        case 'identity': options.regex = '^(1|2)([0-9]{9})$'; break;
                        case 'oneDigit': options.regex = '^([0-9]{1})$'; break;
                        case 'phone': options.regex = '^(05)([0-9]{8})$'; break;
                        case 'phone2': options.regex = '^(01)([0-9]{8})$'; break;
                        case 'email': options.regex = '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'; break;
                        case 'saudiIdentity': options.regex = '^((?!(0|2|3|4|5|6|7|8|9))[0-9]{10})$'; break;
                        case 'fax': options.regex = '^[a-zA-Z0-9]+$'; break;
                        case 'lettersOnly': options.regex = '^[a-zA-Z]*$'; break;
                        case 'lowercaseLettersOnly': options.regex = '^[a-z]*$'; break;
                        case 'uppercaseLettersOnly': options.regex = '^[A-Z]*$'; break;
                        case 'lettersAndDigitsOnly': options.regex = '^[a-zA-Z0-9]*$'; break;
                        case 'validPhoneCharsOnly': options.regex = '^[0-9 ()/-]*$'; break;
                        case 'onlyEnglishLettersInput': options.regex = '^[^a-zA-Z]g*$'; break;
                        case 'password': options.regex = '^(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,30})$'; break;
                        default: options.regex = '';
                    }
                }
                var reg = new RegExp(options.regex);
                if (reg.test(viewValue)) { //if valid view value, return it
                    return viewValue;
                } else { //if not valid view value, use the model value (or empty string if that's also invalid)
                    var overrideValue = '';
                        //(reg.test(ctrl.$modelValue) ? ctrl.$modelValue : '');
                    element.val(overrideValue);

                    //// find the text box element, which has the 'name' attribute
                    //var inputEl = element[0].querySelector("[name]");
                    //// convert the native text box element to an angular element
                    //var inputNgEl = angular.element(inputEl);
                    //// get the name on the text box
                    //var inputName = inputNgEl.attr('name');

                    //// only apply the has-error class after the user leaves the text box
                    //inputNgEl.bind('blur', function () {
                    //    element.toggleClass('has-error', formCtrl[inputName].$invalid);
                    //});

                    //scope.$watch(function () {
                    //    return scope.showErrorsCheckValidity;
                    //}, function (newVal, oldVal) {
                    //    if (!newVal) { return; }
                    //        element.toggleClass('has-error', formCtrl[inputName].$invalid);
                    //});

                    return overrideValue;
                }
            });
        }
    };
}]);

//app.directive("streamingLogo", ['imageConstant', function (imageConstant) {
//    var linker = function (scope, element, attrs) {

//        scope.logoPath = imageConstant.logoPath;
//        scope.favIconPath = imageConstant.faviconPath;
//        scope.layoutPath = imageConstant.layoutPath;
//        scope.logoFileName = imageConstant.logoFileName;

//    };
//    return {
//        restrict: "A",
//        link: linker
//    };
//}]);

app.directive("movePrevious", function () {
    return {
        restrict: "A", 
        link: function ($scope, element) {
            element.on("input", function (e) {
               // if (element.val().length == element.attr("maxlength")) {
                    //var $nextElement = element.next();
                    //if ($nextElement.length) {
                    //    $nextElement[$scope.myId + 1].focus();
                    //}
              //  }

                var $previousElement = element.prev();
                if ($previousElement.length) {
                    $previousElement[0].focus();
                }

            });
        }
    }
});

app.directive("smsInput", function () {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            function checkForErrors(input) {
                var errors = "";
                if (!new RegExp(input.attr("pattern")).test(input.val())) {
                    errors += `Field must contain ${input.attr("maxlength")} numbers!\n`
                }
                return errors;
            }
            element.on("input", "input", function () {
                var trigger = $(this);
                if (trigger.val().length >= trigger.attr("maxlength")) {
                    trigger.blur().next().focus();
                }
            });

            element.on("blur", "input", function () {
                var trigger = $(this);
                var errors = checkForErrors(trigger);
                trigger.attr("title", errors);
                if (trigger.val().trim() === "") {
                    trigger.addClass("invalid-field");
                    trigger.attr("title", "Field cannot be empty!");
                }
                else if (errors === "") {
                    trigger.removeClass("invalid-field");
                }
                else {
                    trigger.addClass("invalid-field");
                    trigger.focus();
                }
            });
        }
    }
});
app.directive('checkPasswordPattern', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            ngModelCtrl.$asyncValidators
                .checkPasswordPattern = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    if (value !== null && value !== undefined && value !== '') {

                        var reg = new RegExp('^(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,30})$');
                        if (reg.test(viewValue)) {
                            return $q.resolve(true);
                        }
                        return $q.reject('Invalid field');
                    }
                };
        }
    };
}]);

app.directive("limitToMax",[ function () {
    return {
        link: function (scope, element, attributes) {
            element.on("keydown keyup", function (e) {
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode !== 46 // delete
                    &&
                    e.keyCode !== 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(attributes.max);
                }
            });
        }
    };
}]);

app.directive("preventTypingGreater",[ function () {
    return {
        link: function (scope, element, attributes) {
            var oldVal = null;
            element.on("keydown keyup", function (e) {
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode !== 46 // delete
                    &&
                    e.keyCode !== 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(oldVal);
                } else {
                    oldVal = Number(element.val());
                }
            });
        }
    };
}]);;
app.directive("compareTo",[ function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
}]); 


app.directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        scope: { 
            reference: '=validPasswordC'
        },
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {

                var noMatch = viewValue !== scope.reference
                ctrl.$setValidity('noMatch', !noMatch);
                return (noMatch) ? noMatch : !noMatch;
            });

            scope.$watch("reference", function (value) {
                ;
                ctrl.$setValidity('noMatch', value === ctrl.$viewValue);

            });
        }
    }
});;

app.directive("chamberData", ['authService', '$rootScope', '$timeout', function (authService, $rootScope, $timeout) {
    return {
        restrict: "E",
        scope: {
            text: "@"
        },
        replace: true,
        transclude: true,
        template: '<div ng-bind-html="logo"></div>',
        link: function (scope) {

            function fnCallback(response) {
                //$rootScope.ChamberIdLogo = response.data.data.shortName;
                //$rootScope.chamberInfo = response.data.data;

                //$rootScope.checkMemberSignature = response.data.data.checkMemberSignature;
                //$rootScope.RegisterByPhoneNumber = response.data.data.registerByPhoneNumber;
                //if ($rootScope.RegisterByPhoneNumber === true) {
                //    $scope.isChamber = false;
                //}
                //else if ($rootScope.RegisterByPhoneNumber === false) {
                //    $scope.isChamber = true;
                //}
                // $rootScope.ChamberShort = response.data.data.shortName;

                $timeout(function () {
                    scope.$apply(function () {
                        scope.logo = '<img src="/Logos/' + $rootScope.chamberSettings.id + '.png">';
                    });
                }, 100);

            }
            if ($rootScope.chamberSettings !== '' && $rootScope.chamberSettings !== undefined && $rootScope.chamberSettings !== null && $rootScope.chamberSettings !== {}) {
                fnCallback(null);
            } else {
                authService.GetConfig(fnCallback);
            }


        }
    };
}]);



app.directive('userInfo', ['session', '$timeout', function (session, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            elem.hide();
            var permissions = attrs.userInfo.split(",");
            for (var i = 0; i < permissions.length; i++) {
                permissions[i] = permissions[i].trim();
            }
            var userInfo = JSON.parse(session.getUserInfo());
           
            let show = false;
            angular.forEach(permissions, function (value) {
                if (value.includes('!')) {
                    if (userInfo[value.substr(1)] === true || userInfo.globalSessionValues[value.substr(1)] === true) {
                        show = false;
                    } else {
                        show = true;
                    }
                } 
                else {
                    if (userInfo[value] === true) {
                        show = true;
                    }
                    else if (userInfo.globalSessionValues[value] === true) {
                        show = true;
                    }
                    else {
                        show = false;
                    }
                }
            });

            $timeout(function () {
                scope.$apply(function () {
                    if (show) {
                        elem.show();
                    } else {
                        elem.remove();
                    }
                });
            });
            




            //if (attrs.portalAccess !== '') {
            //    var userInfo = JSON.parse(session.getUserInfo());
            //    if (userInfo.hasOwnProperty(attrs.portalAccess)) {
            //        elem.show();
            //    }
            //    else if (userInfo.globalSessionValues.hasOwnProperty(attrs.portalAccess)) {
            //        elem.show();
            //    }
            //    else {
            //        elem.remove();
            //    }
            //} else {
            //    elem.remove();
            //}
        }
    };
}]);


app.directive("ngFileSelect", function () {
    return {
        link: function ($scope, el) {
            el.bind("change", function (e) {
                $scope.file = (e.srcElement || e.target).files[0];
                $scope.getFile();
            })
        }
    }
});
app.directive('checkIdentityExist', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr,ngModelCtrl) {
            ngModelCtrl.$asyncValidators
                .checkIdentityExist = function (modelValue, viewValue) {
                    var value = modelValue || viewValue; 
                    return registerService.CheckIdentity({ IdentityNumber: value }).then(function (response) {
                        if (response.data.success) {
                            // it says to validator that it's valid
                            return true;
                        } else {
                            // it says to validator that it's not valid
                            // and also send the error message
                            return $q.reject('Invalid field');
                        }
                    }, $q.reject); // invalidate in case of any errors on your api or request 
                };
        }
    };
}]);

app.directive('checkIdentityExistWithAuth', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            ngModelCtrl.$asyncValidators
                .checkIdentityExistWithAuth = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    //, CurrentMemberId: scope.user.CurrentMemberId
                    return registerService.CheckIdentityWithAuth({ IdentityNumber: value, UserName: scope.userId }).then(function (response) {
                        if (response.success) {
                            // it says to validator that it's valid
                            return true;
                        } else {
                            // it says to validator that it's not valid
                            // and also send the error message
                            return $q.reject('Invalid field');
                        }
                    }, $q.reject); // invalidate in case of any errors on your api or request 
                };
        }
    };
}]);


//app.directive('checkIdentityPattern', ['$q', function ($q) {
//    return {
//        restrict: 'A',
//        require: 'ngModel',
//        link: function (scope, element, attr, ngModelCtrl) {
//            ngModelCtrl.$asyncValidators
//                .checkIdentityPattern = function (modelValue, viewValue) {
//                    var value = modelValue || viewValue;
//                   
//                    //return registerService.CheckIdentity({ IdentityNumber: value }).then(function (response) {
//                    //    if (response.data.success) {
//                    //        // it says to validator that it's valid
//                    //        return true;
//                    //    } else {
//                    //        // it says to validator that it's not valid
//                    //        // and also send the error message
//                    //        return $q.reject('Invalid field');
//                    //    }
//                    //}, $q.reject); // invalidate in case of any errors on your api or request 
//                    if (value === undefined) return $q.reject('Invalid field');
//                    var transformedInput = value.replace(/^(1|2)([0-9]{9})$/g, '');
//                    if (transformedInput !== value) {
//                        return $q.reject('Invalid field');
//                    }
//                    return $q.resolve();
//                };
//        }
//    };
//}]);;
app.directive('checkEmailExist', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            ngModelCtrl.$asyncValidators
                .checkUserEmailExist = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    if (value !== null && value !== undefined && value !== '') {
                        return registerService.CheckEmail({ UserName: null, Email: value }).then(function (response) {
                            if (response.data.success) {
                                // it says to validator that it's valid
                                return true;
                            } else {
                                // it says to validator that it's not valid
                                // and also send the error message
                                return $q.reject('Invalid field');
                            }
                        }, $q.reject); // invalidate in case of any errors on your api or request 
                    }
                };
        }
    };
}]);
app.directive('checkEmailExistWithAuth', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            ngModelCtrl.$asyncValidators
                .checkUserEmailExistWithAuth = function (modelValue, viewValue) { 
                    var value = modelValue || viewValue;
                    if (value !== null && value !== undefined && value !== '') {
                        return registerService.CheckEmailWithAuth({ UserName: scope.userId, Email: value, IsAdd: scope.IsAdd }).then(function (response) {
                            if (response.success) {
                                // it says to validator that it's valid
                                return true;
                            } else {
                                // it says to validator that it's not valid
                                // and also send the error message
                                return $q.reject('Invalid field');
                            }
                        }, $q.reject); // invalidate in case of any errors on your api or request 
                    }
                };
        }
    };
}]);



;
app.directive('checkNameExist', ['$q', 'registerService', function ($q, registerService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr,ngModelCtrl) {
            ngModelCtrl.$asyncValidators.checkUserNameExist = function (modelValue, viewValue) {
                    var value = modelValue || viewValue; 
                    var UserInfo = { UserName: value, Email: null };
                    if (value !== null && value !== undefined && value !== '') {
                        return registerService.CheckUserName(UserInfo).then(function (response) {
                            if (response.data.success || response.success) {
                                // it says to validator that it's valid
                                return true;
                            } else {
                                // it says to validator that it's not valid
                                // and also send the error message
                                return $q.reject('Invalid field');
                            }
                        }, $q.reject); // invalidate in case of any errors on your api or request 
                    } 
                };
        }
    };
}]);;
//(function () {
    app.directive('countdown', [
        'Util',
        '$interval',
        function (Util, $interval) {
            return {
                restrict: 'A',
                scope: { seconds    : '@' },
                link: function (scope, element) {
                    var current = new Date();
                    var future;
                    future = new Date(current.setSeconds(current.getSeconds() + scope.seconds));
                    //var x = setInterval(function () {
                    //   // $scope.page.smsTimer = --$scope.page.smsTimer;
                    //   // if ($scope.page.smsTimer <= 0) {
                    //        clearInterval(x);
                    //        //$scope.page.showSmsTime = false;
                    //        //$scope.page.smsTimer = 0;
                    //    //}
                    //    var diff;
                    //    diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                    //    return element.text(Util.dhms(diff));
                    //}, 1000);
                    $interval(function () {
                        var diff;
                        diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                        return element.text(Util.dhms(diff));
                    }, 1000);
                }
            };
        }
    ]).factory('Util', [function () {
        return {
            dhms: function (t) {
                var days, hours, minutes, seconds;
                days = Math.floor(t / 86400);
                t -= days * 86400;
                hours = Math.floor(t / 3600) % 24;
                t -= hours * 3600;
                minutes = Math.floor(t / 60) % 60;
                t -= minutes * 60;
                seconds = t % 60;
                return [
                    //days + 'd',
                    //hours + 'h',
                    //minutes + 'm',
                    seconds + 'ثانية '
                ].join(' ');
            }
        };
    }]);
//}.call(this));;
app.directive('realTimeCurrency', function ($filter, $locale) {
    var decimalSep = $locale.NUMBER_FORMATS.DECIMAL_SEP;
    var toNumberRegex = new RegExp('[^0-9\\' + decimalSep + ']', 'g');
    var trailingZerosRegex = new RegExp('\\' + decimalSep + '0');
    var filterFunc = function (value) {
        return $filter('currency')(value, '', 0);
    };

    function getCaretPosition(input) {
        if (!input) return 0;
        if (input.selectionStart !== undefined) {
            return input.selectionStart;
        } else if (document.selection) {
            // Curse you IE
            input.focus();
            var selection = document.selection.createRange();
            selection.moveStart('character', input.value ? -input.value.length : 0);
            return selection.text.length;
        }
        return 0;
    }

    function setCaretPosition(input, pos) {
        if (!input) return 0;
        if (input.offsetWidth === 0 || input.offsetHeight === 0) {
            return; // Input's hidden
        }
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(pos, pos);
        }
        else if (input.createTextRange) {
            // Curse you IE
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    function toNumber(currencyStr) {
        return parseFloat(currencyStr.replace(toNumberRegex, ''), 10);
    }

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, elem, attrs, modelCtrl) {
            modelCtrl.$formatters.push(filterFunc);
            modelCtrl.$parsers.push(function (newViewValue) {
                var oldModelValue = modelCtrl.$modelValue;
                var newModelValue = toNumber(newViewValue);
                modelCtrl.$viewValue = filterFunc(newModelValue);
                var pos = getCaretPosition(elem[0]);
                elem.val(modelCtrl.$viewValue);
                var newPos = pos + modelCtrl.$viewValue.length -
                    newViewValue.length;
                if ((oldModelValue === undefined) || isNaN(oldModelValue)) {
                    newPos -= 3;
                }
                setCaretPosition(elem[0], newPos);
                return newModelValue;
            });
        }
    };
});;
app.directive('lowerThan', [
    function () {

        var link = function ($scope, $element, $attrs, ctrl) {

            var validate = function (viewValue) {
                var comparisonModel = $attrs.lowerThan;
                var t, f;

                if (!viewValue || !comparisonModel) {
                    // It's valid because we have nothing to compare against
                    ctrl.$setValidity('lowerThan', true);
                }
                if (comparisonModel) {
                    var to = comparisonModel.split("-");
                    t = new Date(to[2], to[1] - 1, to[0]);
                }
                if (viewValue) {
                    var from = viewValue.split("-");
                    f = new Date(from[2], from[1] - 1, from[0]);
                }

                $attrs.$observe($attrs.name, function (value) {
                    var startdate = Date.parse(value);
                    var enddate = Date.parse(ngModel.$viewValue);

                    // use $setValidity method to determine the validation result 
                    // the first parameter is the validation name, this name is the same in ng-message template as well
                    // the second parameter sets the validity (true or false), we can pass a function returning a boolean
                    ctrl.$setValidity('lowerThan', Date.parse(t) > Date.parse(f));
                });


                //  ctrl.$setValidity('lowerThan', Date.parse(t) > Date.parse(f));
                // It's valid if model is lower than the model we're comparing against

                return viewValue;
            };

            ctrl.$parsers.unshift(validate);
            //ctrl.$formatters.push(validate);

        };

        return {
            require: 'ngModel',
            link: link
        };

    }
]);;
app.directive('higherThan', [
    function () {

        var link = function ($scope, $element, $attrs, ctrl) {

            var validate = function (viewValue) {
                var comparisonModel = $attrs.higherThan;
                var t, f;

                if (!viewValue || !comparisonModel) {
                    // It's valid because we have nothing to compare against
                    ctrl.$setValidity('higherThan', true);
                }
                if (comparisonModel) {
                    var to = comparisonModel.split("-");
                    t = new Date(to[2], to[1] - 1, to[0]);
                }
                if (viewValue) {
                    var from = viewValue.split("-");
                    f = new Date(from[2], from[1] - 1, from[0]);
                }

                $attrs.$observe($attrs.name, function (value) {
                    // use $setValidity method to determine the validation result 
                    // the first parameter is the validation name, this name is the same in ng-message template as well
                    // the second parameter sets the validity (true or false), we can pass a function returning a boolean
                    ctrl.$setValidity('higherThan', Date.parse(t) < Date.parse(f));
                });

                // It's valid if model is higher than the model we're comparing against

                return viewValue;
            };

            ctrl.$parsers.unshift(validate);
            //ctrl.$formatters.push(validate);

        };

        return {
            require: 'ngModel',
            link: link
        };

    }
]);;
app.directive("maskedInput", [function () {
    return {
        restrict: 'EA',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            console.log("In link function");

            var addSpaces = function (value) {
                if (typeof (value) === typeof (undefined))
                    return value;
                var parsedValue = value.toString()
                    .replace(/[^\dA-Za-z]/g, '')
                    .replace(/(.{4})/g, '$1-').trim()
                    .toUpperCase()
                    .replace(/-$/, '');
                return parsedValue;
            };

            var removeSpaces = function (value) {
                if (typeof (value) === typeof (undefined))
                    return value;
                var parsedValue = value.toString().replace(/\s/g, '').replace(/-/g, '');
                return parsedValue;
            };

            var parseViewValue = function (value) {
                var viewValue = addSpaces(value);
                ngModel.$viewValue = viewValue;
                ngModel.$render();

                // Return what we want the model value to be
                return removeSpaces(viewValue);
            };

            var formatModelValue = function (value) {
                var modelValue = removeSpaces(value);
                ngModel.$modelValue = modelValue;
                return addSpaces(modelValue);
            };

            ngModel.$parsers.push(parseViewValue);
            ngModel.$formatters.push(formatModelValue);
        }
    };
}]);;
app.directive('validFile', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
            //change event is fired when file is selected
            el.bind('change', function () {
                scope.$apply(function () {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
});;
app.directive('confirmOnExit',[ function () {
    return {
        link: function ($scope, elem, attrs) {
          
            var form = $scope[attrs.name];

            // condition when back page is pressed 
            window.onbeforeunload = function () {
                if (form.$dirty) {
                    return "The formI is dirty, do you want to stay on the page?";
                }
            };
            // condition when user try to load other form (via icons )
            $scope.$on('$stateChangeStart', function (event, next, current) {
                if (window.location.href.indexOf("Register") <= -1) {
                    return true;
                }
                if (form.$dirty) {
                    if (!confirm("myForm. Do you want to continue ?")) {
                        event.preventDefault();
                    }
                }
            });
        }
    };
}]);

;

// scroll over Ui Only 
app.directive('infiniteScroll', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('scroll', function () {
                // Check if the element is scrolled to the bottom
                if (element[0].scrollTop + element[0].clientHeight >= element[0].scrollHeight - 10) {
                    scope.$apply(attrs.infiniteScroll); // Call the load function
                }
            });
        }
    };
});
;
