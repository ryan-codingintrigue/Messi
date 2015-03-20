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
(function ($) {
    "use strict";
    var extend = function ( defaults, options ) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    var Messi = function (data, options) {
        // Extend our prototype with the options
        this.options = extend(Messi.prototype.options, options || {});
        // Create the main DOM element for this instance
        this.messi = document.createElement("div");
        this.messi.className = "messi";
        this.messi.innerHTML = this.template;
        // Set the HTML content of our instance
        this.setContent(data);

        // If the title is not set, remove the titlebox element
        if (this.options.title == null) {
            var titleBox = this.findElement(".messi-titlebox");
            if(titleBox) titleBox.parentElement.removeChild(titleBox);
        }
        else {
            // Otherwise add the title into the titlebox
            this.findElement(".messi-title").innerHTML = this.options.title;

            // If there are no buttons, autoclose is not set & the user wants a closeButton,
            // then add this into the titlebox
            if (this.options.buttons.length === 0 && !this.options.autoclose && this.options.closeButton) {
                // Create the close button
                var close = document.createElement("span");
                close.className = "messi-closebtn";
                close.addEventListener("click", function() {
                    this.hide();
                }.bind(this));
                // Find the titlebox & insert the close button before it
                var titleBox = this.findElement(".messi-titlebox");
                titleBox.parentElement.insertBefore(close,  titleBox);
            }

            // If the user specified a titlebox class, add it
            if (this.options.titleClass != null) {
                this.findElement(".messi-titlebox").className += " " + this.options.titleClass;
            }
        }

        // If the user specified a width, assign it to the outer box
        if (this.options.width != null) {
            this.findElement('.messi-box').style.width = this.options.width;
        }

        // If the user specified buttons...
        if (this.options.buttons.length > 0) {
            for (var i = 0; i < this.options.buttons.length; i++) {
                var button = this.options.buttons[i];
                // Generate a class for each button, if specified
                var cls = button["class"] ? button["class"] : "";
                // Generate the button DOM element
                var btnWrapper = document.createElement("div");
                btnWrapper.className = "btnbox";
                var btn = document.createElement("button");
                btn.className = "btn " + cls;
                btn.innerHTML = button.label;
                btnWrapper.appendChild(btn);
                // Bind onto the click for this button & pass through the value
                btn.addEventListener('click', (function (self, button) {
                    return function () {
                        var after;
                        if(button.clicked) after = button.clicked;
                        else if(self.options.callback) after = function() {
                            self.options.callback(button.val);
                        };
                        self.hide(after);
                    };
                }(this, button)));

                // Append the button to the action holder
                this.findElement('.messi-actions').appendChild(btnWrapper);
            }
        } else {
            // If no buttons are specified, remove the footbox
            var footBox = this.findElement(".messi-footbox");
            footBox.parentElement.removeChild(footBox);
        }

        // If the modal option is set, and no modal wrapper is already present,
        // then create one
        this.modal = null;
        if(this.options.modal) {
            this.modal = document.createElement("div");
            this.modal.className = "messi-modal";
            this.modal.style.opacity = this.options.modalOpacity;
            this.modal.style.width = document.documentElement.clientWidth;
            this.modal.style.height = document.documentElement.clientHeight;
            this.modal.style.zIndex = this.options.zIndex + document.querySelectorAll(".messi").length;
            document.body.appendChild(this.modal);
        }

        // If autoshow is set, show the dialog automatically
        if (this.options.show) this.show();

        // On window resize, trigger our resize event
        window.addEventListener('resize', this.resize.bind(this));

        // Set up autoclose if required
        if (this.options.autoclose != null) {
            setTimeout(function () {
                this.hide();
            }.bind(this), this.options.autoclose);
        }

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
            zIndex: 9000                            // message z-index
        },
        template: '<div class="messi-box"><div class="messi-wrapper"><div class="messi-titlebox"><span class="messi-title"></span></div><div class="messi-content"></div><div class="messi-footbox"><div class="messi-actions"></div></div></div></div>',
        content: '<div></div>',
        visible: false,

        findElement: function (selector) {
            return this.messi.querySelector(selector);
        },

        setContent: function (data) {
            var content = this.findElement(".messi-content");
            content.style.padding = this.options.padding;
            content.style.height = this.options.height;
            if(typeof(data) == "string" || data instanceof String) content.innerHTML = data;
            else content.appendChild(data);
        },

        viewport: function () {
            return {
                top: ((window.innerHeight - this.messi.clientHeight) / 2) + document.body.scrollTop + "px",
                left: ((window.innerWidth - this.messi.clientWidth) / 2) + document.body.scrollLeft + "px"
            };

        },

        show: function () {

            if (this.visible) return;

            if (this.options.modal && this.modal != null) this.modal.classList.add("shown");
            document.body.appendChild(this.messi);

            // obtenemos el centro de la pantalla si la opción de centrar está activada
            if (this.options.center) this.options.viewport = this.viewport(this.findElement(".messi-box"));
            this.messi.style.top = this.options.viewport.top;
            this.messi.style.left = this.options.viewport.left;
            this.messi.style.zIndex = this.options.zIndex + document.querySelectorAll(".messi").length;
            this.messi.classList.add("shown");

            this.visible = true;

        },

        hide: function (after) {

            if (!this.visible) return;

            this.messi.classList.remove("shown");
            setTimeout(function() {
                if (this.options.modal && this.modal != null) this.modal.classList.remove("shown");
                this.visible = false;
                if (after) after.call();
                if (this.options.unload) this.unload();
            }.bind(this), 300);

            return this;

        },

        resize: function () {
            if (this.options.modal) {
                this.modal.width = document.documentElement.clientWidth;
                this.modal.height = document.documentElement.clientHeight;
            }

            if (this.options.center) {
                this.options.viewport = this.viewport(this.findElement(".messi-box"));
                this.messi.style.top = this.options.viewport.top;
                this.messi.style.left = this.options.viewport.left;
            }
        },

        toggle: function () {
            this[this.visible ? 'hide' : 'show']();
            return this;
        },

        unload: function () {
            if (this.visible) this.hide();
            window.removeEventListener('resize', this.resize);
            this.messi.parentElement.removeChild(this.messi);
        }

    };

    // Static methods
    Messi.alert = function (data, callback, options) {

        var buttons = [{label: 'OK', val: 'OK'}];

        options = extend({
                closeButton: false, buttons: buttons, show: true, unload: true, callback: callback
            }, options || {}
        );

        return new Messi(data, options);
    };

    Messi.ask = function (data, callback, options) {

        var buttons = [
            {label: 'Yes', val: 'Y', "class": 'btn-success'},
            {label: 'No', val: 'N', "class": 'btn-danger'},
        ];

        options = extend({
                closeButton: false, modal: true, buttons: buttons, show: true, unload: true, callback: callback
            }, options || {}
        );

        return new Messi(data, options);

    };

    Messi.img = function (src, options, onComplete) {

        var img = new Image();
        img.addEventListener("load", function () {

            var vp = {width: window.innerWidth - 50, height: window.innerHeight - 50};
            var ratio = (this.width > vp.width || this.height > vp.height) ? Math.min(vp.width / this.width, vp.height / this.height) : 1;

            img.style.width = this.width * ratio;
            img.style.height = this.height * ratio;

            var opts = extend(options || {}, {
                title: "Image",
                show: true,
                unload: true,
                closeButton: true,
                width: this.width * ratio,
                height: this.height * ratio,
                padding: 0
            });
            var messi = new Messi(img, opts);
            if(typeof onComplete == "function") onComplete.call(messi);
        });
        img.addEventListener("error", function () {
            throw Error('Error loading image ' + src);
        });
        img.setAttribute("src", src);
    };

    Messi.load = function (url, options, onComplete) {
        var ajaxOptions = extend(options || {}, {show: true, unload: true});
        var requestParams = ajaxOptions["params"];
        var requestUri = url;
        if(typeof requestParams === "object") {
            var obj = extend(requestParams, {"___ts": new Date().getTime()});
            requestParams = Object.keys(obj).reduce(function(arr, key) {
                arr.push(key + "=" + encodeURIComponent(obj[key]));
                return arr;
            }, []).join("&");
        }
        requestUri += (~requestUri.indexOf("?") ? "&" : "?") + requestParams;
        var request = new XMLHttpRequest();
        request.addEventListener("load", function(e) {
            if(e.target.status === 200) {
                console.log(e.target.responseText);
                var messi = new Messi(e.target.responseText, ajaxOptions);
                if(typeof onComplete == "function") onComplete.call(messi);
            }
        });
        request.addEventListener("error", function(request) {
            throw Error(request.responseText);
        });
        request.open("GET", requestUri);
        request.send();
    };

    // Export messi
    window.Messi = Messi;

    if($) {
        // jQuery wrapper
        $.fn.messi = function (options) {
            this.each(function () {
                new Messi(this.outerHTML, options);
            }).css("display", "none");
        };
    }
}(window.jQuery));
