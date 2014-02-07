module.exports = function(grunt) {
	var config = {
		jsLibs: 'meteor-app/client/js/lib',
		jsSrc: 'meteor-app/client/js/src',
		jsDest: 'meteor-app/client/js/dest',
		cssSrc: 'meteor-app/client/css',
		cssDest: 'meteor-app/client/css'
	};
	
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		config: config,
		pkg: grunt.file.readJSON('package.json'),
		banner: '/* <%= pkg.name %> - <%= pkg.version %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.author.name %> - <%= pkg.author.url %> */\n\n',
		autoprefixer: {
			dist: {
				options: {
					browsers: ['last 2 version', '> 1%', 'ie 8']
				},
				files: {
					'<%= config.cssDest %>/style.css': ['<%= config.cssDest %>/style.css']
				}
			}
		},
		cssmin: {
			options: {
				banner: '<%= banner %>'
			},
			files: {
				src: '<%= config.cssDest %>/style.css',
				dest: '<%= config.cssDest %>/style.css'
			}
		},
		jshint: {
			files: ['<%= config.jsSrc %>/*.js', '<%= config.jsSrc %>/**/*.js'],
			options: {
				force: true
			}
		},
		less: {
			options: {
				yuicompress: true
			},
			files: {
				src: "<%= config.cssSrc %>/style.less",
				dest: "<%= config.cssDest %>/style.css"
			}
		},
		watch: {
			js: {
				files: ['<%= config.jsSrc %>/*.js', '<%= config.jsSrc %>/**/*.js', '<%= config.jsLibs %>/*.js'],
				tasks: ['jshint']
			},
			less: {
				files: ["<%= config.cssSrc %>/*.less", "<%= config.cssSrc %>/**/*.less"],
				tasks: ['less', 'autoprefixer', 'cssmin']
			}
		},
		retire: {
			js: ['meteor-app/client/js/lib/*'],
			options: {}
		}
	});

	grunt.registerTask('default', ['jshint', 'less', 'autoprefixer', 'cssmin', 'retire', 'watch']);
};