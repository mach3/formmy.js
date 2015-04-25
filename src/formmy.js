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
			keyFilter: "filter", // data-* key for filters
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
		api.filters = null;
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
		 * Initialize all rules and filters
		 */
		api.initRules = function(){
			var my, rules;

			my = this;
			rules = {};
			filters = {};
			this.fields.each(function(){
				if(! (this.name in rules)){
					rules[this.name] = my.parseRule(this);
				}
				if(! (this.name in filters)){
					filters[this.name] = my.parseFilter(this);
				}
			});
			this.rules = rules;
			this.filters = filters;
			return this;
		};

		/**
		 * Parse rule for the input element
		 * @param {HTML*Element} el
		 * @returns {Object} rules
		 */
		api.parseRule = function(el){
			var node, rules, str;

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
		 * Parse filter for the input element
		 * @param {HTML*Element} el
		 * @returns {Array}
		 */
		api.parseFilter = function(el){
			var node, filters, str;

			node = $(el);
			filters = [];
			str = node.data("filter");
			!! str && str.replace(/(\w+)(?:\((.+?)\))?/g, function(a, b, c){
				var args = [];
				if(!! c){
					$.each(c.split(","), function(i, v){
						v = $.trim(v);
						v = /^[\d]+$/.test(v) ? parseInt(v, 10) : v;
						args.push(v);
					});
				}
				filters.push({
					name: b,
					args: args
				});
			});

			return filters;
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

			this.filter(el);

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
		 * Filter input's value
		 * @param {HTML*Element} el
		 */
		api.filter = function(el){
			var value, filters;

			value = el.value;
			filters = this.filters[el.name];
			if(! filters){
				return;
			}
			$.each(filters, function(i, item){
				var args, filter;
				args = [value].concat(item.args);
				filter = $.Formmy.filter[item.name];
				if($.isFunction(filter)){
					value = filter.apply($.Formmy.filter, args);
				}
			});
			el.value = value;
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