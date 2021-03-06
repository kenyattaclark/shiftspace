// ==Builder==
// @optional
// @name              UtilityFunctions
// @package           Core
// ==/Builder==


/*

Function: info
Provides basic information about ShiftSpace's current state.

Parameters:
    spaceName - (optional) Get information about a specific installed space.

Returns:
    When no parameter is specified, returns an object with the following
    variables set:

    - server (string), the base URL of the ShiftSpace server
    - spaces (string), a list of currently installed spaces
    - version (string), the current version of ShiftSpace

    If spaceName is specified, returns the following information about the
    space:

    - title (string), a human-readable version of the space name
    - icon (string), the URL of the Space's icon
    - version (string), the current version of the installed Space

*/
function SSInfo(spaceName) 
{
  if (typeof spaceName != 'undefined') 
  {
    var defaults = {
      title: spaceName,
      icon: server + 'images/unknown-space.png',
      version: '1.0'
    };
    if (!installed[spaceName]) 
    {
      defaults.unknown = true;
      return defaults;
    }
    // TODO - this must be fixed, we need to cache space attributes - David
    defaults.icon = server + 'spaces/' + spaceName + '/' + spaceName + '.png';
    //var spaceInfo = $merge(defaults, spaces[spaceName].attributes);
    var spaceInfo = $merge(defaults, {});
    delete spaceInfo.name; // No need to send this back
    spaceInfo.url = installed[spaceName];
    return spaceInfo;
  }
  if(typeof installed != 'undefined')
  {
    var spaceIndex = [];
    for (var aSpaceName in installed) 
    {
      spaceIndex.push(aSpaceName);
    }
  }
  return {
    server: server,
    spacesDir: (typeof spacesDir != 'undefined' && spacesDir) || null,
    spaces: (spaceIndex && spaceIndex.join(', ')) || null,
    version: (typeof version != 'undefined' && version) || null
  };
};

// ===============================
// = Function Prototype Helpers  =
// ===============================

// This won't work for GM_getValue of course - David
Function.prototype.safeCall = function() {
  var self = this, args = [], len = arguments.length;
  for(var i = 0; i < len; i++) args.push(arguments[i]);
  setTimeout(function() {
    return self.apply(null, args);
  }, 0);
};

// Work around for GM_getValue - David
Function.prototype.safeCallWithResult = function() {
  var self = this, args = [], len = arguments.length;
  for(var i = 0; i < len-1; i++) args.push(arguments[i]);
  // the last argument is the callback
  var callback = arguments[len-1];
  setTimeout(function() {
    callback(self.apply(null, args));
  }, 0);
};

/*
  Function: SSHasProperty
    Convenience function to check whether an object has a property.

  Parameters:
    obj - an Object.
    prop - the property name as a string.

  Returns:
    a boolean.
*/
function SSHasProperty(obj, prop)
{
  return (typeof obj[prop] != 'undefined');
}

/*
  Function: SSImplementsProtocol
    A method to check if an object implements the required properties.

  Parameters:
    protocol - an array of required properties
    object - the javascript object in need of verification.

  Returns:
    A javascript object that contains two properties, 'result' which is a boolean and 'missing', an array of missing properties.
*/
function SSImplementsProtocol(protocol, object)
{
  var result = true;
  var missing = [];
  for(var i = 0; i < protocol.length; i++)
  {
    var prop = protocol[i];
    if(!object[prop])
    {
       result = false;
       missing.push(prop);
    }
  }
  return {'result': result, 'missing': missing};
}

var __dragDiv__;
function SSCreateDragDiv()
{
  __dragDiv__ = new ShiftSpace.Element('div', {
    id: 'SSDragDiv'
  });
}

function SSAddDragDiv()
{
  $(document.body).grab(__dragDiv__);
}

function SSRemoveDragDiv()
{
  __dragDiv__ = __dragDiv__.dispose();
}

function SSLocalizedStringSupport()
{
  return (typeof __sslang__ != 'undefined');
}

// Localized String Support
function SSLocalizedString(string)
{
  if(SSLocalizedStringSupport() && ShiftSpace.localizedStrings[string]) return ShiftSpace.localizedStrings[string];
  return string;
}

function SSSetDefaultEmailComments(value)
{
  if(value)
  {
    __defaultEmailComments__ = value;
    SSSetPref('defaultEmailComments', __defaultEmailComments__);
  }
}

function SSGetDefaultEmailComments(checkPref)
{
  // NOTE: 2 because we can't store 0s in the DB when in the sandbox, 1 = false, 2 = true in this case - David
  return (checkPref && SSGetPref('defaultEmailComments', 2) || __defaultEmailComments__);
}

function SSHasResource(resourceName)
{
  return __sysavail__.files.contains(resourceName) || __sysavail__.packages.contains(resourceName);
}

function SSResourceExists(resourceName)
{
  return __sys__.files[resourceName] != null || __sys__.packages[resourceName] != null;
}

/*
  Function: SSCheckForAutolaunch
    Check for Spaces which need to be auto-launched.
*/
function SSCheckForAutolaunch()
{
  for(space in installed)
  {
    if(SSGetPrefForSpace(space, 'autolaunch'))
    {
      var ids = SSAllShiftIdsForSpace(space);
      var spaceObject = SSSpaceForName(space);

      // in the case of the web we need to load the space first
      if(!spaceObject)
      {
        // load the space first
        SSLoadSpace(space, function() {
          ids.each(SSShowShift);
        });
        return;
      }
      else
      {
        // otherwise just show the puppies, this works in the sandbox
        ids.each(SSShowShift);
      }
    }
  }
}

function SSResetCore()
{
  // reset all internal state
  __spaces__ = {};
}