(function($){

    /**
     * filter
     */
    var filter = {

        /**
         * Search and replace from a string by regular expression
         * @param {String} value
         * @param {String} from
         * @param {String} to
         */
        regex: function(value, from, to){
            return value.replace(new RegExp(from, "g"), to);
        },

        /**
         * Search a string from value and replace with replacement
         * @param {String} value
         * @param {String} from
         * @param {String} to
         * @returns {String}
         */
        replace: function(value, from, to){
            return value.split(from).join(to);
        },

        /**
         * Remove the whitespace from the beginning and end of a string
         * @param {String} value
         * @returns {String}
         */
        trim: function(value){
            return value.replace(/(^\s+|\s+$)/g, "");
        },

        /**
         * Convert multibyte to singlebyte
         * @param {String} value
         * @returns {String}
         */
        zenhan: function(value){
            var map, values;
            map = {
                "han": [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 97, 98, 99, 100, 101, 102,
                    103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
                    116, 117, 118, 119, 120, 121, 122, 65, 66, 67, 68, 69, 70, 71, 72,
                    73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
                    90, 45, 94, 92, 33, 34, 35, 36, 37, 38, 39, 40, 41, 61, 126, 124,
                    96, 123, 43, 42, 125, 60, 62, 63, 95, 64, 91, 59, 58, 93, 44, 46,
                    47
                ],
                "zen": [65297, 65298, 65299, 65300, 65301, 65302, 65303, 65304, 65305,
                    65296, 65345, 65346, 65347, 65348, 65349, 65350, 65351, 65352,
                    65353, 65354, 65355, 65356, 65357, 65358, 65359, 65360, 65361,
                    65362, 65363, 65364, 65365, 65366, 65367, 65368, 65369, 65370,
                    65313, 65314, 65315, 65316, 65317, 65318, 65319, 65320, 65321,
                    65322, 65323, 65324, 65325, 65326, 65327, 65328, 65329, 65330,
                    65331, 65332, 65333, 65334, 65335, 65336, 65337, 65338, 65293,
                    65342, 65509, 65281, 8221, 65283, 65284, 65285, 65286, 8217, 65288,
                    65289, 65309, 65374, 65372, 65344, 65371, 65291, 65290, 65373,
                    65308, 65310, 65311, 65343, 65312, 65339, 65307, 65306, 65341,
                    65292, 65294, 65295
                ]
            };
            values = $.map(Array.prototype.slice.call(value), function(s){
                var index = $.inArray(s.charCodeAt(0), map.zen);
                if(index < 0){
                    return s;
                }
                return String.fromCharCode(map.han[index]);
            });
            return values.join("");
        }
    };

    $.extend($.Formmy, {
        filter: filter
    });

}(jQuery));