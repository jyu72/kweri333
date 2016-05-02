/***** Meteor Client File *****************************************************/
/* Code to be run client-side */

/* Two type of definitions: helpers & events.
 * Helpers define variables/functions used within templates
 * Events define actions to be taken upon events within templates */

/***** Main Layout ************************************************************/
Template.main.helpers({
  username: function() {
    if (Meteor.user().profile.profStatus) {
      return Meteor.user().profile.name;
    }
  }
  
});

Template.registerHelper('isProf', function(){
  return Meteor.user().profile.profStatus;
});

Template.main.events({
  'click .title-login': function(event) {
    Meteor.loginWithCas(function(err){if(err)alert("Failed to login")});
    return false;
  }
});

Template.navbar.helpers({
  username: function() {
    return Meteor.user().profile.name;
  }
});

Template.navbar.events({
  'click .menu-logout': function(event) {
    if(Meteor.user()){
      leaveClass();
      Meteor.logout();
      openCenteredPopup(
        "https://fed.princeton.edu/cas/logout",
        810 || 800,
        610 || 600);
      Router.go('home');
    } 
    return false;
  },
  'click .menu-profile': function(event) {
    leaveClass();
    Router.go('profile');
    return false;
    // if(!Meteor.user().profile.profStatus) {
    //   Router.go('profileStud');
    // }
    // else {
    //   Router.go('profileProf');
    // }
    // return false;
  },   
  'click .navbar-brand': function(event) {
    //leaveClass();
    Router.go('/');
    return false;
  }

});

Template.navbar.helpers({
  username: function() {
    if (Meteor.user()) return Meteor.user().profile.name;
    else return;
  }
});

/***** Home Page **************************************************************/
Template.home.events({
  'click .btnloginProf': function(event) {
    if (Meteor.user()){
      Router.go('profileProf');
    } else {
      Meteor.loginWithCas(
        function(err){
          if(err)alert("Failed to login");
          else {
            Meteor.users.update(Meteor.userId(), 
              {$set: {"profile.profStatus": 1}});
            Router.go('profileProf');
          }
        });
    }
    return false;
  },
  'click .btnloginStud': function(event) {
    if(Meteor.user()){
      Router.go('profileStud');
    } else {
      Meteor.loginWithCas(
        function(err){
          if(err)alert("Failed to login");
          else {
            Meteor.users.update(Meteor.userId(), 
              {$set: {"profile.profStatus": 0}});
            Router.go('profileStud');
          }
        });
    }
    return false;
  }
});

/***** Profile Page ***********************************************************/
Template.profile.helpers({
  loaded: function() {
    if (Classes.find().count() > 0) {
      var selectedClass = Meteor.user().profile.selectedClass
      if (selectedClass) {
        Session.setDefault('class', selectedClass);
      }
      else {
        var classy = Classes.findOne();
        if (classy) {
          Session.setDefault('class', classy._id);
        }
      }
      var selectedLecture = Meteor.user().profile.selectedLecture
      if (selectedLecture) {
        Session.setDefault('lecture', selectedLecture);
      }
      else {
        var lecture = Lectures.findOne({class_id: Session.get('class')}, {sort: {number: -1}});
        if (lecture) {
          Session.setDefault('lecture', lecture._id);
        }
      }
      Session.set('questionsortkey', 'bytime');
      return true;
    } else return false;
  },
  classes: function() {
    if (Meteor.user().profile.profStatus) 
      return Classes.find({profs: Meteor.userId()}, {sort: {department: 1, number: 1}});
    else 
      return Classes.find({students: Meteor.userId()}, {sort: {department: 1, number: 1}})
  },
  cDpt: function() {
    return Classes.findOne(Session.get('class')).department;
  },
  cNum: function() {
    return Classes.findOne(Session.get('class')).number;
  },
  cName: function() {
    return Classes.findOne(Session.get('class')).name;
  },
  lNum: function() {
    return Lectures.findOne(Session.get('lecture')).number;
  },
  lName: function() {
    return Lectures.findOne(Session.get('lecture')).name;
  },
  dateString: function() {
    var date = Lectures.findOne(Session.get('lecture')).date;
    return date.toDateString();
  }
});

Template.classlist.helpers({
  /* classes returns a list of classes */
  classes: function() {
    if (Router.current().route.getName() == "profileProf") 
      return Classes.find({}, {sort: {department: 1, number: 1}});
    else if (Router.current().route.getName() == "profileStud") 
      return Classes.find({students: Meteor.userId()}, {sort: {department: 1, number: 1}})
  }
});

