var path = require('path');
var Fmd = require('fmd');

module.exports = function(grunt) {
  grunt.registerMultiTask('modularize', 'Create AMD.js module', function() {
    var opts = this.options();
    var done = this.async();
    var f = this.files[0];
    var defines = opts.defines;
    var fmd = Fmd({ target: f.dest, factories: opts.factories, amd_not_anonymous: opts.amd_not_anonymous });

    defines.forEach(function(d) {
      fmd = fmd.define.apply(fmd, d);
    });

    fmd.build(done);
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['tmp'],
      release: ['dist'],
    },

    modularize: {
      all: {
        options: {
          factories: ['amd'],
          amd_not_anonymous: true,
          defines: [
            ['jsbn/jsbn', ['jsbn.js'], { exports: 'BigInteger' }],
            ['jsbn/jsbn2', ['jsbn2.js'], { depends: { "jsbn/jsbn": 'BigInteger' }, exports: 'BigInteger' }],
            ['jsbn/prng4', ['prng4.js'], { exports: 'prng_newstate' }],
            ['jsbn/rng', ['rng.js'], { depends: { "jsbn/prng4": 'prng_newstate' }, exports: 'SecureRandom' }],
            ['jsbn/rsa', ['rsa.js'], { depends: { "jsbn/jsbn": 'BigInteger', "jsbn/rng": 'SecureRandom' }, exports: 'RSAKey' }],
            ['jsbn/rsa2', ['rsa2.js'], { depends: { "jsbn/jsbn2": 'BigInteger', "jsbn/rsa": 'RSAKey' }, exports: 'RSAKey' }],
            ['jsbn/ec', ['ec.js', 'sec.js', 'ec-ext.js'], { depends: { "jsbn/jsbn2": 'BigInteger' }, exports: 'ECCurveFp' }],
          ]
        },
        src: '{ec,jsbn,jsbn2,prng4,rng,rsa,rsa2,sec}.js',
        dest: 'tmp/mod/'
      }
    },

    concat: {
      all: {
        src: 'tmp/mod/jsbn/*.js',
        dest: 'dist/jsbn.amd.js'
      },

      bn: {
        src: 'tmp/mod/jsbn/jsbn.js',
        dest: 'dist/jsbn-bn.amd.js'
      },

      bn2: {
        src: 'tmp/mod/jsbn/{jsbn,jsbn2}.js',
        dest: 'dist/jsbn-bn2.amd.js'
      },

      rsa: {
        src: 'tmp/mod/jsbn/{prng4,rng,jsbn,rsa}.js',
        dest: 'dist/jsbn-rsa.amd.js'
      },

      rsa2: {
        src: 'tmp/mod/jsbn/{prng4,rng,jsbn,jsbn2,rsa,rsa2}.js',
        dest: 'dist/jsbn-rsa2.amd.js'
      },

      ec: {
        src: 'tmp/mod/jsbn/{jsbn,jsbn2,ec}.js',
        dest: 'dist/jsbn-ec.amd.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('build', ['clean', 'modularize', 'concat']);
  grunt.registerTask('default', ['build']);
};
