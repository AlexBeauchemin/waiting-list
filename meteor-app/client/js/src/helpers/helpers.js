var App = {};

(function ($) {
  App = {
    $body: null,
    $alerts: null,
    currentPage: 'main',
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
    viewmode_properties: null,

    init: function () {
      var _this = this;
      _this.$body = $('body');
      _this.$alerts = _this.$body.find('.alerts ul');
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
        Meteor.call("create_patient", name, position, institution, function (error, patient_id) {
          App.outputErrors(error);
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

    animateOutput: function (item) {
      var _this = this,
        height = item.height() + 10;

      item.css({'height': 0});
      item.animate({
        opacity: 1,
        height: height
      }, 500, function () {
        setTimeout(function () {
          item.animate({
            opacity: 0,
            height: 0
          }, 500, function () {
            item.remove();
          });
        }, 5000);
      });
    },

    applySortable: function () {
      var _this = this;

      $(".patientlist").sortable({
        update: function (event, ui) {
          _this.updatePatients();
        }
      });
    },


    changePage: function (newPage, forced) {
      var _this = this,
        oldPage = _this.currentPage;

      if(!forced && newPage == _this.currentPage) return;

      if (newPage == "login") {
        var container = $('.container-' + newPage);
        container.show();
        $.fancybox({
          content: container
        });
        return;
      }

      _this.currentPage = newPage;
      $('.container-' + oldPage).stop(true, false).slideUp('fast', function () {
        $('.container-' + newPage).stop(true, false).slideDown('fast');
      });
    },


    createAccount: function (name, email, password) {
      var _this = this;

      if (!password || password.length < 5)
        _this.outputErrors("Your password needs to be at least 5 characters.");
      else {
        var $loginContainer = $('.container-login'),
          $loginBtn = $loginContainer.find('.btn');
        $loginBtn.hide();
        _this.spinner = _this.addSpinner($loginContainer.find('.loading')[0]);
        Accounts.createUser({email: email, password: password, profile: {name: name}}, function (error) {
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
        _this.$alerts.append('<li class="btn-danger">' + msg + '<span class="close"></span></li>');
        var item = _this.$alerts.find('li').last();

        _this.animateOutput(item);
      }
    },

    outputSuccess: function (msg) {
      var _this = this;

      _this.$alerts.append('<li class="btn-success">' + msg + '<span class="close"></span></li>');
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
        patients_container.sortable({
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
      var _this = this;

      //TODO: Refactor this -> use css transitions with a body class instead
      if (!_this.viewmode_properties) {
        _this.viewmode_properties = {
          'elTitle': $('.navbar-fixed-top'),
          'elMenu': $('.navbar'),
          'elContent': $('.content'),
          'elBody': $('body'),
          'elLogout': $('.btn.logout'),
          'elAdminPanel': $('.admin_panel')
        };
      }

      // Switch back to normal mode
      if (_this.viewmode_properties.elBody.hasClass('listview')) {
        _this.viewmode_properties.elTitle.slideDown();
        _this.viewmode_properties.elMenu.animate({'left': 0});
        _this.viewmode_properties.elLogout.animate({'left': 0});
        _this.viewmode_properties.elContent.animate({'paddingLeft': 270});
        _this.viewmode_properties.elBody.removeClass('listview');
        if (_this.viewmode_properties.elAdminPanel)
          _this.viewmode_properties.elAdminPanel.slideDown();
        $button.html('Switch to list view');
        $('.description-text.sprite').show();
        //Switch to list mode
      } else {
        _this.viewmode_properties.elTitle.slideUp();
        _this.viewmode_properties.elMenu.animate({'left': -250});
        _this.viewmode_properties.elLogout.animate({'left': -250});
        _this.viewmode_properties.elContent.animate({'paddingLeft': 20});
        _this.viewmode_properties.elBody.addClass('listview');
        if (_this.viewmode_properties.elAdminPanel)
          _this.viewmode_properties.elAdminPanel.slideUp();
        $button.html('Switch to normal view');
        $('.description-text.sprite').hide();
      }
    },

    updatePatients: function () {
      var _this = this;

      //TODO: move this server side?
      var patients = $('.patientlist .patient');
      $.each(patients, function (index, patient) {
        Meteor.call("update_patient", $(patient).data('id'), index + 1, Session.get('current_institution'), function (error, patient_id) {
          _this.outputErrors(error);
        });
      });
    },

    empty: null
  };
})(jQuery);