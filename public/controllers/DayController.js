angular.module('devKittens')

.controller('DayController',
function ($scope, dayId, typeRef, typeId, user, dayIndex, activeLesson, infoStorage, lessonService, courseServices, cohortServices, studentServices, $location, $document) {
	$scope.user = user;
	// console.log(user)	
	if (typeRef == 'cohort') {
		$scope.lesson = activeLesson.lesson;
		$scope.day = activeLesson;
		$scope.wantsToTeach = activeLesson.wantsToTeach;
		// console.log(activeLesson);
	} else if (typeRef == 'course') {
		$scope.lesson = activeLesson;
		$scope.day = null;
	}

	$scope.topicPlaceholder = "topic goes here"

	//SECTION PERMISSIONS
	$scope.newSection = {}
	$scope.logNewSection = function(section){
		// console.log(section)
	}

	$scope.permission = function(permissionTypes, userTypes){
		for(i = 0; i < permissionTypes.length; i ++){
			if (userTypes[permissionTypes[i]]) return true;
		}
		return false;
	}

	 // types
  	$scope.types = ['mentor', 'instructor', 'student'];

  // selected edit type
	$scope.newSection.edit = ['admin', 'mentor'];
 	$scope.newSection.read = ['admin', 'mentor', 'student', 'instructor'];

  // toggle selection for a given type
  	$scope.toggleEditSelection = function toggleSelection(type, section) {
  		if (!section) {
	    	var idx = $scope.newSection.edit.indexOf(type);
	    	// is currently selected
	    	if (idx > -1) {
	    		$scope.newSection.edit.splice(idx, 1);
	    	}	
	    	// is newly selected
	    	else {
	    		$scope.newSection.edit.push(type);
	    	}
  		} else if (section) {
			var idx = section.edit.indexOf(type);
	    	// is currently selected
	   		if (idx > -1) {
	    		section.edit.splice(idx, 1);
	    	}
	    	// is newly selected
	    	else {
	    		section.edit.push(type);
	    	}
  		}
  	};
  

  // toggle selection for a given type

  $scope.toggleReadSelection = function toggleSelection(type, section) {
  	if (!section) {
  	
	    var idx = $scope.newSection.read.indexOf(type);

	    // is currently selected
	    if (idx > -1) {
	      $scope.newSection.read.splice(idx, 1);
	    }

	    // is newly selected
	    else {
	      $scope.newSection.read.push(type);
	    }
  	}
  	if (section) {
  		var idx = section.read.indexOf(type);

	    // is currently selected
	    if (idx > -1) {
	      section.read.splice(idx, 1);
	    }

	    // is newly selected
	    else {
	      section.read.push(type);
	    }
  	}
  };




	//TYPEREF REFERS TO COURSE OR COHORT
	$scope.cohortId = typeId;
	$scope.courseId = typeId;

	$scope.dayId = dayId;
	$scope.typeRef = typeRef;

	// BACK TO CALENDAR
	$scope.toCalendar = function(){
		$location.path('/' + typeRef + '/' + typeId);
	}

	// ------------ CREATING NEW LESSON -------------------------
	// ADD TITLE/TOPIC
	$scope.setTopic = function(topic){
		$scope.topic = topic;
	}


	// SECTION SPECIFIC
	$scope.sections = [];
	var top = 400;
	var duration = 1000;
	$scope.addSection = function(section){
			$scope.sections.push(section)
			$scope.newSection = {};
			$scope.newSection.edit = ['admin', 'mentor'];
	 	 	$scope.newSection.read = ['admin', 'mentor', 'student', 'instructor'];
	 	 	window.scrollTo(0, 0);
	}

	// $scope.addContent = function(i, item){
	// 	$scope.sections[i].content.push(item)
	// 	$scope.item = '';
	// 	item = ''
	// }


	// STORE LESSON
	if (typeRef == 'course') {
		$scope.createLesson = function(topic) {
			data = {
				topic: topic,
				sections: $scope.sections
			}

			lessonService.createLesson(data)
			.then(function (response){
				courseServices.updateCourseCurriculum(dayId, response.data._id, topic)
				.then(function(response){
					$location.path('/' + typeRef + '/' + typeId);
				})
				.catch(function (err) {
					console.error(err);
				});

			})
			.catch(function (err) {
				throw new Error(err);
			});
		}
	} else if (typeRef == 'cohort') {
		$scope.createLesson = function (topic) {
			var topic = topic;
			var sections = $scope.sections
			cohortServices.updateLesson($scope.cohortId, $scope.dayId, topic, sections).then(function(response){
				$location.path('/' + typeRef + '/' + typeId);
				})
				.catch(function (err) {
					console.error(err);
				});
		}
	}


	// --------------- UPDATING LESSON ------------
	if ($scope.typeRef == 'course') {

		$scope.updateLesson = function(){
			var lessonId = $scope.lesson._id;
			var topic = $scope.lesson.topic;
			var sections = $scope.lesson.sections
			lessonService.updateLesson($scope.dayId, $scope.courseId, lessonId, topic, sections)
			.then(function(response){
				$scope.lesson.edit = !$scope.lesson.edit;
			})
		}

		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		// MAJOR TODO: REPLACE EVENT FOR THE RIGHT THING//
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////


		// $scope.updateLessonSection = function(id, title, content){
		// $scope.updateLessonSection = function(section){
		// 	console.log(section);
		// 	var id = section._id
		// 	var data = {
		// 		'sections.$.title' : section.title,
		// 		'sections.$.content': section.content
		// 	}
		// 	lessonService.updateLessonSection(id, data).then(function(response){
		// 		section.editSection = !section.editSection;
		// 	})
		// }

		$scope.addLessonSection = function(section){
			var id = $scope.lesson._id;
			section.show = !section.show
			lessonService.addLessonSection(id, section).then(function(response){
				$scope.lesson.sections.push(response.data.sections[response.data.sections.length - 1]);
				section.title = '';
				section.content = '';
			})
		}

		$scope.removeLessonSection = function(index, section){
			$scope.sections = $scope.lesson.sections;
			var id = section._id;
			lessonService.removeLessonSection(id).then(function(response){
				$scope.sections.splice(index, 1);
			})
		}
	} else if ($scope.typeRef === 'cohort') {
		
		// CRUDY COHORT
		$scope.updateLesson = function(){
			var topic = $scope.lesson.topic;
			var sections = $scope.lesson.sections
			cohortServices.updateLesson($scope.cohortId, $scope.dayId, topic, sections)
			.then(function(response){
				$scope.lesson.edit = !$scope.lesson.edit;
			})
		}


		$scope.addLessonSection = function(section){
			section.show = !section.show
			cohortServices.addLessonSection($scope.cohortId, $scope.dayId, section)
			.then(function(response){				
				$scope.lesson.sections.push(response.data.lesson.sections[response.data.lesson.sections.length - 1]);

				section.title = '';
				section.content = '';
			})
		}

		$scope.removeLessonSection = function(index, section){
			$scope.sections = $scope.lesson.sections;
			var sectionId = section._id;
			cohortServices.removeLessonSection($scope.cohortId, $scope.dayId, sectionId).then(function(response){
				$scope.sections.splice(index, 1);
			})
		}
	}

	//the stuff about instructors teaching classes, etc.
	$scope.superShowThis = false;

			// check if userId is in wantsToTeach in order to show correct button
		  	$scope.findMyId = function(arr, user) {
		  		if(arr){
					for (var i = 0; i < arr.length; i++) {
						if (typeof arr[i] == 'object') {
							if (arr[i]._id == user._id) {
								return true;
							}
						} else if (typeof arr[i] == 'string') {
							if (arr[i] == user._id) {
								return true;
							}
						}
					}
					return false;
		  		}
			}


	$scope.teachRequest = function() {
		cohortServices.teachRequest(user, typeId, dayIndex)
		.then(function(response) {
			// console.log(response.curriculum[dayIndex]);
			$scope.day = response.curriculum[dayIndex];
		})
	}

	$scope.cancelRequest = function() {
		cohortServices.cancelRequest(user, typeId, dayIndex)
		.then(function(response) {
			// console.log(response.curriculum[dayIndex]);
			$scope.day = response.curriculum[dayIndex];
		})
	}

	$scope.teachLesson = function(lesson, instructor) {
		cohortServices.addInstructor(instructor, typeId, lesson, dayId, dayIndex)
		.then(function(response) {
			console.log(response);
			$scope.day.instructor = instructor;
			$scope.day.wantsToTeach.length = 0;
			// console.log(response);
		})
	}

	$scope.removeLesson = function(lesson) {
		cohortServices.removeInstructor(user, lesson, dayId)
		.then(function(response) {
			$scope.day.instructor = false;
			$scope.superShowThis = false;
		})
	}

	//marking things as donze
	$scope.markAsCompleted = function(sectionIndex, model, section) {
		if (model == true) {
			studentServices.markAsCompleted(user._id, dayIndex, sectionIndex, dayId)
			.then(function(response) {
				$scope.lesson.sections[sectionIndex].finishedStudents.push(user._id);
			})
		} else {
			studentServices.markAsIncomplete(user._id, dayIndex, sectionIndex, dayId)
			.then(function(response) {
				var index = $scope.lesson.sections[sectionIndex].finishedStudents.indexOf(user._id);
				$scope.lesson.sections[sectionIndex].finishedStudents.splice(index, 1);
			})
		}
	}

	// the creating a section part
	// $scope.showSection = function(section) {
	// 	if (!section.show) {
	// 		section.show = true;
	// 	} else {
	// 		section.show = false;
	// 	}
	// }

});