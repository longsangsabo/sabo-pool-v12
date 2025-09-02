// Simple Flutter Web Loader for SABO Pool Arena
(function() {
  'use strict';

  console.log('SABO Pool Arena - Flutter Loader initializing...');

  // Basic Flutter configuration
  window._flutter = window._flutter || {};
  
  // Set minimal build config
  window._flutter.buildConfig = {
    engineRevision: "stable",
    builds: [{
      compileTarget: "dart2js",
      renderer: "html"
    }]
  };

  // Simple loader implementation
  window._flutter.loader = {
    load: function(config) {
      console.log('Flutter loader starting...');
      config = config || {};
      
      return Promise.resolve({
        initializeEngine: function() {
          console.log('Flutter engine starting...');
          return Promise.resolve({
            runApp: function() {
              console.log('SABO Pool Arena launching...');
              
              // Load the main Dart app
              const script = document.createElement('script');
              script.src = 'main.dart.js';
              script.onload = function() {
                console.log('SABO Pool Arena loaded successfully!');
                if (window.main && typeof window.main === 'function') {
                  window.main();
                }
              };
              script.onerror = function() {
                console.error('Failed to load main.dart.js');
              };
              document.head.appendChild(script);
              
              return Promise.resolve();
            }
          });
        }
      });
    }
  };

  console.log('Flutter loader ready for SABO Pool Arena');

})();
