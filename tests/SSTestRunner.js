var SSTestRunner = new Class({
  
  Implements: [Events, Options],
  
  initialize: function()
  {
    this.loadPackages();
  },

  
  setPackages: function(packages)
  {
    this.__packages = packages;
  },
  
  
  packages: function()
  {
    return this.__packages;
  },
    
  
  loadPackages: function()
  {
    // load the package json
    new Request({
      url: "../config/packages.json",
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        this.setPackages(JSON.decode(responseText));
      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        console.error("Error: could not load packages.json file");
      }.bind(this)
    }).send();
  },
  
  
  loadTest: function(path)
  {
    // split the path components
    var components = path.split("/");
    var testname = components.getLast();
    var base = testname.split('.')[0];
    
    new Request({
      url: path,
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        // evaluate test
        eval(responseText);
        
        // load the class
        var testInstance = eval(base);
        
        new testInstance();
        
        $('SSSandalphonContainer').empty();
        
        // run all the tests
        SSUnitTest.main();
        SSUnitTest.outputResults(new SSUnitTest.ResultFormatter.BasicDOM($('SSSandalphonContainer')));
        //SSUnitTest.outputResults();
        SSUnitTest.reset();
        
      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        
      }.bind(this)
    }).send();
  },
  
  
  run: function()
  {
    
  }
  
});