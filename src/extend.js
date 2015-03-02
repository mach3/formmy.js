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