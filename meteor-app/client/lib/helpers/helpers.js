Helpers = {
  $alerts: null,
  $body: null,
  $containerMain: null,
  currentPage: 'main',
  $navBar: null,
  spinner: null,
  spinner_opts: {
    lines: 11, // The number of lines to draw
    length: 0, // The length of each line
    width: 5, // The line thickness
    radius: 11, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 1.3, // Rounds per second
    trail: 54, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '20px', // Top position relative to parent in px
    left: '20px' // Left position relative to parent in px
  },

  init: function () {
    var _this = this;
    _this.$body = $('body');
    _this.$alerts = _this.$body.find('.alerts ul');
    _this.$navBar = _this.$body.find('.navbar');
    _this.$containerMain = _this.$body.find('.container-main');

    _this.bindEvents();
  },

  bindEvents: function () {
    var _this = this;

    _this.$body.on('click', '.no-link', function () {
      event.stopPropagation();
      return false;
    });

    _this.$alerts.on('click', 'li', function () {
      $(this).stop(true, false).animate({
        opacity: 0,
        height: 0
      }, 500, function () {
        $(this).remove();
      });
    });
  },

  addPatient: function(name) {
    var _this = this,
      position = $('.patient').length + 1,
      institution = Session.get("current_institution");

    if (name && position && institution) {
      Meteor.call("createPatient", name, position, institution, function (error, patient_id) {
        if(error) _this.outputErrors(error);
      });
    }
    else {
      _this.outputErrors('Sorry, the action failed');
    }
  },

  addSpinner: function (el) {
    var _this = this;

    //DOM is constantly refreshed by meteor , so we need to create a new spinner everytime, otherwise we get strange behaviors
    //TODO: use template preserve ?
    var new_spinner = new Spinner(_this.spinner_opts).spin();
    $(el).append(new_spinner.el);
    return new_spinner;
  },

  animateIn: function (item, callback, data) {
    var _this = this;

    if(!item) item = _this.$containerMain;
    if(typeof(item) == 'function') {
      callback = item;
      item = _this.$containerMain;
    }

    item.stop(true,false).css({ opacity: 0, display: 'block'}).animate({opacity: 1}, 'fast', function() {
      if(callback && data) callback(data);
      else if (callback) callback();
    });
  },

  animateOut: function (item) {
    var _this = this;
    if(!item) item = _this.$containerMain;
    item.css({opacity: 0, display: 'none'});
  },

  animateOutput: function ($item) {
    $item.on('click', function() {
      $item.remove();
    });
    setTimeout(function() {
      $item.removeClass('transparent');
      setTimeout(function() {
        $item.addClass('transparent');
        setTimeout(function() {
          $item.remove();
        }, 1000);
      },5000);
    },100);
  },

  changePage: function (newPage, forced) {
    var _this = this,
      oldPage = _this.currentPage;

    if(!forced && newPage == _this.currentPage) return;

    if(newPage != 'main') Session.set('current_institution', null);

    if (newPage == "login") {
      var container = $('.container-' + newPage);
      $.fancybox({
        'content': container,
        'transitionIn' : 'fade',
        'transitionOut' : 'fade'
      });
      return;
    }

    _this.currentPage = newPage;
//    $('.container-' + oldPage).stop(true, false).slideUp('fast', function () {
//      $('.container-' + newPage).stop(true, false).slideDown('fast');
//    });
    $('.container-' + oldPage).hide();
    _this.animateIn($('.container-' + newPage));
  },


  createAccount: function (name, email, password) {
    var _this = this;

    //TODO: Move this to server?

    if (!password || password.length < 5)
      _this.outputErrors("Your password needs to be at least 5 characters.");
    else {
      var $loginContainer = $('.container-login'),
        $loginBtn = $loginContainer.find('.btn');
      $loginBtn.hide();
      _this.spinner = _this.addSpinner($loginContainer.find('.loading')[0]);


      Accounts.createUser({email: email, password: password, profile: {name: name, favorites: []}}, function (error) {
        $loginBtn.show();
        _this.spinner.stop();
        if (error) _this.outputErrors(error);
        else {
          Meteor.loginWithPassword({email: email}, password, function (error) {
            if (error) _this.outputErrors(error);
          });
          $.fancybox.close();
          _this.outputSuccess('Your account has been created.');
          _this.changePage('main');
        }
      });
    }
  },

  outputErrors: function (error) {
    var _this = this,
      msg = "";

    if (error) {
      if (error.reason) // Account creation error
        msg = error.reason;
      else
        msg = error;

      var $item = $('<li class="alert-error transparent">' + msg + '<span class="close"></span></li>').appendTo(_this.$alerts);
      _this.animateOutput($item);
    }
  },

  outputSuccess: function (msg) {
    var _this = this;

    _this.$alerts.append('<li class="alert-success transparent">' + msg + '<span class="close"></span></li>');
    var item = _this.$alerts.find('li').last();

    _this.animateOutput(item);
  },

  renderPatientlistTemplate: function () {
    var _this = this;

    var patients_container = $(".patientlist"),
      list_rendered = false,
      total_patients = 0,
      row_split = 8;

    if (patients_container.length) {
      list_rendered = true;
      total_patients = patients_container.find('li').length;
    }

    if (list_rendered && patients_container.hasClass('sortable')) {
      patients_container.disableSelection().sortable({
        update: function (event, ui) {
          _this.updatePatients();
        }
      });
    }

    if (list_rendered && total_patients > row_split) {
      patients_container.addClass('two_columns');
    }
    else if (list_rendered) {
      patients_container.removeClass('two_columns');
    }
  },

  toggleViewMode: function($button) {
    var _this = this,
      $patientsList = _this.$containerMain.find('.patientlist'),
      $icons = $patientsList.find('.alert-icon, .delete').hide();

    _this.$body.toggleClass('listView');

    if (_this.$body.hasClass('listView')) {
      $icons.hide();
      $button.html('<span class="fa fa-compress"></span>');
    } else {
      $icons.show();
      $button.html('<span class="fa fa-expand"></span> Switch to list view');
    }

  },

  updatePatients: function () {
    var _this = this,
      $patientList = $('.patientlist'),
      $patients = $patientList.children('.patient');

    $patientList.animate({opacity :0}, function() {
      $.each($patients, function (index, patient) {
        Meteor.call("updatePatient", $(patient).data('id'), index + 1, Session.get('current_institution'), function (error, patient_id) {
          if(error) _this.outputErrors(error);
        });
      });
    });
  },

//  updateSearchResults: function(results) {
//    var _this = this,
//      $searchResult = _this.$navBar.find('.search-results');
//
//    console.log($searchResult);
//    console.log($('.search-results'));
//
//    $('.search-results').html('');
//    $.each(results, function(index, result){
//      $('.search-results').append('<li class="institution" data-id="' + result._id + '"><a href="#">' + result.name + '</a></li>');
//    });
//
//  },

  empty: null
};