Template.classElem.helpers({
  selectedClass: function() {
    var current = this._id;
    if (current == Meteor.user().profile.selectedClass) {
      return "selectedClass";
    }
  },
  lectures: function(id) {
    return Lectures.find({class_id: id}, {sort: {number: -1}});
  }
});

Template.classElem.events({
  'click #profile-sidebar-classlist-element': function() {
    Session.set('class', this._id);
    Meteor.users.update(Meteor.userId(), 
      {$set: {"profile.selectedClass": this._id}});
  }, 
  'click #profile-sidebar-classlist-element-classinfo': function() {
    var lecture = Lectures.findOne({class_id: this._id}, {sort: {number: -1}});
    if (lecture) {
      Meteor.users.update(Meteor.userId(), 
        {$set: {"profile.selectedLecture": lecture._id}});
      leaveClass();
      
      Session.set('lecture', lecture._id);
      enterClass();
      
    } else {
      Meteor.users.update(Meteor.userId(), 
        {$set: {"profile.selectedLecture": ""}});
      leaveClass();
      
      Session.set('lecture', "");
      enterClass();
      
    }
  }
})

Template.lectureElem.helpers({
  selectedLecture: function() {
    var current = this._id;
    if (current == Meteor.user().profile.selectedLecture) {
      return "selectedLecture";
    }
  }
})

Template.lectureElem.events({
  'click #profile-sidebar-lecturelist-element': function() {
    Meteor.users.update(Meteor.userId(), 
      {$set: {"profile.selectedLecture": this._id}});
    leaveClass();
    Session.set('lecture', this._id);
    enterClass();
  }
})

Template.search.events({
  'keyup #profile-sidebar-searchbar': function(event) {
    Session.set('searchKey', event.target.value);
  }, 
  'submit #profile-sidebar-search': function(event) {
    return false;
  }
});

Template.searchlist.helpers({
  searchNum: function() {
    var temp = Session.get('searchNum');
    if (temp) return temp;
    else return 0;
  },

  /* classes returns a list of classes that match search term(s) */
  classes: function() {
    var key = Session.get('searchKey');
    if (key == null || key == "") {
      Session.set('searchNum', 0);
      return;
    }
    var name = new RegExp(key, 'i');
    var arr = key.split(" ").filter(function(n) {return n != ''});
    var dept = new RegExp();
    var num = new RegExp();
    if (arr.length <= 2) {
      for (index in arr) {
        if (isNaN(arr[index])) {
          dept = new RegExp(arr[index], 'i');
        } else {
          num = new RegExp(arr[index]);
        }
      }
    } else  {
      Session.set('searchNum', 0);
      return;
    }
    var classes = Classes.find(
      {$and: [
        {$or: [
          {$and: [{department: dept}, {number: num}]}, 
          {name: name}
          ]},
          {students: {$ne: Meteor.userId()}}
          ]}, 
          {sort: {department: 1, number: 1}});
    Session.set('searchNum', classes.count());
    return classes;
  }
});

/***** Profile Page ***********************************************************/
Template.classlist2.helpers({
  /* classes returns a list of classes */
  classes: function() {
    if (Router.current().route.getName() == "profileProf") 
      return Classes.find({}, {sort: {department: 1, number: 1}});
    else if (Router.current().route.getName() == "profileStud") 
      return Classes.find({students: Meteor.userId()}, {sort: {department: 1, number: 1}})
  }
});

Template.classElem2.events({
  /* clicking on a class redirects to that class's page */
  'click .class-list': function() {
    Meteor.users.update(Meteor.userId(), 
      {$set: {"profile.selectedClass": this._id}});
    Session.set('class', this._id)
    Router.go('class', {class_id: this._id});
  }
});

Template.addClass.events({
  /* insert a new class into the Classes collection */
  'submit .new-class': function(event) {
    var department = event.target.department.value.toUpperCase();
    var number = event.target.number.value;
    var name = event.target.name.value;
    Classes.insert({
      department: department,
      number: number,
      name: name,
      profs: [Meteor.userId()], 
      students: []
    });
    event.target.department.value = "";
    event.target.number.value = "";
    event.target.name.value = "";
    return false
  }
});

Template.classSearch.events({
  'keyup .searchTerm': function(event) {
    Session.set('searchKey', event.target.value);
  }
});

