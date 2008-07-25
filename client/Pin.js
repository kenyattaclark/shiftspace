/*
  Class: Pin
    Convenience class for targeting nodes on a page. You can access the functionality via
    the singleton instance ShiftSpace.Pin
*/
var Pin = new Class({
  /*
    Property: toRef
      Takes a node and an action and returns a reference JSON which can be used
      to target this node later.
    
    Arguments:
      aNode - A DOM reference.
      action - a string, valid values are 'before', 'after,' 'replace', and 'relative'.
      
    Returns:
      A pin reference object.
  */
  toRef : function(aNode, action)
  {
    // find the first ancestor with an id
    var ancestor = null;
    var curNode = $(aNode);
    while(curNode != null &&
          curNode != document &&
          ancestor == null)
    {
      if(curNode.getProperty('id'))
      {
        ancestor = curNode;
      }
      else
      {
        curNode = $(curNode.getParent());
      }
    }
    
    // generate relative xpath if the ancestor and node are not the same
    var xpath = null;
    if(ancestor != aNode)
    {
      xpath = this.generateRelativeXPath(ancestor, aNode);
    }
    
    return {
      ancestorId : (ancestor && ancestor.getProperty('id')) || null,
      relativeXPath : xpath,
      action: action
    };
  },
  
  generateRelativeXPath : function(ancestor, aNode)
  {
    var xpath = '';
    while (aNode != ancestor && 
           aNode != document) 
    {
      var curNode = aNode;
      for (i = 0; curNode; )
      {
        if (curNode.nodeType == 1) i++;
        curNode = curNode.previousSibling;
      }

      xpath = '/*[' + i + ']' + xpath;
      aNode = aNode.parentNode;
    }

    return '.' + xpath;
  },
  
  /*
    Property: toNode
      Takes a pin reference JSON object and returns the targeted DOM node.
      
    Arguments:
      pinRef - a pin reference JSON object.
  */
  toNode : function(pinRef)
  {
    if(!pinRef || (pinRef.ancestorId && !pinRef.relativeXPath))
    {
      return null;
    }
    
    if(!pinRef.relativeXPath)
    {
      return $(pinRef.ancestorId);
    }
    else
    {
      var ancestor = (pinRef.ancestorId && $(pinRef.ancestorId)) || document;
      return $(document.evaluate( pinRef.relativeXPath, 
                                  ancestor, 
                                  null,
                                  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
                                  null).snapshotItem(0));
    }
  },
  
  /*
    Property: isValidRef
      Checks to see if the pinRef object actually points to a real node.
      
    Returns:
      a boolean.
  */
  isValidRef: function(pinRef)
  {
    if(!pinRef || (!pinRef.ancestorId && !pinRef.relativeXPath)) return false;
    var node = ShiftSpace.Pin.toNode(pinRef)
    return (node != null);
  }
});
ShiftSpace.Pin = new Pin();