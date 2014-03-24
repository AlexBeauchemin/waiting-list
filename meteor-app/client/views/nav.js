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
    var favorites = Meteor.user().profile.favorites;
    if(!favorites) favorites = [];
    return Institutions.find({"users": {$ne: user._id}, "private": "0", "_id": {$nin: favorites}}, {sort: {name: 1}});
  }

  return Institutions.find({"private": "0"}, {sort: {name: 1}});
};

Template.institutionslist.searchInstitutions = function () {
  NProgress.done();
  if(!Session.get('institution_search_string') || Session.get('institution_search_string') === '') {
    return [];
  }
  return Institutions.find({"name" : {$regex : ".*" + Session.get('institution_search_string') + ".*", $options: 'i'}}, {limit: 10}).fetch();
};

Template.institutionslist.myInstitutions = function () {
  var user = Meteor.user();
  if (user) {
    return Institutions.find({users: user._id}, {sort: {name: 1}});
  }
  return "";
};

Template.institutionslist.favInstitutions = function () {
  var user = Meteor.user();

  if (user) {
    var favorites = Meteor.user().profile.favorites;
    if(!favorites) favorites = [];
    return Institutions.find({_id: {$in: favorites}});
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
    NProgress.start();
    Helpers.animateOut();
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
  'click .profil i': function () {
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
  },
  'keyup input': function (event) {
    var val = $(event.target).val();

    NProgress.start();

    if(searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function(){
      Session.set('institution_search_string', val);
    }, 1000);
  },
  empty: null
});