Template.searchClasslist.helpers({
  /* classes returns a list of classes that match search term(s) */
  classes: function() {
    var key = Session.get('searchKey');
    if (key == null || key == "") return;
    var name = new RegExp(key, 'i');
    var arr = key.split(" ").filter(function(n) {return n != ''});
    var dept = new RegExp();
    var num = new RegExp();
    if (arr.length <= 2) {
      for (index in arr) {
        if (isNaN(arr[index])) {
          dept = new RegExp(arr[index], 'i');
        } else {
          num = new RegExp(arr[index]);
        }
      }
    } else return;
    return Classes.find(
      {$and: [
        {$or: [
          {$and: [{department: dept}, {number: num}]}, 
          {name: name}
          ]},
          {students: {$ne: Meteor.userId()}}
          ]}, 
          {sort: {department: 1, number: 1}});
  }
});

Template.searchClassElem.helpers({
  prof_names: function() {
    var prof_ids = this.profs;
    return Meteor.users.find({_id: prof_ids[0]});
  }
});

Template.searchClassElem.events({
  'click .enroll': function() {
    Classes.update({_id: this._id}, {$push: {students: Meteor.userId()}})
  }
});

/***** Class Page *************************************************************/
Template.class.helpers({
  /* returns the department of the current class */
  department: function() {
    return Classes.findOne(Session.get('class')).department;
  },
  /* returns the number of the current class */
  number: function() {
    return Classes.findOne(Session.get('class')).number;
  },
  /* returns the name of the current class */
  name: function() {
    return Classes.findOne(Session.get('class')).name;
  }

});

Template.classElem2.helpers({
  selectedClass: function() {
    var current = this._id;
    if (current == Meteor.user().profile.selectedClass) {
      return "selectedClass";
    }
  }
});

Template.lecturelist.helpers({
  /* lectures returns a list of lectures */
  lectures: function() {
    return Lectures.find({}, {sort: {number: -1}});
  }
});

Template.lecturelist.events({
  /* clicking on a lecture redirects to that lecture's page */
  'click .lecture-listing': function() {
    Router.go('lecture', 
      {class_id: Session.get('class'), lecture_id: this._id}); 
  }
});

Template.addLecture.events({
  /* insert a new lecture into the Lectures collection */
  'submit .new-lecture': function(event) {
    var number = parseInt(event.target.number.value);
    var name = event.target.name.value;
    Lectures.insert({
      class_id: Session.get('class'),
      number: number,
      name: name,
      confuseList: [],
      totalList: [],
      date: new Date(),
      openStatus: true

    });
    event.target.number.value = "";
    event.target.name.value = "";
    return false
  }
});

/***** Lecture Page ***********************************************************/
Template.lecture.helpers({
  cDpt: function() {
    return Classes.findOne(Session.get('class')).department;
  },
  cNum: function() {
    return Classes.findOne(Session.get('class')).number;
  },
  cName: function() {
    return Classes.findOne(Session.get('class')).name;
  },
  lNum: function() {
    return Lectures.findOne(Session.get('class')).number;
  },
  lName: function() {
    return Lectures.findOne(Session.get('lecture')).name;
  },
  dateString: function() {
    var date = Lectures.findOne(Session.get('lecture')).date;
    return date.toDateString();
  }
});

Template.questionlist.helpers({
  /* questions returns a list of questions sorted by decreasing score
  * and decreasing creation date */
  questionsTop: function() {
    return Questions.find({lecture_id: Session.get('lecture')}, {sort: {important: -1, value: -1, createdAt: -1}});
  },
  questionsNew: function() {
    return Questions.find({lecture_id: Session.get('lecture')}, {sort: {important: -1, createdAt: -1}});
  },
  sortkeytime: function() {
    var sortkey = Session.get('questionsortkey')
    if ( sortkey != null && sortkey == 'byvotes') {
      return true;
    }
    return false;
  }
});

var timeString = "1";
 Template.questionbox.helpers({
  time: function() {
    var lecture =  Lectures.findOne(Session.get("lecture"));
    if (lecture.confuseList.indexOf(Meteor.userId()) == -1) {
      return Session.get("time");
    }
    return "for "+ Session.get("time");  
  }, 
  not: function() {
    var lecture =  Lectures.findOne(Session.get("lecture"));
    if (lecture.confuseList.indexOf(Meteor.userId()) == -1) {
      return "not";
    }
    return "";
  }
});

