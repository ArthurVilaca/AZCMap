module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  var config = 'backend/config/**/js';
  var api = 'backend/api/**/js';


  var dependenciesPath = [
    'frontend/bower_components/socket.io-client/socket.io.js',
    'frontend/bower_components/lodash/dist/lodash.min.js',
    'frontend/bower_components/jquery/dist/jquery.min.js',
    'frontend/bower_components/jquery-mobile-bower/min.js/jquery.mobile-1.4.5.min.js',
    'frontend/bower_components/angular/angular.min.js',
    'frontend/bower_components/angular-animate/angular-animate.min.js',
    'frontend/bower_components/angular-aria/angular-aria.min.js',
    'frontend/bower_components/angular-messages/angular-messages.min.js',
    'frontend/assets/js/vendor/angular-material.js',// For now we are using angular material from vendor folder, which have some fixes that are just on their master,
    'frontend/bower_components/highcharts/highcharts.js',
    'frontend/bower_components/highcharts-ng/dist/highcharts-ng.min.js',
    'frontend/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
    'frontend/bower_components/angular-google-maps/dist/angular-google-maps.min.js',
    'frontend/bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
    'frontend/assets/js/vendor/vs-repeat.js'
  ];

  var srcPath = [
    'frontend/assets/js/app.js'
  ];

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'frontend/assets/js/*.js', 'backend/*.js', config, api],
      options: {
        node: true,
        esversion: 6
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    concat: {
      main: {
        options: {
          process: function (src, filepath) {
            return '\n' + '// FILE: ' + filepath + '\n' + src;
          }
        },
        src: [dependenciesPath, srcPath],
        dest: 'frontend/assets/dist/main.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: false,
        screwIE8: true,
        report: 'min',
        // the banner is inserted at the top of the output
        banner: '/*! <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'frontend/assets/dist/main.min.js': [dependenciesPath, srcPath]
        }
      }
    },
  });

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};