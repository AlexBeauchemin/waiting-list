//CLIENT ACTIONS
if (Meteor.isClient) {

  Session.set('loginState', "login");

  //SUBSCRIPTIONS
  Meteor.subscribe('institutions', null, function () {
    //TODO: better way to point to the first element id
    Session.set("current_institution", Institutions.find({}, {sort: {name: 1}, limit: 1}).fetch()[0]._id);
    Meteor.autosubscribe(function () {
      Meteor.subscribe('patients', Session.get("current_institution"));
      Meteor.subscribe('userData', null, function () {
        //console.log('Userdata:',Meteor.user().profile);
      });
    });
  });


  //FEED TEMPLATES
  Template.login.stateIs = function (state) {
    return state === Session.get("loginState");
  };

  Template.institutionslist.institutions = function () {
    var user = Meteor.user();
    //TODO: Filter to not see private lists must be done server side

    if (user) {
      return Institutions.find({"users": {$ne: user._id}, "private": "0"}, {sort: {name: 1}});
    }

    return Institutions.find({"private": 0}, {sort: {name: 1}});
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

  Template.patientlist.patients = function () {
    var patients = Patients.find({}, {sort: {position: 1, name: -1}});
    return patients.fetch();
  };

  Template.patientlist.selected_name = function () {
    var patient = Patients.findOne(Session.get("selected_patient"));
    return patient && patient.name;
  };

  Template.patientlist.institution_info = function () {
    var institution = Institutions.findOne({_id: Session.get('current_institution')});
    if (institution)
      return institution;
    return {};
  };

  Template.patientlist.isAdmin = function () {
    var institution = Institutions.findOne({_id: Session.get('current_institution')});
    if (!institution || !institution.users)
      return false;
    return ($.inArray(Meteor.user()._id, institution.users) != -1);
  };

  Template.patient.active = function () {
    return Session.equals("selected_patient", this._id) ? "active" : '';
  };

  Template.institution.active = function () {
    return Session.equals("current_institution", this._id) ? "active" : '';
  };


  //EVENTS
  Template.nav.events({
    'click .login': function () {
      App.changePage('login');
    },
    'click .profil': function () {
      App.changePage('profil');
    },
    'click .logout': function () {
      Meteor.logout(function (error) {
        if (error) App.outputErrors(error);
      });
    },
    'click .logo': function () {
      var $navBarItems = $('.navbar .nav li');
      $navBarItems.removeClass('active');
      App.changePage('main');
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
        App.changePage('main',true);
      }
    }
  });

  Template.login.events({
    'click .switch-create': function () {
      Session.set('loginState', "create");
    },
    'click .switch-login': function () {
      Session.set('loginState', "login");
    },
    'click .switch-retrieve': function () {
      Session.set('loginState', "retrieve");
    },
    'click .btn': function () {
      var state = Session.get('loginState'),
        $containerLogin = $('.container-login'),
        email = $containerLogin.find('.login-email').val(),
        name = $containerLogin.find('.login-name').val(),
        password = $containerLogin.find('.login-password').val();

      if (state == "create") {
        App.createAccount(name, email, password);
      }
      else if (state == "login") {
        Meteor.loginWithPassword({email: email}, password, function (error) {
          if (error) App.outputErrors(error);
          else {
            $.fancybox.close();
            App.outputSuccess('You are now logged in.');
            App.changePage('main');
          }
        });
      }
      else if (state == "retrieve") {

      }
    }
  });

  Template.createInstitution.events({
    'click .btn-add-institution': function () {
      var name = $('input.institution-name').val(),
        isPrivate = $('input[name="private"]:checked').val();
      Meteor.call("create_institution", name, '', isPrivate, function (error) {
        if (error) {
          App.outputErrors(error);
        }
        else {
          App.changePage('main');
          App.outputSuccess('New institution created.');
          $.fancybox.close();
        }
      });
    }
  });

  Template.institution.events({
    'click': function () {
      Session.set("current_institution", this._id);
      App.updatePatients();
    }
  });

  Template.patient.events({
    'click .delete': function () {
      Meteor.call('delete_patient', this._id, Session.get("current_institution"));
      App.updatePatients();
    },
    'click .alert-icon': function () {
      $.fancybox({
        content: $('.container-add-alert')
      });
    }
  });

  Template.patientlist.events({
    'click a.up': function () {
      if (Session.get("selected_patient_position") > 1) {
        var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") - 1});
        Patients.update(Session.get("selected_patient"), {$inc: {position: -1}});
        Patients.update(switching_patient._id, {$inc: {position: +1}});
        Session.set("selected_patient_position", Session.get("selected_patient_position") - 1);
      }
    },
    'click a.down': function () {
      var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") + 1});
      if (switching_patient) {
        Patients.update(Session.get("selected_patient"), {$inc: {position: 1}});
        Patients.update(switching_patient._id, {$inc: {position: -1}});
        Session.set("selected_patient_position", Session.get("selected_patient_position") + 1);
      }
    },
    'click a.add': function () {
      var name = $('.addPatient').val(),
        position = $('.patient').length + 1,
        institution = Session.get("current_institution");
      if (name && position && institution) {
        Meteor.call("create_patient", name, position, institution, function (error, patient_id) {
          App.outputErrors(error);
        });
      }
    },
    'click a.repair': function () {
      App.updatePatients();
    },
    'click a.empty': function () {
      Meteor.call('empty_institution', Session.get("current_institution"), function (res) {
        App.outputSuccess('Institution is now empty');
      });
    },
    'click a.delete': function () {
      Meteor.call('delete_institution', Session.get("current_institution"), function (res) {
        App.outputSuccess('Institution deleted');
      });
    },
    'click a[data-action="save-description"]': function() {
      var description = $('#description').val();
      Meteor.call('update_institution', Session.get("current_institution"), {description: description}, function (res) {
        if(description) App.outputSuccess('Description saved');
        else App.outputSuccess('Description deleted');
        $('.description').children().toggleClass('hidden');
      });
    },
    'click a[data-action="cancel-description"]': function() {
      var $description = $('.description');
      $description.children().toggleClass('hidden');
      $description.find('textarea').val($description.children('.description-text').text());

    },
    'click span.description-text': function() {
      $('p.description').children().toggleClass('hidden');
      $('#description').trigger('focus');
    },
    'click .viewmode': function (e) {
      //TODO: Clean this;
      if (!App.viewmode_properties) {
        App.viewmode_properties = {
          'elTitle': $('.navbar-fixed-top'),
          'elMenu': $('.navbar'),
          'elContent': $('.content'),
          'elBody': $('body'),
          'elLogout': $('.btn.logout'),
          'elAdminPanel': $('.admin_panel')
        };
      }

      // Switch back to normal mode
      if (App.viewmode_properties.elBody.hasClass('listview')) {
        App.viewmode_properties.elTitle.slideDown();
        App.viewmode_properties.elMenu.animate({'left': 0});
        App.viewmode_properties.elLogout.animate({'left': 0});
        App.viewmode_properties.elContent.animate({'paddingLeft': 270});
        App.viewmode_properties.elBody.removeClass('listview');
        if (App.viewmode_properties.elAdminPanel)
          App.viewmode_properties.elAdminPanel.slideDown();
        $(e.srcElement).html('Switch to list view');
        $('.description-text.sprite').show();
        //Switch to list mode
      } else {
        App.viewmode_properties.elTitle.slideUp();
        App.viewmode_properties.elMenu.animate({'left': -250});
        App.viewmode_properties.elLogout.animate({'left': -250});
        App.viewmode_properties.elContent.animate({'paddingLeft': 20});
        App.viewmode_properties.elBody.addClass('listview');
        if (App.viewmode_properties.elAdminPanel)
          App.viewmode_properties.elAdminPanel.slideUp();
        $(e.srcElement).html('Switch to normal view');
        $('.description-text.sprite').hide();
      }

    }
  });

  Template.patient.events({
    'click': function () {
      Session.set("selected_patient", this._id);
      Session.set("selected_patient_position", this.position);
    }
  });

  Template.patientlist.rendered = function () {
    App.renderPatientlistTemplate();
  };

  Meteor.startup(function () {
    App.init();
  });
}