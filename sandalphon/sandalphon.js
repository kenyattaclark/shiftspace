window.addEvent('domready', function() {
  // load the local store
  var Sandalphon = new SandalphonClass(new Persist.Store('Sandalphon'));
});

var SandalphonClass = new Class({
  
  UIClassPaths:
  {
    'SSTabView' : '/client/views/SSTabView/'
  },


  initialize: function(storage)
  { 
    console.log('Sandalphon, sister of Metatron, starting up.');
    this.setStorage(storage);
    
    this.setupClassPaths();

    // for analyzing fragments
    this.setFragment(new Element('div'));

    this.attachEvents();
  },
  
  
  setupClassPaths: function()
  {
    // initialize the UIClassPaths var
    this.storage().get('UIClassPaths', function(ok, value) {
      if(ok)
      {
        /*
        if(!value)
        {
        */
          console.log('Initializing class paths.');
          this.storage().set('UIClassPaths', JSON.encode(this.UIClassPaths))
        /*}
        else
        {
          console.log('Loading class paths.');
          this.UIClassPaths = JSON.decode('('+value+')');
        }*/
        this.loadClassFiles();
      }
    }.bind(this));
  },
  
  
  loadClassFiles: function()
  {
    for(class in this.UIClassPaths)
    {
      var path = '../' + this.UIClassPaths[class] + class;
      new Asset.css(path+'.css');
      new Asset.javascript(path+'.js');
    }
    console.log('Class files loaded.');
  },
  
  
  storage: function()
  {
    return this.__storage__;
  },
  
  
  setStorage: function(storage)
  {
    this.__storage__ = storage;
  },
  
  
  attachEvents: function()
  {
    // attach file loading events
    $('loadFileInput').addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'enter')
      {
        this.loadFile($('loadFileInput').getProperty('value'));
      }
    }.bind(this));
    
    $('loadFile').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.loadFile($('loadFileInput').getProperty('value'));
    }.bind(this));
  },
  
  
  fragment: function()
  {
    return this.__fragment__;
  },
  
  
  setFragment: function(frag)
  {
    this.__fragment__ = frag;
  },


  loadFile: function(path)
  {
    // load the interface file
    new Request({
      url:  '../'+path,
      method: 'get',
      onSuccess: function(responseText, responseXML)
      {
        if(this.analyze(responseText))
        {
          $('SSSandalphonContainer').set('html', responseText);
          this.instantiateControllers();
        }
        else
        {
          console.error('Error loading interface.');
        }
      }.bind(this),
      onFailure: function()
      {
        console.error('Oops could not load that file');
      }
    }).send();
  },


  compile: function(className)
  {
    // ask the server to compile the file
    // they will be generated and added to a folder called views
    // the class will implement the interface as a new method
  },
  

  toggledCompiled: function()
  {
    
  },
  
  
  searchForClass: function()
  {
    
  },
  
  
  instantiateControllers: function()
  {
    console.log('Instantiating controllers for views.');
    var views = $('SSSandalphonContainer').getElements('*[uiclass]');
    views.each(function(aView) {
      new ShiftSpace.UI[aView.getProperty('uiclass')](aView);
    });
  },
  
  
  analyze: function(html)
  {
    this.fragment().set('html', html);
    
    var allNodes = this.fragment().getElements('*[uiclass]');
    
    console.log('////////////////////////////// SANDALPHON ANALYZE');
    
    var classes = allNodes.map(function(x){return x.getProperty('uiclass')});
    
    // First verify that we have a real path for each class
    console.log(classes);
    var missingClasses = false;
    classes.each(function(x) {
      missingClasses = (this.UIClassPaths[x] == null);
    }.bind(this));
    
    if(missingClasses)
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  
  
});