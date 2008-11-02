// ==Builder==
// @optional
// @name              SSException
// @package           System
// ==/Builder==

var SSException = new Class({
  
  name: 'SSException',
  
  initialize: function(_error)
  {
    this.theError = _error;
  },
  
  setMessage: function(msg)
  {
    this.__message__ = msg;
  },
  
  message: function()
  {
    return this.__message__ || (this.theError && this.theError.message) || 'n/a';
  },
  
  fileName: function()
  {
    return (this.theError && this.theError.fileName) || 'n/a';
  },

  lineNumber: function()
  {
    return (this.theError && this.theError.lineNumber) || 'n/a';
  },
  
  originalError: function()
  {
    return this.theError;
  },
  
  toString: function()
  {
    return ["[SSException] message:", this.message(), " fileName:", this.fileName(), " lineNumber:", this.lineNumber(), " objectId:", this.objectId].join(", ");
  }
  
});