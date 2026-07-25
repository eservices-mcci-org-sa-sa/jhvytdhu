/* Minification failed. Returning unminified contents.
(286,39-40): run-time error JS1100: Expected ',': =
(287,34-35): run-time error JS1195: Expected expression: .
(288,5-6): run-time error JS1002: Syntax error: }
(291,37-38): run-time error JS1195: Expected expression: )
(291,39-40): run-time error JS1004: Expected ';': {
(308,2-3): run-time error JS1195: Expected expression: )
(309,44-45): run-time error JS1195: Expected expression: )
(309,46-47): run-time error JS1004: Expected ';': {
(311,55-56): run-time error JS1195: Expected expression: >
(311,75-76): run-time error JS1004: Expected ';': )
(313,2-3): run-time error JS1195: Expected expression: )
(310,5-36): run-time error JS1018: 'return' statement outside of function: return function (selectedItems)
(292,5,307,6): run-time error JS1018: 'return' statement outside of function: return function (status, nominationStatus) {
        switch (status) {
            case nominationStatus.Accepted:
                return "RequestAccept";
            case nominationStatus.Rejected:
                return "RequestRefused";
            case nominationStatus.Pending:
                return "RequestPending";
            case nominationStatus.AcceptedAfterGrievance:
                return "RequestAccept";
            case nominationStatus.Winner:
                return "RequestAccept";
            default:
                return "";
        }
    }
 */
app.filter('ngArabicNumber',[ function () {
    return function (number, isArabic) {
        if (number !== undefined && number !== null) {
            var englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
            var arabicNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];

            var numberToString = number.toString();

            if (isArabic) {
                for (var i = 0; i < englishNumbers.length; i++) {
                    numberToString = numberToString.replace(new RegExp(englishNumbers[i], 'g'), arabicNumbers[i]);
                }
            } else {
                return number;
            }

            return numberToString;
        }
    };
}]);;
app.filter('cutMobile',[ function () {
    return function (value) {
        if (!value) return '';
        value = 'xxxxxx' + value.substring(length);
        return value + (tail || ' …'); 
    };
}]);
;

app.filter('cut', [function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
}]);

app.filter('cutWords', [function () {
    return function (value, number, tail) {
        if (!value) return '';

        //max = parseInt(max, 10);
        //if (!max) return value;
        //if (value.length <= max) return value;

        //value = value.substr(0, max);
        //if (wordwise) {
        //    var lastspace = value.lastIndexOf(' ');
        //    if (lastspace !== -1) {
        //        if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
        //            lastspace = lastspace - 1;
        //        }
        //        value = value.substr(0, lastspace);
        //    }
        //}


        data = value.split(' ');
        returnedValue = '';
        if (number > 0) {

            angular.forEach(data, function (val, key) {
                if ((key + 1) <= number) {
                    returnedValue += ' ' + data[key];
                    if ((key + 1) == number) {
                        returnedValue = returnedValue + ' ' + tail
                    }
                } else {
                    returnedValue;
                }
            });
        }
        return returnedValue;
    };
}]);