var counfusionCounterTimeout = 60000;
var confusionButton;
Template.questionbox.events({
  /* submit a new question. return false means don't reload the page */
  'submit .questions-newQuestion': function(event) {
    /* get the text of the question */
    var qText = event.target.qText.value;
    if (qText == "") return false;
    // insert the question into the database
    Questions.insert({ 
      lecture_id: Session.get('lecture'),
      qText: qText,
      important: 0,
      value: 0,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      // upvotedBy: [Meteor.userId()]
      upvotedBy: []
    });
    // clear the question field
    event.target.qText.value = "";
    return false;
  },
  'click .questions-con-button': function(){
    var lecture =  Lectures.findOne(Session.get('lecture'));
    if (lecture.confuseList.indexOf(Meteor.userId()) == -1) {
      Lectures.update(Session.get('lecture'), 
      {
        $push: {confuseList: Meteor.userId()}
      });
      var confuseTimerReset = setTimeout(confuseTimer, counfusionCounterTimeout);
      timer.start();
      confusionButton = event.target;
      confusionButton.disabled = true;
      
    } else {
      Lectures.update(Session.get('lecture'), 
      {
        $pull: {confuseList: Meteor.userId()}
      });
    }
    return false;
  }
});

/********* Countdown timer stuff *********/

function CountDownTimer(duration, granularity) {
  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.running = false;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  console.log("STARTE");

  this.running = true;
  var start = Date.now(),
      that = this,
      diff, obj;

  (function timer() {
    diff = that.duration - (((Date.now() - start) / 1000) | 0);

    if (diff > 0 && Lectures.findOne(Session.get('lecture')).confuseList.indexOf(Meteor.userId()) != -1) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;
      confusionButton.disabled = false;

    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.minutes, obj.seconds);
    }, that);
  }());
};

CountDownTimer.prototype.onTick = function(ftn) {
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.expired = function() {
  return !this.running;
};

CountDownTimer.parse = function(seconds) {
  return {
    'minutes': (seconds / 60) | 0,
    'seconds': (seconds % 60) | 0
  };
};


  timer = new CountDownTimer(counfusionCounterTimeout/1000),
  timeObj = CountDownTimer.parse(counfusionCounterTimeout/1000);

  format(timeObj.minutes, timeObj.seconds);

  timer.onTick(format);



  function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    timeString = minutes + ':' + seconds;
    Session.set("time", timeString);
  }

/********* End Countdown timer stuff *********/

var confuseTimer = function() {
  var lecture =  Lectures.findOne(Session.get('lecture'));

  if (lecture.confuseList.indexOf(Meteor.userId()) == -1) {
    return false;
  }
  alert("1 minute elapsed, confusion status cleared");
  confusionButton.disabled = false;
  Lectures.update(Session.get('lecture'), 
  {
    $pull: {confuseList: Meteor.userId()}
  });
}


Template.questionsort.helpers({
  'selectedtimesorter': function() {
    if ( Session.get('questionsortkey') == 'bytime' ) {
      return "questions-selectedsorter";
    }
    return "";
  },

  'selectedvotesorter': function() {
    if ( Session.get('questionsortkey') == 'byvotes' ) {
      return "questions-selectedsorter";
    }
    return "";
  }
});

Template.questionsort.events({
  'click #questions-sortbytime': function() {
    Session.set('questionsortkey', 'bytime');
    return false;
  },

  'click #questions-sortbyvotes': function() {
    Session.set('questionsortkey', 'byvotes');
    return false;
  }
});
Template.questionsort.onRendered(function () {enterClass()});
//Template.questionsort.onDestroyed(function () {leaveClass()});


Template.question.helpers({
  /* Function that converts a date to a string */
  createdAtToString: function() {
    var hours = this.createdAt.getHours();
    var period = "am"
    if (hours >= 12) period = "pm";
    hours = (hours % 12) || 12;
    return hours + this.createdAt.toTimeString().substr(2,3) + " " + period;
  },
  /* returns true if the user has upvoted the question and false otherwise */
  upvoted: function() {
    return this.upvotedBy && this.upvotedBy.indexOf(Meteor.userId()) != -1;
  },

  markedasimportant: function() {
    if ( Questions.findOne({ _id: this._id }).important == 1 ) {
      return "questions-markedasimportant";
    }
    return "";
  },
  importantbutton: function() {
    if ( Questions.findOne({ _id: this._id }).important == 1 ) {
      return true;
    }
    return false;
  }
});

