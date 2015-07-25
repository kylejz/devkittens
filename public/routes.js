angular.module('devKittens')

.config(function ($routeProvider) {

	$routeProvider
	.when('/', {
		templateUrl: '/public/templates/home.html',
		controller: 'HomeController'
	})

	.when('/calendar/:cohortId?', {
		templateUrl: '/public/templates/calendar.html',
		controller: 'CalendarController',
		resolve: {
			specificCohortData: function(cohortServices, $route) {
				return cohortServices.getCohort($route.current.params.cohortId);
			},
			user: function($http, $location, $q){
				var dfd = $q.defer();
				$http({
					method: 'GET',
					url: '/api/auth'
				}).then(function(response){
					dfd.resolve(response.data);
				}, function(err){
					$location.path('/login')
				})
				return dfd.promise;
			}
		}
	})

	.when('/dashboard-mentors', {
		templateUrl: '/public/templates/dashboard-mentors.html',
		controller: 'MentorController',
		resolve: {
			mentorData: function(dashboardService) {
				return dashboardService.getMentorData();
				// console.log('mentorData ', mentorData);
				
			},
			optionsData: function (dashboardService) {
				return dashboardService.getOptions();
			},
			usersData: function(dashboardService, $q) {
				var dfd = $q.defer();
				dashboardService.getUsers().then(function(response) {
					dfd.resolve(response.data);
				}, function(err) {
					console.log('Houston... ', err);
				})
				return dfd.promise;
			},
			user: function($http, $location, $q){
				var dfd = $q.defer();
				$http({
					method: 'GET',
					url: '/api/auth'
				}).then(function(response){
					dfd.resolve(response.data);
				}, function(err){
					$location.path('/login')
				})
				return dfd.promise;
			}
		}
	})

	.when('/dashboard', {
		templateUrl: '/public/templates/dashboard.html',
		controller: 'DashboardController',
		resolve: {
			cohortData: function(cohortServices) {
				return cohortServices.getAllCohorts();
			},
			courseData: function(courseServices) {
				return courseServices.getAllCourses();
			},
			usersData: function(dashboardService, $q) {
				var dfd = $q.defer();
				dashboardService.getUsers().then(function(response) {
					dfd.resolve(response.data);
				}, function(err) {
					console.log('Houston... ', err);
				})
				return dfd.promise;
			},
			user: function($http, $location, $q){
				var dfd = $q.defer();
				$http({
					method: 'GET',
					url: '/api/auth'
				}).then(function(response){
					dfd.resolve(response.data);
				}, function(err){
					$location.path('/login')
				})
				return dfd.promise;
			}
		}
	})

	.when('/curriculum/:courseId?', {
		templateUrl: '/public/templates/curriculum.html',
		controller: 'CurriculumController',
		resolve: {
			courseRef: function(courseServices, $route) {
				return courseServices.getCourse($route.current.params.courseId);
			},
			user: function($http, $location, $q) {
				var dfd = $q.defer();
				$http({
					method: 'GET',
					url: '/api/auth'
				}).then(function(response){
					dfd.resolve(response.data);
				}, function(err){
					$location.path('/login')
				})
				return dfd.promise;
			}
		}
	})

	.when('/registration/:courseId', {
		templateUrl: '/public/templates/registration.html',
		controller: 'registrationController',
		resolve: {
			courseId: function ($route) {
				return $route.current.params.courseId;
			}
		}
	})

	.when('/registration', {
		templateUrl: '/public/templates/registration.html',
		controller: 'registrationController',
		resolve: {
			courseId: function() {
				return null;
			}
		}
	})

	.otherwise('/');
})