;
(function () {
    "use strict";

    app.filter('cmdate', ['$filter', function ($filter) {
        return function (input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
    ]);
})();;
app.filter('groupBy', ['$parse', function ($parse) {
    return function (list, group_by) {

        var filtered = [];
        var prev_item = null;
        var group_changed = false;
        // this is a new field which is added to each item where we append "_CHANGED"
        // to indicate a field change in the list
        //was var new_field = group_by + '_CHANGED'; - JB 12/17/2013
        var new_field = 'group_by_CHANGED';

        // loop through each item in the list
        angular.forEach(list, function (item) {

            group_changed = false;

            // if not the first item
            if (prev_item !== null) {

                // check if any of the group by field changed

                //force group_by into Array
                group_by = angular.isArray(group_by) ? group_by : [group_by];

                //check each group by parameter
                for (var i = 0, len = group_by.length; i < len; i++) {
                    if ($parse(group_by[i])(prev_item) !== $parse(group_by[i])(item)) {
                        group_changed = true;
                    }
                }


            }// otherwise we have the first item in the list which is new
            else {
                group_changed = true;
            }

            // if the group changed, then add a new field to the item
            // to indicate this
            if (group_changed) {
                item[new_field] = true;
            } else {
                item[new_field] = false;
            }

            filtered.push(item);
            prev_item = item;

        });

        return filtered;
    };
}]);;
app.filter('highlight', [function ($sce) {
    return function (text, phrase) {
        if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
            '<span class="highlighted">$1</span>');
        return $sce.trustAsHtml(text);
    };
}]);

app.filter('counter', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
app.filter('propsFilter',[ function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            try {
                if (items.length > 0) {
                    var keys = Object.keys(props);
                    items.forEach(function (item) {
                        var itemMatches = false;

                        for (var i = 0; i < keys.length; i++) {
                            var prop = keys[i];
                            var text = props[prop].toLowerCase();
                            if (item[prop] !== null && item[prop] !== '') {
                                if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                                    itemMatches = true;
                                    break;
                                }
                            }

                        }

                        if (itemMatches) {
                            out.push(item);
                        }
                    });
                }
            } catch (e) {
                console.log('ssss');
            }

        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
}]);;
app.filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);
;
app.filter('formatPhone', [function () {
    return function (number,isArabic) {
        if (number !== undefined && number !== null) { 
                var numberToString = number.toString();
                if(numberToString.length < 10) 
                {
                    if(numberToString.startsWith("0") && numberToString.charAt(1)  != 5 ){
                        numberToString="05"+numberToString.substring(1) ;
                    }
                    else if(numberToString.charAt(1)  === 5){
                        numberToString="0"+numberToString;
                    } 
                }

                var englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
                var arabicNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];
 

                if (isArabic) {
                for (var i = 0; i < englishNumbers.length; i++) {
                    numberToString = numberToString.replace(new RegExp(englishNumbers[i], 'g'), arabicNumbers[i]);
                }
                } else {
                  return number;
                }
            
            return numberToString;
        }
    };
}]);;
app.filter("unique", function () {
    // we will return a function which will take in a collection
    // and a keyname
    return function (collection, keyname) {
        // we define our output and keys array;
        var output = [],
            keys = [];

        // we utilize angular's foreach function
        // this takes in our original collection and an iterator function
        angular.forEach(collection, function (item) {
            // we check to see whether our object exists
            var key = item[keyname];
            // if it's not already part of our keys array
            if (keys.indexOf(key) === -1) {
                // add it to our keys array
                keys.push(key);
                // push this item to our final output array
                output.push(item);
            }
        });
        // return our array which should be devoid of
        // any duplicates
        return output;
    };
});;
app.filter('emptyString', [
    function () {
        return function (input) {
            var ret = '';
            if (input === null || input === undefined || input === '') {
                ret = '..............';
            } else {
                ret = input;
            }

            return ret;
        };
    }]);;
app.filter('parseStrToArr', [function () {
    return function (input, seperator = ' - ') {
        return JSON.parse(input)?.join(seperator);
    };
}]);
;
app.filter('statusClass', function () {
    return function (status, nominationStatus) {
        switch (status) {
            case nominationStatus.Accepted:
                return "RequestAccept";
            case nominationStatus.Rejected:
                return "RequestRefused";
            case nominationStatus.Pending:
                return "RequestPending";
            case nominationStatus.AcceptedAfterGrievance:
                return "RequestAccept";
            case nominationStatus.Winner:
                return "RequestAccept";
            default:
                return "";
        }
    };
});;
app.filter('selectionVoteCount', function () {
    return function (selectedItems) {
      return Object.keys(selectedItems).filter((key) => selectedItems[key]).length
    };
});;
