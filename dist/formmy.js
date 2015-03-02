/*!
 *
 * Formmy.js
 * ---------
 * Front form validation interface
 *
 * @version 0.1.0
 * @license MIT
 * @author mach3<http://github.com/mach3>
 * @url http://github.com/mach3/formmy.js
 *
 */
(function(){

	/**
	 * Return formatted string
	 * @param {String} template
	 * @param {String...} value1, value2, value3 ...
	 * @returns {String}
	 */
	$._format = function(){
		var args = Array.prototype.slice.call(arguments);
		return args.shift().replace(/%s/g, function(){
			return args.length ? args.shift() : "";
		});
	};

	/**
	 * Juggle it to string
	 * @param {*} value
	 * @returns {String}
	 */
	$._toString = function(value){
		return (value === void 0 || value === null) ? "" : value.toString();
	};

	/**
	 * Serialize form element to an object
	 * @returns {Object}
	 */
	$.fn.serializeObject = function(){
		var data = {};
		$.each(this.serializeArray(), function(i, item){
			if(data[item.name] !== void 0){
				if($.type(data[item.name]) !== "array"){
					data[item.name] = [data[item.name]];
				}
				data[item.name].push(item.value);
				return;
			}
			data[item.name] = item.value;
		});

		return data;
	};

}());
;
(function($, global){

	/**
	 * Formmy Class
	 * ------------
	 * @constructor
	 * @class Form validation interface
	 * @param {HTML*Element} el
	 * @param {Object} options
	 * @param {Object} messages
	 */
	var Formmy = function(el, options, messages){
		this.init.apply(this, arguments);
	};

	(function(){
		var api = Formmy.prototype;

		// Events:
		api.EVENT_ERROR = "formmyError"; // Submitted and having validation error
		api.EVENT_SUBMIT = "formmySubmit"; // Submitted successfully

		// Defaults for options:
		api.defaults = {
			keyValidation: "validation", // data-* key for validation rules
			keyFor: "for", // data-* key for message container

			defaultMessage: "Invalid Input", // Default invalid message
			animateMessage: true, // Fade in message or not 
			animateMessageDuration: 300, // Animation duration for animating message

			classMessage: "message", // Class name for message
			classMessageError: "message-error", // Class name for error message
			classMessageEmpty: "message-empty", // Class name for empty message
			classMessageValid: "message-valid", // Class name for valid message

			classValid: "valid", // Class name for valid input
			classInvalid: "invalid", // Class name for invalid input

			validateOnBlur: false, // Validate when input is blur or not
			validateOnChange: true, // Validate when input content changed or not
			validateOnSubmit: true, // Validate on submit or not
			submitOnValid: false, // Submit form when it's all valid or not

			submitJSON: true // Submit json data or not
		};

		api.options = null;
		api.messages = null;
		api.rules = null;
		api.errors = null;

		api.$el = null;
		api.el = null;
		api.fields = null;

		api.init = function(el, options, messages){
			var o, my = this;

			this.delegate();

			// Configure
			this.config(options);
			this.messages = messages || {};
			o = this.config();

			// Nodes
			this.$el = $(el);
			this.el = this.$el.get(0);
			this.fields = this.$el.find("input[name], select[name], textarea[name]");

			// Initialize rule
			this.initRules();

			// Set events
			if(o.validateOnBlur){
				this.fields.on("blur", this._onAction);
			}
			if(o.validateOnChange){
				this.fields.on("change", this._onAction);
			}
			this.$el.on("submit", this._onSubmit);
		};

		/**
		 * Bind functions for handler
		 */
		api.delegate = function(){
			var my = this;
			$.each(this, function(key, value){
				if($.isFunction(value) && /^_/.test(key)){
					my[key] = $.proxy(value, my);
				}
			});
			return this;
		};

		/**
		 * Configure options
		 * @param {Object} options
		 * @returns {Object|Formmy}
		 */
		api.config = function(options){
			if(! this.options){
				this.options = $.extend(true, {}, this.defaults);
			}
			if(options === void 0){
				return this.options;
			}
			this.options = $.extend(true, this.options, options);
			return this;
		};

		/**
		 * Initialize all rules
		 */
		api.initRules = function(){
			var my, rules;

			my = this;
			rules = {};
			this.fields.each(function(){
				if(this.name in rules){ return; }
				rules[this.name] = my.parseRule(this);
			});
			this.rules = rules;
			return this;
		};

		/**
		 * Parse rule for the input element
		 * @param {HTML*Element} el
		 * @returns {Object} rules
		 */
		api.parseRule = function(el){
			var node, o, str;

			node = $(el);
			str = node.data(this.config().keyValidation);

			rules = {
				required: false,
				items: []
			};

			!! str && str.replace(/(\w+)(?:\((.+?)\))?/g, function(a, b, c){
				var args = [];
				if(b === "require"){
					rules.required = true;
					return;
				}
				if(!! c){
					$.each(c.split(","), function(i, v){
						v = $.trim(v);
						v = /^[\d]+$/.test(v) ? parseInt(v, 10) : v;
						args.push(v);
					});
				}
				rules.items.push({
					name: b,
					args: args
				});

			});

			return rules;
		};

		/**
		 * Validate all input
		 * - If toggleMessage is ommitted or false, this doesn't update messages
		 * @param {Boolean} toggleMessage
		 */
		api.validateAll = function(toggleMessage){
			var my, errors;

			errors = [];
			my = this;
			this.fields.each(function(){
				var e = my.validate(this);
				if(e){
					errors.push({
						name: this.name,
						error: e
					});
					if(toggleMessage){
						my.toggleMessage(this, e);
					}
				}
			});
			this.errors = errors;

			return ! errors.length;
		};

		/**
		 * Validate input element
		 * @param {HTML*Element} el
		 */
		api.validate = function(el){
			var my, name, data, error, rules, value;

			my = this;
			name = el.name;
			data = this.$el.serializeObject();
			error = false;
			rules = this.rules[name];
			value = data[name];

			if(! rules){
				return null;
			}

			if(! value){
				return rules.required ? this.getMessage(name, "require") : null;
			}

			$.each(rules.items, function(i, rule){
				var args = rule.args.slice();

				args = $.map(args, function(v){
					if(/^__.+?__$/.test(v)){
						v = v.replace(/(^__|__$)/g, "");
						v = data[v];
					}
					return v;
				});

				args = [value].concat(args);

				if(! Formmy.valid._call(rule.name, args)){
					error = my.getMessage(name, rule.name);
					return false;
				}
			});

			return error;
		};

		/**
		 * Get message by name, from this.messages
		 * @param {String} name
		 * @param {String} ruleName
		 * @returns {String}
		 */
		api.getMessage = function(name, ruleName){
			if(this.messages[name] && this.messages[name][ruleName]){
				return this.messages[name][ruleName];
			}
			return this.config().defaultMessage;
		};

		/**
		 * Toggle message for element
		 * @param {HTML*Element} el
		 * @param {String|Null|undefined} error
		 */
		api.toggleMessage = function(el, error){
			var o, node, message, changed;

			node = $(el);
			o = this.config();
			message = this.getMessageNode(el)
			changed = message.attr("class");

			message.toggleClass(o.classMessageValid, error === false)
			.toggleClass(o.classMessageEmpty, error === null)
			.toggleClass(o.classMessageError, !! error)
			.text(error === false ? "" : $._toString(error));

			changed = changed !== message.attr("class");

			node.toggleClass(o.classInvalid, !! error)
			.toggleClass(o.classValid, ! error);

			if(o.animateMessage && changed){
				message.hide().fadeIn(o.animateMessageDuration);
			}
		};

		/**
		 * Get message element linked to the el
		 * @param {HTML*Eleent} el
		 * @return {jQuery}
		 */
		api.getMessageNode = function(el){
			var o, node;

			o = this.config();
			node = this.$el.find("." + o.classMessage).filter(function(){
				return $(this).data(o.keyFor) === el.name;
			});

			if(! node.length){
				node = $("<span>").addClass(o.classMessage)
				.data(o.keyFor, el.name)
				.insertAfter(el);
			}

			return node;
		};

		/**
		 * Serialize form as object
		 * @returns {Object}
		 */
		api.serialize = function(){
			return this.$el.serializeObject();
		};

		/**
		 * Submit clone of the form
		 */
		api.request = function(){
			this.$el.clone().submit();
		};

		/**
		 * Submit by ajax
		 */
		api.ajax = function(){
			var o = this.config();
			return $.ajax({
				url: this.$el.prop("action"),
				type: this.$el.prop("method"),
				data: {
					data: o.submitJSON ? JSON.stringify(this.serialize()) : this.serialize()
				}
			});
		},

		/**
		 * Handler for blur/change event
		 * @param {Event} e
		 */
		api._onAction = function(e){
			var el = e.currentTarget;
			this.toggleMessage(el, this.validate(el));
		};

		/**
		 * Handler for submit event
		 * @param {Event} e
		 */
		api._onSubmit = function(e){
			var valid = this.validateAll(true);
			if(valid && this.config().submitOnValid){
				return true;
			}
			e.preventDefault();
			this.$el.trigger(valid ? this.EVENT_SUBMIT : this.EVENT_ERROR);
		};

	}());

	$.Formmy = Formmy;
	$.Formmy.instanceName = "formmyInstance";

	/**
	 * jQuery interface to initialize Formmy
	 * @param {Object} options
	 * @param {Object} messages
	 */
	$.fn.formmy = function(options, messages){
		var name = $.Formmy.instanceName;
		this.each(function(){
			var node = $(this);
			if(! node.data(name)){
				node.data(name, new $.Formmy(this, options, messages));
			}
		});
		return this;
	};

	/**
	 * jQuery interface to get Formmy instance (if initialized)
	 * @returns {Formmy|undefined}
	 */
	$.fn.getFormmy = function(){
		return this.data($.Formmy.instanceName);
	};

}(jQuery, this));
;
(function($){

	/**
	 * valid
	 */
	var valid = {

		/**
		 * Check if valid alphabetical string
		 * @param String value
		 */
		alpha: function(value){
			return (/^[a-zA-Z]*?$/).test(value);
		},

		/**
		 * Check if consits of alphabet and dash
		 * @param String value
		 */
		alphaDash: function(value){
			return (/^[\w\-]*?$/).test(value);
		},

		/**
		 * Check if consists of alphabet and number
		 * @param String value
		 */
		alphaNumeric: function(value){
			return (/^[a-zA-Z0-9]*?$/).test(value);
		},

		/**
		 * Check if valid color hex string
		 * @param String value
		 */
		colorHex: function(value){
			return (/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i).test(value);
		},

		/**
		 * Check if valid credit card number
		 * @param String value
		 */
		creditCard: function(value){
			return (/^[13456][\d]{13,15}$/).test(value);
		},

		/**
		 * Check if valid date
		 * Pass the expression for date format as string
		 * @param String value
		 * @param String pattern
		 */
		date: function(value, pattern){
			pattern = pattern || "^\\d{4}\/\\d{1,2}\/\\d{1,2}$";
			return this.regex(value, pattern);
		},

		/**
		 * Check if valid decimal string
		 * @param String value
		 * @param Integer places
		 * @param Integer digits
		 */
		decimal: function(value, places, digits){
			var p, d, pattern;

			p = places ? "{" + parseInt(places, 10) + "}" : "+";
			d = digits ? "{" + parseInt(digits, 10) + "}" : "+";
			pattern = "^[\\d]" + d + "(\.[\\d]" + p + ")?$";
			return this.regex(value, pattern);
		},

		/**
		 * Check if valid digit string
		 * @param String value
		 */
		digit: function(value){
			return (/^\d+$/).test(value);
		},

		/**
		 * Check if valid email address
		 * @param String value
		 */
		email: function(value){
			var u, d, a, reg;

			u = "[a-zA-Z0-9!#\\$%&`\\+\\-\\*\\/’\\^\\{\\}_]";
			d = "[a-zA-Z0-9\\-]";
			a = "^%s+(\\.%s+)*?@%s+(\\.%s+)*?$";
			reg = $._format(a, u, u, d, d);
			return this.regex(value, reg);
		},

		/**
		 * Check if the value equals to required
		 * @param String value
		 * @param String required
		 */
		equals: function(value, required){
			return value === required;
		},

		/**
		 * Check if length of string equals to the length
		 * @param String value
		 * @param Integer length
		 */
		exactLength: function(value, length){
			return value.length === length;
		},

		/**
		 * Check if the value equals to the name's one
		 * @param String value
		 * @param String name
		 * @param Object data
		 */
		matches: function(value, name, data){
			return value === data[name];
		},

		/**
		 * Check if value is not too long
		 * @param String value
		 * @param Integer length
		 */
		maxLength: function(value, length){
			return value.length <= length;
		},

		/**
		 * Check if value is long enough
		 * @param String value
		 * @param Integer length
		 */
		minLength: function(value, length){
			return value.length >= length;
		},

		/**
		 * Check if value is not empty
		 * @param String value
		 */
		notEmpty: function(value){
			return !! $._toString(value);
		},

		/**
		 * Check if value is numeric
		 * @param String value
		 */
		numeric: function(value){
			return /^(\-|\+)?\d+(\.\d+)?$/.test(value);
		},

		/**
		 * Check if valid phone number
		 * (only count the digit character)
		 * @param String value
		 * @param Integer min
		 * @param Integer max
		 */
		phone: function(value, min, max){
			value = $._toString(value).replace(/[^\d]/g, "");
			min = min || 10;
			max = max || 11;
			return this.rangeLength(value, min, max);
		},

		/**
		 * Check if value length in range
		 * @param String value
		 * @param Integer min
		 * @param Integer max
		 */
		length: function(value, min, max){
			return this.minLength(value, min) && this.maxLength(value, max);
		},

		/**
		 * Check if number in range
		 * @param String value
		 * @param Integer min
		 * @param Integer max
		 */
		range: function(value, min, max){
			value = new Number(value);
			return value >= min && value <= max;
		},

		/**
		 * Check if value is valid for expression
		 * @param String value
		 * @param String|Regex pattern
		 */
		regex: function(value, pattern){
			pattern = new RegExp(pattern);
			return pattern.test(value);
		},

		/**
		 * Check if valid url
		 * @param String value
		 */
		url: function(value){
			var scheme, ip, host, port, path

			scheme = "(https|http)\://";
			ip = "(\\d{1,3}(\\.\\d{1,3}){3})";
			host = "([a-z0-9\\-]+(\\.[a-z0-9\\-]+)*?)";
			port = "(:[\\d]{1,5})";
			path = "[^\\\\'\\|`\\^\"<>\\(\\)\\{\\}\\[\\]]+";
			return this.regex(
				value,
				$._format("^%s(%s|%s)(%s)?(%s)?$", scheme, ip, host, port, path)
			);
		},

		/**
		 * call method in member
		 */
		_call: function(method, args){
			if($.isFunction(this[method])){
				return this[method].apply(this, args);
			}
			return null;
		},

		/**
		 * add custom method
		 */
		_add: function(name, method, force){
			force = force || false;
			if(
				(! this.hasOwnProperty(name) || force) 
				&& ! /^_/.test(name) 
				&& $.isFunction(method)
			){
				this[name] = method;
				return true;
			}
			return false;
		}
	};

	$.extend($.Formmy, {
		valid: valid
	});

}(jQuery));