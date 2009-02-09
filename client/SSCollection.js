// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

String.implement({
  assoc: function(value)
  {
    var result = {};
    result[this] = value;
    return result;
  }
});


Hash.implement({
  copy: function(value)
  {
    var copy = $H();
    this.each(function(value, key) {
      copy.set(value, key);
    });
    return copy;
  }
});


Hash.implement({
  choose: function(_properties)
  {
    var properties = $splat(_properties);
    return this.filter(function(value, key) {
      return properties.contains(key);
    });
  }
});


// ==============
// = Exceptions =
// ==============

var SSCollectionError = SSException;

SSCollectionError.NoName = new Class({
  name:"SSCollectionError.NoName",
  Extends: SSCollectionError,
  Implements: SSExceptionPrinter
});

// =========================
// = Collection Management =
// =========================

var SSCollections = $H()

function SSCollectionForName(name)
{
  return SSCollections.get(name);
}

function SSSetCollectionForName(collection, name)
{
  SSCollections.set(name, collection);
}

function SSClearCollections()
{
  SSCollections.empty();
}

// ====================
// = Class Definition =
// ====================

var SSCollection = new Class({

  Implements: [Events, Options],

  name: "SSCollection",
  
  defaults: function()
  {
    return {
      table: null,
      constraints: null,
      properties: [],
      orderBy: null,
      startIndex: null,
      range: null,
      delegate: null
    }
  },
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    
    // set the delegate
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    
    // TODO: shouldn't allow plugins from element, need a way to prevent - David
    this.setPlugins($H());

    // check if using array
    if(this.options.array)
    {
      this.setArray(this.options.array)
    }
    else if(this.options.table)
    {
      // real DB backend
      this.setLoadRefresh(true);
      this.setTable(this.options.table);
      this.setConstraints(this.options.constraints);
      this.setProperties(this.options.properties);
      this.setOrderBy(this.options.orderBy);
      this.setRange(this.options.range);
    }
    else
    {
      this.setArray([]);
    }
    
    if(name == null)
    {
      throw new SSCollectionError.NoName(new Error(), "collection instantiated without name.");
    }
    
    // a new collection
    this.setName(name);
    SSSetCollectionForName(this, name);
  },
  

  setPlugins: function(newPlugins)
  {
    this.__plugins = newPlugins;
  },
  
  
  plugins: function()
  {
    return this.__plugins;
  },
  
  
  pluginsForAction: function(action)
  {
    if(!this.plugins().get(action)) this.plugins().set(action, []);
    return $A(this.plugins().get(action));
  },

  
  addPlugin: function(actionType, plugin)
  {
    var pluginsForAction = this.pluginsForAction(actionType);
    pluginsForAction.push(plugin);
    this.plugins().set(actionType, pluginsForAction);
  },
  
  
  removePlugin: function(actionType, plugin)
  {
    // erase a plugin
    var pluginsForAction = this.pluginsForAction(actionType);
    this.plugins().set(actionType, pluginsForAction.erase(plugin));
  },
  
  
  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  
  
  delegate: function()
  {
    return this.__delegate;
  },
  
  
  setLoadRefresh: function(val)
  {
    this.__loadOnRefresh = val;
  },
  

  shouldLoadOnRefresh: function()
  {
    return this.__loadOnRefresh;
  },
  
  
  setName: function(name)
  {
    this.__name = name;
  },
  
  
  name: function()
  {
    return this.__name;
  },
  
  
  cleanObject: function(anObject)
  {
    return $H(anObject).filter(function(value, key) {
      return value != null;
    }).getClean();
  },
  
  
  cleanPayload: function(payload)
  {
    if($type(payload) == 'array')
    {
      return payload.map(this.cleanObject);
    }
    return this.cleanObject(payload);
  },
  
  
  transact: function(action, options)
  {
    var payload = {
      action: action,
      table: options.table,
      values: options.values,
      properties: options.properties,
      constraints: options.constraints,
      orderby: options.orderby,
      startIndex: options.startIndex,
      range: options.range
    };
    
    // allow the delegate to 
    var delegate = this.delegate();
    if(delegate && delegate.onTransact) payload = delegate.onTransact(this, payload);
    
    payload = this.cleanPayload(payload);
    
    SSCollectionsCall({
      desc: payload,
      onComplete: function(response) {
        var result = JSON.decode(response);
        var data = result.data;
        data = this.applyPlugins(action, data);
        // transform the data
        options.onComplete(data);
      }.bind(this),
      onFailure: options.onFailure
    });
  },
  
  
  applyPlugins: function(action, data)
  {
    var rdata = data;
    var pluginsForAction = this.pluginsForAction(action);
    
    if(pluginsForAction.length == 0) return rdata;

    var plugin = pluginsForAction.shift();
    while(plugin)
    {
      rdata = plugin(rdata);
      plugin = pluginsForAction.shift();
    }
    
    return rdata;
  },
  
  
  setTable: function(table)
  {
    this.__table = table;
  },
  
  
  table: function()
  {
    return this.__table;
  },
  
  
  setProperties: function(props)
  {
    this.__properties = props;
  },
  
  
  properties: function()
  {
    return this.__properties;
  },
  
  
  setOrderBy: function(orderBy)
  {
    this.__orderBy = orderBy;
  },
  

  orderBy: function()
  {
    return this.__orderBy;
  },
  
  
  setRange: function(range)
  {
    this.__range = range;
  },
  
  
  range: function()
  {
    return this.__range;
  },
  
  
  setConstraints: function(constraints)
  {
    this.__constraints = constraints;
  },
  
  
  constraints: function()
  {
    return this.__constraints;
  },
  
  
  setArray: function(array)
  {
    this.__array = array;
  },
  
  
  getArray: function()
  {
    return this.__array;
  },
  
  
  getColumn: function(col)
  {
    return this.getArray().map(function(x) {
      return x[col];
    });
  },
  
  
  get: function(index)
  {
    return this.__array[index];
  },
  
  
  push: function(object)
  {
    this.__array.push(object);
  },
  
  
  setMetadata: function(metadata)
  {
    this.__metadata = metadata;
  },
  
  
  metadata: function()
  {
    return this.__metadata;
  },
  
  
  length: function()
  {
    if(!this.__array) return 0;
    return this.__array.length;
  },
  
  
  add: function(obj)
  {
    this.__array.push(obj);
    
    this.fireEvent('onAdd');
    this.fireEvent('onChange');
  },
  
  
  remove: function(idx)
  {
    if(!this.table())
    { 
      this.__array.splice(idx, 1);
    }
    else
    {
      this.__array.splice(idx, 1);
      this.fireEvent('onChange');
    }
  },
  
  
  insert: function(obj, idx)
  {
    this.__array.splice(idx, 0, obj);
    
    this.fireEvent('onInsert', {object:obj, index:idx});
    this.fireEvent('onChange');
  },
  
  
  move: function(fromIndex, toIndex)
  {
    this.fireEvent('onMove', {from:fromIndex, to:toIndex});
  },
  
  
  set: function(obj, index)
  {
    this.__array[index] = obj;
  },
  
  
  loadIndex: function(index, count)
  {

  },
  
  
  read: function()
  {
    this.transact('read', {
      table: this.table(),
      constraints: this.constraints(),
      properties: this.properties(),
      onComplete: this.onRead.bind(this)
    });
  },
  
  
  create: function(data)
  {
    this.transact('create', {
      table: this.table(),
      values: data,
      onComplete: this.onCreate.bind(this)
    });
  },
  
  
  query: function(queryFn, properties)
  {
    return this.getArray().filter(queryFn).map(function(obj) {
      return $H(obj).choose(properties).getClean();
    });
  },
  
  
  indexWhere: function(fn, properties)
  {
    var ary = this.getArray();
    for(var i = 0, len = ary.length; i < len; i++)
    {
      if(fn(ary[i])) return i;
    }
    return -1;
  },
  
  
  'delete': function(index)
  {
    this.transact('delete', {
      table: this.table(),
      constraints: $merge(this.constraints(), {
        id: this.get(index).id
      }),
      onComplete: function(data) {
        this.onDelete(data, index);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    });
  },
  
  
  update: function(data, index)
  {
    this.transact('update', {
      table: this.table(),
      values: data,
      constraints: $merge(this.constraints(), {
        id: this.get(index).id
      }),
      onComplete: function(rx) {
        this.onUpdate(data, index);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    });
  },
  
    
  onFailure: function(action, data, index)
  {
    
  },
  
  
  onRead: function(data)
  {
    this.setArray(data);
    this.fireEvent('onLoad');
  },
  
  
  onCreate: function(data)
  {
    this.fireEvent('onCreate', data);
  },
  
  
  onDelete: function(data, index)
  {
    // synchronize internal
    this.remove(index);
    this.fireEvent('onDelete', index);
  },
  
  
  onUpdate: function(data, index)
  {
    this.__array[index] = $merge(this.__array[index], data);
    this.fireEvent('onUpdate', index);
  },
  
  
  each: function(fn)
  {
    this.__array.each(fn);
  },
  
  
  updateConstraints: function(constraint, value)
  {
    this.setConstraints($merge(this.constraints(), constraint.assoc(value)));
    this.read();
  }

});