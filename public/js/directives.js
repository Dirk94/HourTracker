// This directive will 'throw' an $error.equalTo error when the value in the
// equalTo directive does not match the value of the element containing the
// directive.
app.directive("equalTo", function() {
    return {
        require: "ngModel",
        link: function(scope, elements, attributes, control) {
            scope.$watch(attributes.ngModel, function(value) {
                var value1 = scope.$eval(attributes.ngModel);
                var value2 = scope.$eval(attributes.equalTo);
                var valid = value1 == value2;

                control.$setValidity("equalTo", valid);
            });
        }
    };
});

// Denotes the last unique value asked to check.
var lastUnique = "";

// Checks if the given value is unique. Expects the following format:
// unique=({collection: value, field: value, ignoreSelf: boolean, [id: value]})
// id is only needed if ignoreSelf=true. It will then call the API
// to check if the same value in the collections field already exists.
app.directive("unique", ["$http", function($http) {
    return {
        require: "ngModel",
        link: function(scope, element, attributes, control) {
            scope.$watch(attributes.ngModel, function(value) {
                var data = scope.$eval(attributes.unique);
                var value = scope.$eval(attributes.ngModel);

                var url = "/api/unique?collection=" + data.collection + "&field=" + data.field + "&value=" + value + "&ignoreSelf=" + data.ignoreSelf;
                if (data.ignoreSelf) {
                    url += "&id=" + data.userid;
                }

                lastUnique = value;
                control.$setValidity("uniqueWaiting", false);
                $http({
                    method: "GET",
                    url: url
                }).then(function successCallback(response) {
                    if (lastUnique == value) {
                        control.$setValidity("unique", response.data.unique);
                        control.$setValidity("uniqueWaiting", true);
                    }
                }, function errorCallback(response) {
                    if (lastUnique == value) {
                        control.$setValidity("unique", true);
                        control.$setValidity("uniqueWaiting", true);
                    }
                });
            });
        }
    }
}]);

// Detects if the email address in the model is valid or not.
app.directive("validEmail", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attributes, control) {
            scope.$watch(attributes.ngModel, function(value) {
                if (value == undefined) {
                    control.$setValidity("validEmail", false);
                } else {
                    if (value.length <= 0) {
                        control.$setValidity("validEmail", false);
                    } else {
                        control.$setValidity("validEmail", true);
                    }
                }
            });
        }
    }
});
