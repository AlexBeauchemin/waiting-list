//---------------------------------------------------
// VARS
//---------------------------------------------------

Template.login.stateIs = function (state) {
  return state === Session.get("loginState");
};



//---------------------------------------------------
// EVENTS
//---------------------------------------------------

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
      Helpers.createAccount(name, email, password);
    }
    else if (state == "login") {
      Meteor.loginWithPassword({email: email}, password, function (error) {
        if (error) Helpers.outputErrors(error);
        else {
          $.fancybox.close();
          Helpers.outputSuccess('You are now logged in.');
          Helpers.changePage('main');
        }
      });
    }
    else if (state == "retrieve") {

    }
  }
});