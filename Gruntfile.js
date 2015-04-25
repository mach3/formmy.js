

module.exports = function(grunt){

	var files = [
		"src/extend.js",
		"src/formmy.js",
		"src/formmy.valid.js",
		"src/formmy.filter.js"
	];

	var banner = grunt.template.process(
		grunt.file.read("src/banner.js"),
		{data: grunt.file.readJSON("package.json")}
	);

	grunt.initConfig({
		uglify: {
			options: {
				preserveComments: "some",
				banner: banner
			},
			dev: {
				options: {
					sourceMap: true
				},
				files: {
					"dist/formmy.dev.js": files
				}
			},
			build: {
				files: {
					"dist/formmy.min.js": files
				}
			}
		},
		concat: {
			options: {
				banner: banner,
				separator: "\n;\n"
			},
			build: {
				files: {
					"dist/formmy.js": files
				}
			}
		},
		watch: {
			dev: {
				files: ["src/*.js"],
				tasks: ["uglify:dev"]
			}
		},
		connect: {
			dev: {
				options: {
					base: "./",
					port: 8080,
					keepalive: false
				}
			}
		}
	});

	grunt.registerTask("default", []);
	grunt.registerTask("dev", [
		"connect:dev",
		"watch"
	]);

	grunt.registerTask("build", [
		"uglify:build",
		"concat:build"
	]);

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-connect");

};