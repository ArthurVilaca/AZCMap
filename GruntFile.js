module.exports = function(grunt) {
  var config = 'backend/config/**/js';
  var api = 'backend/api/**/js';
  
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'frontend/assets/js/**/*.js', 'backend/*.js', config, api],
      options: {
        node: true,
        esversion: 6
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);

};