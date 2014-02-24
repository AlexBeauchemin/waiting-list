var searchTimeout = null;

//---------------------------------------------------
// Vars
//---------------------------------------------------
Template.institution.active = function () {
  return Session.equals("current_institution", this._id) ? "active" : '';
};

Template.institutionslist.institutions = function () {
  var user = Meteor.user();
  //TODO: Filter to not see private lists must be done server side

  if (user) {
    return Institutions.find({"users": {$ne: user._id}, "private": "0"}, {sort: {name: 1}});
  }

  return Institutions.find({"private": "0"}, {sort: {name: 1}});
};

Template.institutionslist.searchInstitutions = function () {
  //TODO: find a way to push the keyup input event reactively
  return [];
};

Template.institutionslist.myInstitutions = function () {
  var user = Meteor.user();
  if (user) {
    return Institutions.find({users: user._id}, {sort: {name: 1}});
  }
  return "";
};

Template.institutionslist.user = function () {
  return Meteor.user();
};




//---------------------------------------------------
// EVENTS
//---------------------------------------------------
Template.institution.events({
  'click': function () {
    Session.set("current_institution", this._id);
    Helpers.updatePatients();
  }
});

Template.nav.events({
  'click .login': function () {
    Helpers.changePage('login');
  },
  'click .profil': function () {
    Helpers.changePage('profil');
  },
  'click .logout': function () {
    Meteor.logout(function (error) {
      if (error) Helpers.outputErrors(error);
    });
  },
  'click .logo': function () {
    var $navBarItems = $('.navbar .nav li');
    $navBarItems.removeClass('active');
    Helpers.changePage('main');
  },
  'click .institution': function (event) {
    var target = $(event.target).parent();
    if (target.hasClass('add')) {
      var content = $('.container-create-institution');
      content.show();
      $.fancybox({
        content: content
      });
    }
    else {
      Helpers.changePage('main', true);
    }
  },
  'keyup input': function (event) {
    var val = $(event.target).val();
    if(searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function(){
      if(val.length > 1) {
        console.log(Institutions.find({"name" : {$regex : ".*" + val + ".*", $options: 'i'}}, {limit: 10}).fetch());
      }
    }, 2000);
  },
  empty: null
});

