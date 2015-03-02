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