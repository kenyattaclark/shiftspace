var HighlightsSpace = new Class({
  Extends: ShiftSpace.Space,

  attributes:
  {
    name: 'Highlights',
    version: 0.1,
    icon: 'Highlights.png',
    css: 'spaces/Highlights/Highlights.css'
  },


  setup: function()
  {
    // we can longer use bound functions as event handlder in FF3
    // bound functions will throw a security error. Instead we just
    // manually create a closure.

    var self = this;

    this.mousemove = function(e) {
      self.cursor.style.left = (e.pageX + 6) + 'px';
      self.cursor.style.top = (e.pageY - 8) + 'px';
    };

    this.mousedown = function(e) {
      self.cursor.style.display = 'none';
    };

    this.highlight_end = function(e) {

      if ($(e.target).hasClass('ShiftSpaceElement')) return;

      if (!window.getSelection().getRangeAt(0).collapsed)
      {
        self.cursor.style.display = 'block';
        var range = window.getSelection().getRangeAt(0);
        var newRangeRef = ShiftSpace.RangeCoder.toRef(range);
        newRangeRef.color = self.color;
        if (!self.getCurrentShift().ranges)
        self.getCurrentShift().ranges = [];

        if (self.summary.value == '')
        self.summary.value = range.toString();

        self.getCurrentShift().ranges.push(newRangeRef);
        self.turnOnRangeRef(newRangeRef);
      }

      return false;
    };
  },


  showShift: function(aShift)
  {
    var currentShift = this.getCurrentShift();
    if(currentShift) currentShift.hide();

    this.parent(aShift);
  },


  onShiftShow: function(shiftId)
  {
    if(this.interfaceIsBuilt())
    {
      var title = this.getShift(shiftId).getTitle();
      $$('.HighlightsInput')[0].setProperty('value', title);
    }
  },


  selectColor: function(colorElement, color)
  {
    if (!color)
    this.color = $(colorElement).getStyle('border-bottom-color');
    else
    this.color = color;

    if (this.colorElement)
    {
      this.colorElement.style.borderBottomStyle = 'none';
    }

    this.colorElement = colorElement;
    colorElement.style.borderBottomStyle = 'solid';
  },


  addColor: function(style, selectedColor)
  {
    var self = this;

    var colorElement = new ShiftSpace.Element('span', {
      'class': 'GenericHighlightsColor ' + style
    });
    colorElement.injectInside(this.colorsSpan);

    colorElement.addEvent('click', function(e) {
      self.selectColor(e.target);
    });

    if (selectedColor) this.selectColor(colorElement, selectedColor);
  },


  showInterface: function()
  {
    // need to call the parent first
    this.parent();

    if(this.container)
    {
      this.container.removeClass('SSDisplayNone');
      this.cursor.setStyle('display', 'block');
    }

    this.addHighlightEvents();
  },


  hideInterface: function()
  {
    // call the parent first
    this.parent();

    if(this.container)
    {
      this.container.addClass('SSDisplayNone');
      this.cursor.setStyle('display', 'none');
    }

    this.removeHighlightEvents();
  },


  addHighlightEvents: function()
  {
    // we need to add mouse listening events here
    window.addEvent('mousemove', this.mousemove);
    window.addEvent('mousedown', this.mousedown);
    window.addEvent('mouseup', this.highlight_end);
  },


  removeHighlightEvents: function()
  {
    // remove the mouse events
    window.removeEvent('mousemove', this.mousemove);
    window.removeEvent('mousedown', this.mousedown);
    window.removeEvent('mouseup', this.highlight_end);
  },


  getTitle: function()
  {
    return $$('.HighlightsInput')[0].getProperty('value');
  },


  buildInterface: function()
  {
    // create a table to function as the highlight tool bar
    var tableContainer = new ShiftSpace.Element('span', {
      'class': 'TableContainer'
    });

    tableContainer.appendChild(new ShiftSpace.Element('span', {
      'class': 'HighlightsSummary'
    }));

    this.summary = tableContainer.appendChild(new ShiftSpace.Element('input', {
      'class': 'HighlightsInput'
    }));

    this.colorsSpan = new ShiftSpace.Element('span', {
      'class': 'HighlightsColors'
    });

    document.body.appendChild(tableContainer);
    tableContainer.appendChild(this.colorsSpan);

    this.addColor('HighlightsColor1', '#FF0'); // hack!
    // try to see why getComputedStyle in selectColor doesn't work
    // the first time!

    this.addColor('HighlightsColor2');
    this.addColor('HighlightsColor3');
    this.addColor('HighlightsColor4');
    this.addColor('HighlightsColor5');
    this.addColor('HighlightsColor6');

    var closeButton = new ShiftSpace.Element('span', {
      'class': 'HighlightsClose'
    });

    closeButton.addEventListener('click', this.cancel.bind(this), false);
    tableContainer.appendChild(closeButton);

    var saveButton = new ShiftSpace.Element('button', {
      'class': 'HighlightsGenericButton HighlightsSaveButton'
    });

    saveButton.appendText('Save highlight');
    saveButton.addEventListener('click', this.save.bind(this), false);
    tableContainer.appendChild(saveButton);

    var cancelButton = new ShiftSpace.Element('button', {
      'class': 'HighlightsGenericButton HighlightsCancelButton'
    });

    cancelButton.appendText('Cancel');
    cancelButton.addEventListener('click', this.cancel.bind(this), false);
    tableContainer.appendChild(cancelButton);

    this.container = tableContainer;

    this.cursor = new ShiftSpace.Element('span', {
      'id': 'HighlightsCursor'
    });

    this.cursor.injectInside(document.body);
  },


  surround_text_node: function(oNode, objRange, surroundingNode)
  {
    var tempRange;
    //SSLog(surroundingNode);

    //if this selection starts and ends in teh same node
    if((oNode==objRange.startContainer) &&
    (oNode==objRange.endContainer))
    {
      objRange.surroundContents(surroundingNode);
    }
    else
    {
      if(objRange.isPointInRange(oNode,1) || oNode==objRange.startContainer)
      {
        //check if the node is in the middle of the selection
        if((oNode!=objRange.startContainer)&&(oNode!=objRange.endContainer))//surround the whole node
        {
          surroundingNode.textContent = oNode.textContent;
          oNode.parentNode.replaceChild(surroundingNode, oNode);
        }
        else //if start at suppply surround text from start point to end
        if(oNode==objRange.startContainer)//surround the node from the start point
        {
          tempRange = document.createRange();
          tempRange.setStart(oNode, objRange.startOffset);
          tempRange.setEnd(oNode, oNode.textContent.length);
          tempRange.surroundContents(surroundingNode);
        }
        else      //if endAt supply surround text node from 0 to End location
        if(oNode==objRange.endContainer)//surround the node from the start point
        {
          tempRange = document.createRange();
          tempRange.setStart(oNode, 0);
          tempRange.setEnd(oNode, objRange.endOffset);
          tempRange.surroundContents(surroundingNode);
        }
      }
    }
  },


  turnOnRangeRef: function(ref)
  {
    var range = ShiftSpace.RangeCoder.toRange(ref);

    // check to make sure the range is actually valid
    if(range)
    {
      var objAncestor = range.commonAncestorContainer;

      if (objAncestor.nodeType == 3) // text node
      objAncestor = objAncestor.parentNode;

      var xPathResult = document.evaluate(".//text()", objAncestor, null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      // iteratate on all the text nodes in the document and mark if they are in the selection range
      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++)
      {
        String.clean(xPathResult.snapshotItem(i).textContent);
      }

      for (i = 0, l = xPathResult.snapshotLength; i < l; i++)
      {
        // we need clean styles so we don't use ShiftSpace.Element
        var enclosingSpan = document.createElement("span");
        enclosingSpan.id = this.getCurrentShift().getId();
        enclosingSpan.setAttribute("_shiftspace_highlight", "on");
        enclosingSpan.style.backgroundColor = ref.color;

        this.surround_text_node(xPathResult.snapshotItem(i), range, enclosingSpan);
      }
    }
  },


  cancel: function()
  {
    this.getCurrentShift().hide();
    this.hideInterface();
  },


  hideHighlights: function()
  {
    // ignores the specific shift since only one highlight can be on at a given moment
    // search for all span elements with _shiftspace_highlight attribute and open them
    var xPathResult = document.evaluate(".//span[attribute::_shiftspace_highlight='on']", document, null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    var parentNodes = [];

    for (var i = 0, l = xPathResult.snapshotLength; i < l; i++)
    {
      var spanElement = xPathResult.snapshotItem(i);
      var newTextNode = document.createTextNode(spanElement.textContent);
      parentNodes[i] = spanElement.parentNode;
      spanElement.parentNode.replaceChild(newTextNode, spanElement);
    }

    for (i = 0, l = xPathResult.snapshotLength; i < l; i++)
    {
      parentNodes[i].normalize();
    }
  },


  save: function()
  {
    // update the title
    this.getCurrentShift().setTitle($(this.summary).getProperty('value'));
    // save the shift
    this.getCurrentShift().save();
  }

});


var HighlightsShift = new Class({

  Extends: ShiftSpace.Shift,

  setup: function(json)
  {
    if(json.ranges)
    {
      //replace __newline__ token with \n
      for(var i=0; i<json.ranges.length; i++)
      {
        json.ranges[i].origText = this.deTokenizeNewline(json.ranges[i].origText);
        json.ranges[i].ancestorOrigTextContent = this.deTokenizeNewline(json.ranges[i].ancestorOrigTextContent);
      }
    }
    this.ranges = json.ranges;
    this.summary = json.summary;
  },

  encode: function()
  {
    //tokenize newline char with __newline__
    for(var i=0; i<this.ranges.length; i++)
    {
      this.ranges[i].origText = this.tokenizeNewline(this.ranges[i].origText);
      this.ranges[i].ancestorOrigTextContent = this.tokenizeNewline(this.ranges[i].ancestorOrigTextContent);
    }

    return {
      ranges: this.ranges,
      summary: this.getTitle()
    };
  },


  show: function()
  {
    // call to parent
    this.parent();

    var space = this.getParentSpace();
    space.hideHighlights();

    if (this.ranges)
    {
      //space.summary.value = this.summary;
      for (var i = 0; i < this.ranges.length; i++)
      {
        if(this.ranges[i].origText){
          this.ranges[i].origText = this.deTokenizeNewline(this.ranges[i].origText);
        }
        if(this.ranges[i].ancestorOrigTextContent){
          this.ranges[i].ancestorOrigTextContent = this.deTokenizeNewline(this.ranges[i].ancestorOrigTextContent);
        }
        space.turnOnRangeRef(this.ranges[i]);
      }
    }

    window.location.hash = this.getId();
  },


  hide: function()
  {
    // call to parent
    this.parent();

    this.getParentSpace().hideHighlights();
  },


  defaultTitle: function()
  {
    return "Untitled";
  },

  tokenizeNewline: function(text){
    var tokenizedText = text.replace(new RegExp("\\n","g"),"__newline__");
    return tokenizedText;
  },

  deTokenizeNewline: function(text){
    var deTokenizedText = text.replace(new RegExp("__newline__","g"),"\n");
    return deTokenizedText;
  }

});

var Highlights = new HighlightsSpace(HighlightsShift);

