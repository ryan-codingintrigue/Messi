/*
 * jQuery Messi Plugin 2.0
 * https://github.com/ryan-codingintrigue/Messi
 *
 * A fork of:
 * https://github.com/marcosesperon/jquery-messi
 *
 * Copyright 2012, Marcos Esperón
 * http://marcosesperon.es
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* v1.3 Legacy Syntax */
(function($) {
  var Messi = function(data, options) {
    // Extend our prototype with the options
    this.options = $.extend({}, Messi.prototype.options, options || {});
    // Create the main DOM element for this instance
    this.messi = $(this.template);
    // Set the HTML content of our instance
    this.setContent(data);

    // If the title is not set, remove the titlebox element
    if(this.options.title == null) this.findElement(".messi-titlebox").remove();
    else {
      // Otherwise add the title into the titlebox
      this.findElement('.messi-title').append(this.options.title);

      // If there are no buttons, autoclose is not set & the user wants a closeButton,
      // then add this into the titlebox
      if(this.options.buttons.length === 0 && !this.options.autoclose && this.options.closeButton) {
          var close = $('<span class="messi-closebtn"></span>')
            .on('click', function() {
              this.hide();
          }.bind(this));
          this.findElement(".messi-titlebox").prepend(close);
      };

      // If the user specified a titlebox class, add it
      if(this.options.titleClass != null) this.findElement('.messi-titlebox').addClass(this.options.titleClass);
    }

    // If the user specified a width, assign it to the outer box
    if(this.options.width != null) this.findElement('.messi-box').css('width', this.options.width);

    // If the user specified buttons...
    if (this.options.buttons.length > 0) {

        for (var i = 0; i < this.options.buttons.length; i++) {
            // Generate a class for each button, if specified
            var cls = (this.options.buttons[i]["class"]) ? _this.options.buttons[i]["class"] : '';
            // Generate the button DOM element
            var btn = $('<div class="btnbox"><button class="btn ' + cls + '" href="#">' + this.options.buttons[i].label + '</button></div>');
            // Bind onto the click for this button & pass through the value
            btn.on('click', 'button', (function (self, value) {
                return function() {
                  var after = (self.options.callback != null) ? function () { self.options.callback(value); } : null;
                  self.hide(after);
                };
            }(this, this.options.buttons[i].val)));

            // Append the button to the action holder
            this.findElement('.messi-actions').append(btn);

        };

    } else {
        // If no buttons are specified, remove the footbox
        this.findElement('.messi-footbox').remove();

    };

    // If the modal option is set, and no modal wrapper is already present,
    // then create one
    this.modal = (this.options.modal && !$(".messi-modal").length) ? $('<div class="messi-modal"></div>').css({opacity: this.options.modalOpacity, width: $(document).width(), height: $(document).height(), 'z-index': this.options.zIndex + $('.messi').length}).appendTo(document.body) : null;

    // If autoshow is set, show the dialog automatically
    if(this.options.show) this.show();

    // On window resize, trigger our resize event
    $(window).on('resize', this.resize.bind(this));

    // Set up autoclose if required
    if(this.options.autoclose != null) {
      setTimeout(function() {
        this.hide();
      }.bind(this), this.options.autoclose);
    };

    return this;
  };

  // Set up the prototype
  Messi.prototype = {

    options: {
      autoclose: null,                         // autoclose message after 'x' miliseconds, i.e: 5000
      buttons: [],                             // array of buttons, i.e: [{id: 'ok', label: 'OK', val: 'OK'}]
      callback: null,                          // callback function after close message
      center: true,                            // center message on screen
      closeButton: true,                       // show close button in header title (or content if buttons array is empty).
      height: 'auto',                          // content height
      title: null,                             // message title
      titleClass: null,                        // title style: info, warning, success, error
      modal: false,                            // shows message in modal (loads background)
      modalOpacity: .2,                        // modal background opacity
      padding: '10px',                         // content padding
      show: true,                              // show message after load
      unload: true,                            // unload message after hide
      viewport: {top: '0px', left: '0px'},     // if not center message, sets X and Y position
      width: '500px',                          // message width
      zIndex: 99999                            // message z-index
    },
    template: '<div class="messi"><div class="messi-box"><div class="messi-wrapper"><div class="messi-titlebox"><span class="messi-title"></span></div><div class="messi-content"></div><div class="messi-footbox"><div class="messi-actions"></div></div></div></div></div>',
    content: '<div></div>',
    visible: false,

    findElement: function(selector) {
      return $(selector, this.messi);
    },

    setContent: function(data) {
      this.findElement(".messi-content").css({padding: this.options.padding, height: this.options.height}).empty().append(data);
    },

    viewport: function() {

      return {
        top: (($(window).height() - this.messi.height()) / 2) +  $(window).scrollTop() + "px",
        left: (($(window).width() - this.messi.width()) / 2) + $(window).scrollLeft() + "px"
      };

    },

    show: function() {

      if(this.visible) return;

      if(this.options.modal && this.modal != null) this.modal.show();
      this.messi.appendTo(document.body);

      // obtenemos el centro de la pantalla si la opción de centrar está activada
      if(this.options.center) this.options.viewport = this.viewport(this.findElement(".messi-box"));

      this.messi.css({top: this.options.viewport.top, left: this.options.viewport.left, 'z-index': this.options.zIndex + $('.messi').length}).show().animate({opacity: 1}, 300);

      // cancelamos el scroll
      //document.documentElement.style.overflow = "hidden";

      this.visible = true;

    },

    hide: function(after) {

      if (!this.visible) return;

      this.messi.animate({opacity: 0}, 300, function() {
        if(this.options.modal && this.modal != null) this.modal.remove();
        this.messi.css({display: 'none'}).remove();
        // reactivamos el scroll

        this.visible = false;
        if (after) after.call();
        if(this.options.unload) this.unload();
      }.bind(this));

      return this;

    },

    resize: function() {
      if(this.options.modal) {
        $('.messi-modal').css({width: $(document).width(), height: $(document).height()});
      };
      if(this.options.center) {
        this.options.viewport = this.viewport(this.findElement(".messi-box"));
        this.messi.css({top: this.options.viewport.top, left: this.options.viewport.left});
      };
    },

    toggle: function() {
      this[this.visible ? 'hide' : 'show']();
      return this;
    },

    unload: function() {
      if (this.visible) this.hide();
      $(window).off('resize', this.resize);
      this.messi.remove();
    }

  };

  // llamadas especiales
  $.extend(Messi, {

    alert: function(data, callback, options) {

        var buttons = [{id: 'ok', label: 'OK', val: 'OK'}];

        options = $.extend({closeButton: false, buttons: buttons, callback:function() {}}, options || {}, {show: true, unload: true, callback: callback});

        return new Messi(data, options);

    },

    ask: function(data, callback, options) {

      var buttons = [
        {id: 'yes', label: 'Yes', val: 'Y', "class": 'btn-success'},
        {id: 'no', label: 'No', val: 'N', "class": 'btn-danger'},
      ];

      options = $.extend({closeButton: false, modal: true, buttons: buttons, callback:function() {}}, options || {}, {show: true, unload: true, callback: callback});

      return new Messi(data, options);

    },

    img: function(src, options) {

      var img = new Image();

      $(img).load(function() {

        var vp = {width: $(window).width() - 50, height: $(window).height() - 50};
        var ratio = (this.width > vp.width || this.height > vp.height) ? Math.min(vp.width / this.width, vp.height / this.height) : 1;

        $(img).css({width: this.width * ratio, height: this.height * ratio});

        options = $.extend(options || {}, {show: true, unload: true, closeButton: true, width: this.width * ratio, height: this.height * ratio, padding: 0});
        new Messi(img, options);

      }).error(function() {

        console.log('Error loading ' + src);

      }).attr('src', src);

    },

    load: function(url, options) {

      options = jQuery.extend(options || {}, {show: true, unload: true, params: {}});

      var request = {
        url: url,
        data: options.params,
        dataType: 'html',
        cache: false,
        error: function (request, status, error) {
          console.log(request.responseText);
        },
        success: function(html) {
          new Messi(html, options);
        }
      };

      $.ajax(request);

    }

  });

  // Export messi
  window.Messi = Messi;

  // jQuery wrapper
  $.fn.messi = function(options) {
    this.each(function() {
      new Messi(this.outerHTML, options);
    }).css("display", "none");
  };
}(jQuery));
