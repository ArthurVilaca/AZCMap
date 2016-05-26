module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  var config = 'backend/config/**/js';
  var api = 'backend/api/**/js';


  var dependenciesPath = [
    'frontend/bower_components/socket.io-client/socket.io.js',
    'frontend/bower_components/lodash/dist/lodash.js',
    'frontend/bower_components/jquery/dist/jquery.js',
    'frontend/bower_components/jquery-mobile-bower/js/jquery.mobile-1.4.5.js',
    'frontend/bower_components/angular/angular.js',
    'frontend/bower_components/angular-animate/angular-animate.js',
    'frontend/bower_components/angular-aria/angular-aria.js',
    'frontend/bower_components/angular-messages/angular-messages.js',
    'frontend/assets/js/vendor/angular-material.js',//For now we are using angular material from vendor, which have some stuff that are just on their master
    'frontend/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
    'frontend/bower_components/angular-google-maps/dist/angular-google-maps.js',
    'frontend/bower_components/angular-simple-logger/dist/angular-simple-logger.js',
    'frontend/bower_components/Chart.js/Chart.js',
    'frontend/bower_components/angular-chart.js/dist/angular-chart.js',
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