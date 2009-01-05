// ==Builder==
// @uiclass
// @optional
// @name              SSCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(this.options.properties)
    {
      this.properties = this.options.properties;
    }
  },
  
  
  setData: function(data)
  {
    if(this.isLocked())
    {
      $H(data).each(function(value, property) {
        this.setProperty(property, value);
      }.bind(this));
    }
  },
  
  
  getData: function()
  {
    if(this.isLocked())
    {
      var args;
      if(arguments.length == 1 && $type(arguments[0]) == 'array')
      {
        args = $A(arguments[0]);
      }
      else if(arguments.length > 1)
      {
        args = $A(arguments);
      }
      return args.map(this.getProperty.bind(this));
    }
    return null;
  },
  
  
  setProperty: function(property, value)
  {
    var setter = 'set'+property.capitalize();
    if(this.isLocked() && this[setter])
    {
      this[setter](value);
    }
  },
  
  
  getProperty: function(property, value)
  {
    var getter = 'get'+property.capitalize();
    if(this.isLocked() && this[getter])
    {
      return this[getter];
    }
    return null;
  },
  
  /*
    Function: clone
      Creates a clone of the DOM model and returns it.
  */
  clone: function()
  {
    
  },
  
  /*
    Function: cloneWithData
      Creates a clone, locks it, modifies it's content
      and returns it.
  */
  cloneWithData: function(data)
  {
    var clone = this.clone();
    this.lock(clone);
    this.setData(data);
    this.unlock(clone);
    return clone;
  },

  /*
    Function: lock
      Lock the cell on a particular node.  Any setting of
      data on this controller will affect only that node.
      
    Parameters:
      element - a DOM node.
  */
  lock: function(element)
  {
    this.element = element;
  },

  /*
    Function: lock
      Unlock this cell.
  */
  unlock: function()
  {
    this.element = null;
  },


  isLocked: function()
  {
    return (this.element != null);
  },


  getParentRow: function()
  {
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});