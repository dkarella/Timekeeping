﻿(function(){
    'use strict';

    angular.module('app').controller('overviewController', ['$scope', '$location', '$routeParams', 'DataLoader', function ($scope, $location, $routeParams,  DataLoader) {
        var year = parseInt($routeParams.year);
        $scope.selectedYear =  parseInt(year); // model for select year dropdown

        // load data if needed
        DataLoader.load(year, function(err){
            if(err) console.log(err);
            else{
                // check if user entered a valid year, if not then redirect them to the latest year they worked
                if(!year || year < $scope.employee.earliestYearWorked || year > $scope.employee.latestYearWorked){
                    $location.url('/history/'+$scope.employee.latestYearWorked);
                }

                // genearate total hours
                if($scope.timesheets.length > 0){
                    $scope.total_hours = generateTotalHours($scope.timesheets);
                }else{
                    $scope.total_hours = ['0.0', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'];
                }

                // load years for dropdown box, currently only allows user to choose years
                // between the year that they first worked and last worked
                $scope.years = [];
                var i = $scope.employee.latestYearWorked;
                while(i >= $scope.employee.earliestYearWorked){
                    $scope.years.push(i);
                    i--;
                }
            }
        });


        //Get Timesheet Detail
        $scope.getPeriodDetail = function (timesheet_index) {
            $location.path('/details/' + year + '/' +  timesheet_index.toString());
        };

        // Is called when user selects a new year in the select year dropdown
        $scope.onChange = function(){
            $location.url('/history/' + $scope.selectedYear);
        };

        // returns an array of all of the total hours per type and grand total
        function generateTotalHours(timesheets){
            // calculate total hours by type for the year
            var totals =  timesheets
                            // map each timesheet to an array of their hour types
                            .map(function(ts){
                                return  [
                                            ts.hourTypeTotals['Regular'],
                                            ts.hourTypeTotals['Overtime'],
                                            ts.hourTypeTotals['Double Time'],
                                            ts.hourTypeTotals['Vacation'],
                                            ts.hourTypeTotals['Sick'],
                                            ts.hourTypeTotals['Other Paid'],
                                            ts.hourTypeTotals['Other Unpaid']
                                        ];
                            })
                            // combine all hours of the same type into one index of an array
                            .reduce(function(prev, curr){
                                return prev.map(function(val, i){
                                    return val + curr[i];
                                })
                            });

            // add on grand total hours for the year
            totals.push(
                timesheets
                    // map each timesheet to the sum of the grandtotals of both of its weeks
                    .map(function(ts){
                        return ts.week[0].grandTotal.total + ts.week[1].grandTotal.total;
                    })
                    // add all of the grand totals together
                    .reduce(function(prev, curr){
                        return prev+curr;
                    })
            );
            return totals;
        }
    }]);
})();
