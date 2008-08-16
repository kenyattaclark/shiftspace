var SSConsole = new Class({
  
  name: "SSConsole",
  
  Extends: SSView,
  

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  awake: function()
  {
    this.parent();

    this.outlets().get('clickMeButton').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('Button clicked!');
    });
    
    this.outlets().get('AllShiftsView').setDelegate(this);
  },
  
  
  userClickedRow: function(data)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + data);
  },
  
  
  awakeDelayed: function()
  {
    this.outlets().get('cool').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('cool button clicked!');
    });
  }
  
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}