Template.question.events({
  /* clicking the upvote button increases the question's value by 1 */
  'click .questions-up': function() {
    if (this.upvotedBy == undefined || 
      this.upvotedBy.indexOf(Meteor.userId()) == -1) {
      Questions.update(this._id, 
      {
        $set: {value: this.value - 1}, 
        $pull: {upvotedBy: Meteor.userId()}
      });
  }
  return false;
},

  'click .questions-delete': function () {
    Questions.remove(this._id);
  },

  'click .questions-markasimportant': function() {
    if ( Questions.findOne({_id: this._id}).important == 0 ) {
      Questions.update(this._id, 
        {
          $set: {important: 1}
        });      
    }
    else {
      Questions.update(this._id, 
        {
          $set: {important: 0}
        });   
    }

    return false;
  },
  'click .questions-upvote': function() {
    if (this.upvotedBy == undefined || 
      this.upvotedBy.indexOf(Meteor.userId()) == -1) {
      Questions.update(this._id, 
      {
        $set: {value: this.value + 1}, 
        $push: {upvotedBy: Meteor.userId()}
      });
  }
  return false;
  },
  /* clicking the downvote button decreases the question's value by 1 */
  'click .questions-down': function() {
    if (this.upvotedBy != undefined && 
      this.upvotedBy.indexOf(Meteor.userId()) != -1) {
      Questions.update(this._id, 
      {
        $set: {value: this.value - 1}, 
        $pull: {upvotedBy: Meteor.userId()}
      });
  }
  return false;
  },
  'click .questions-unvote': function() {
    if (this.upvotedBy != undefined && 
      this.upvotedBy.indexOf(Meteor.userId()) != -1) {
      Questions.update(this._id, 
      {
        $set: {value: this.value - 1}, 
        $pull: {upvotedBy: Meteor.userId()}
      });
  }
  return false;
  },

  'click .questions-delete': function () {
    Questions.remove(this._id);
  }
});

Template.questionConCounter.helpers({
  percent: function(){
    var lecture =  Lectures.findOne(Session.get('lecture'));
    return Math.floor(lecture.confuseList.length/lecture.totalList.length*100);
  },
  color: function() {
    var lecture =  Lectures.findOne(Session.get('lecture'));
    var per = 
    Math.floor(lecture.confuseList.length/lecture.totalList.length*100);
    if (per <= 25){
      return "progress-bar-success";
    } else if (per <= 50){
      return "progress-bar-warning";
    } else {
      return "progress-bar-danger";
    }
  }
});

Template.questionConCounter.events({
  /* Reset cc counter */
  'click .questions-conReset-button': function(){
    try{
      confusionButton.disabled = false;
    } catch(err){

    }
    var lecture =  Lectures.findOne(Session.get('lecture'));
    Lectures.update(Session.get('lecture'), { $set : {confuseList: [] }} , {multi:true} );
    return false;
  }

});

var openCenteredPopup = function(url, width, height) {
  var screenX = typeof window.screenX !== 'undefined'
  ? window.screenX : window.screenLeft;
  var screenY = typeof window.screenY !== 'undefined'
  ? window.screenY : window.screenTop;
  var outerWidth = typeof window.outerWidth !== 'undefined'
  ? window.outerWidth : document.body.clientWidth;
  var outerHeight = typeof window.outerHeight !== 'undefined'
  ? window.outerHeight : (document.body.clientHeight - 22);
  // XXX what is the 22?

  // Use `outerWidth - width` and `outerHeight - height` for help in
  // positioning the popup centered relative to the current window
  var left = screenX + (outerWidth - width) / 2;
  var top = screenY + (outerHeight - height) / 2;
  var features = ('width=' + width + ',height=' + height +
    ',left=' + left + ',top=' + top + ',scrollbars=yes');

  var newwindow = window.open(url, '_blank', features);
  if (newwindow.focus)
    newwindow.focus();
  return newwindow;
};

/* Function to add in users to a lecture on entering */
var enterClass = function() {
  if(!isStud()){
    return
  }
  try{
    var lecture =  Lectures.findOne(Session.get('lecture'));
    // alert("ENTER");
    if (lecture.totalList.indexOf(Meteor.userId()) == -1) {
      Lectures.update(Session.get('lecture'), 
      {
        $push: {totalList: Meteor.userId()}
      });
    }
  } catch(err){

  }
};

/* Function to remove users from a lecture on leaving */
var leaveClass = function() {
  if(!isStud()){
    return
  }
  try{
    var lecture =  Lectures.findOne(Session.get('lecture'));
    // alert("LEAVE");
    if (lecture.totalList.indexOf(Meteor.userId()) != -1) {
      Lectures.update(Session.get('lecture'), 
      {
        $pull: {totalList: Meteor.userId()}
      });
    }
    if (lecture.confuseList.indexOf(Meteor.userId()) != -1) {
      Lectures.update(Session.get('lecture'), 
      {
        $pull: {confuseList: Meteor.userId()}
      });
    }
  } catch(err){

  }
};

var isStud = function(){
  return !Meteor.user().profile.profStatus;
}