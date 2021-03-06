// ==Builder==
// @option
// @package           EventHandling
// ==/Builder==

// Set up event handlers, these should not be tied into core
window.addEvent('keydown', SSKeyDownHandler.bind(this));
window.addEvent('keyup', SSKeyUpHandler.bind(this));
window.addEvent('keypress', SSKeyPressHandler.bind(this));
window.addEvent('mousemove', SSMouseMoveHandler.bind(this));

// Used by keyboard handlers to maintain state information
var __keyState = {};

/*
  Function: SSKeyDownHandler
    Handles keydown events.

  Parameters:
    _event - generated by the Browser.
*/
function SSKeyDownHandler(_event) 
{
  var event = new Event(_event);
  var now = new Date();

  SSLog('SSKeyDownHandler');

  // Try to prevent accidental shift+space activation by requiring a 500ms
  // lull since the last keypress
  if (event.key == 'space' &&
      __keyState.keyDownTime &&
      now.getTime() - __keyState.keyDownTime < 500)
  {
    __keyState.keyDownTime = now.getTime();
    return false;
  }

  if (event.code != 16)
  {
    // Remember when last non-shift keypress occurred
    __keyState.keyDownTime = now.getTime();
  }
  else if (!__keyState.shiftPressed)
  {
    // Remember that shift is down
    __keyState.shiftPressed = true;
    // Show the menu if the user is signed in
    if (ShiftSpace.ShiftMenu)
    {
      __keyState.shiftMenuShown = true;
      ShiftSpace.ShiftMenu.show(__keyState.x, __keyState.y);
    }
  }

  // If shift is down and any key other than space is pressed,
  // then definately shiftspace should not be invocated
  // unless shift is let go and pressed again
  if (__keyState.shiftPressed &&
    event.key != 'space' &&
    event.code != 16)
  {
    __keyState.ignoreSubsequentSpaces = true;

    if (__keyState.shiftMenuShown)
    {
      __keyState.shiftMenuShown = false;
      ShiftSpace.ShiftMenu.hide();
    }
  }

  // Check for shift + space keyboard press
  if (!__keyState.ignoreSubsequentSpaces &&
    event.key == 'space' &&
    event.shift)
  {
    //SSLog('space pressed');
    // Make sure a keypress event doesn't fire
    __keyState.cancelKeyPress = true;

    // Toggle the console on and off
    if (__keyState.consoleShown)
    {
      __keyState.consoleShown = false;
      //SSLog('hide console!');
      if(ShiftSpace.Console) ShiftSpace.Console.hide();
    }
    else
    {
      // Check to see if there's a newer release available
      // There's probably a better place to put this call.
      if (SSCheckForUpdates()) {
        return;
      }
      //SSLog('show console!');
      __keyState.consoleShown = true;
      if(ShiftSpace.Console) ShiftSpace.Console.show();
    }

  }
  
  return true;
};


/*
  Function: SSKeyDownHandler
    Handles keyup events.
    
  Parameters:
    _event - generated by the Browser.
*/
function SSKeyUpHandler(_event) 
{
  var event = new Event(_event);
  // If the user is letting go of the shift key, hide the menu and reset
  if (event.code == 16) 
  {
    __keyState.shiftPressed = false;
    __keyState.ignoreSubsequentSpaces = false;
    ShiftSpace.ShiftMenu.hide();
  }
  
  return true;
}


/*
  Function: SSKeyPressHandler
    Handles keypress events.

  Parameters:
    _event - generated by the browser.
*/
function SSKeyPressHandler(_event)
{
  var event = new Event(_event);
  // Cancel if a keydown already picked up the shift + space
  if (__keyState.cancelKeyPress) 
  {
    __keyState.cancelKeyPress = false;

    event.stopPropagation();
    event.preventDefault();
  }
  
  return true;
}

/*
  Function: SSMouseMoveHandler
    Handles mouse events.
    
  Parameters:
    _event - generated by the browser.
*/
function SSMouseMoveHandler(_event) 
{
  var event = new Event(_event);
  __keyState.x = event.page.x;
  __keyState.y = event.page.y;

  if (event.shift) 
  {
    ShiftSpace.ShiftMenu.show(__keyState.x, __keyState.y);
  } 
  else if (ShiftSpace.ShiftMenu) 
  {
    ShiftSpace.ShiftMenu.hide();
  }
}

var SSNotificationCenterClass = new Class({
  Implements: [Events, Options]
});

var SSNotificationCenter = new SSNotificationCenterClass();