var Lesson = require('../models/LessonModel.js'),
	Course = require('../models/CourseModel.js');

exports.createNewCourse = function(req, res) {
	var daysArray = [];
	for (var i = 1; i <= req.body.courseLength; i++) {
		daysArray.push({day: i});
	}
	new Course({title: req.body.title, courseLength: req.body.courseLength, curriculum: daysArray})
	.save(function(err, data) {
		if (err) {
			res.status(500).json(err);
		} else {
			res.json(data);
		}
	})
};

exports.getCourse = function(req, res) {

	Course.findById(req.params.courseId)
	.populate('curriculum.lesson')
	.exec(function (err, data) {
		if (err) return res.status(500).json(err);
		return res.json(data);
	})
};

exports.getAllCourses = function(req, res) {
	Course.find({}, function(err, data) {
		if (err) {
			res.status(500).json(err);
		} else {
			res.json(data);
		}
	})
}


exports.updateLessonOrder = function (req, res) {
	var curriculumId = req.params.curriculumId;

	Course.findById(curriculumId, function (err, course) {
		if (err) res.status(500).send(err);

		var newCourse = [];
		
		req.body.forEach(function (courseId) {
			course.curriculum.forEach(function (lesson) {
				if (courseId == lesson._id) {
					newCourse.push(lesson);
				}
			})
		})

		course.curriculum = newCourse;
		course.save(function (err, result) {
			if (err) return res.status(500).send(err);
			return res.json(result);
		});
	})
}


exports.updateCourseCurriculum = function(req, res) {
	var data = req.body;

	Course.findOne({ 'curriculum._id' :  req.params.curriculumId}, function (err, course) {
		// if (err) return res.status(500).send(err);
		// course.curriculum[data.index - 1].lesson = data.lesson;

		if (err) return res.status(500).send(err);

		//THIS MIGHT BE BROKEN
		// course.curriculum[data.index - 1].lesson = data.lesson;
		// course.curriculum[data.index - 1].topic = data.topic;

		course.curriculum.id(req.params.curriculumId).set(data);

		course.save(function (err, result) {
			if (err) return res.status(500).send(err);
			Course
				.findById({ '_id': course._id })
				.populate('curriculum.lesson')
				.exec(function(err, data){
					return res.json(data);
				})

			// TODO: NEED TO POPULATE THE COURSES
			
		})
	});
}

