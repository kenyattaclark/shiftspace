var ImageSwapSpace = ShiftSpace.Space.extend({
  attributes : 
  {
    name : 'ImageSwap',
    icon : 'ImageSwap.png',
    version : 0.1,
    css : 'ImageSwap.css'
  },
  
  setup : function()
  {
    this.focusRef = this.focusImage.bind(this);
    this.blurRef = this.blurImage.bind(this);
  },
  
  buildInterface : function()
  {
    // setup the image cover interface  
    this.focusDiv = new ShiftSpace.Element('div', {
      'class': "SSImageSwapFocusDiv"
    });

    this.grabSwapButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButton"
    });
    this.grabSwapButton.injectInside(this.focusDiv);
    
    this.leftTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonLeft"
    });
    this.leftTarget.injectInside(this.grabSwapButton);
    this.middleTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonMiddle"
    });
    this.middleTarget.injectInside(this.grabSwapButton);
    this.rightTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonRight" 
    });
    this.rightTarget.injectInside(this.grabSwapButton);

    this.attachEvents();
  },

  attachEvents : function()
  {
    this.focusDiv.addEvent('mouseout', this.blurRef);
    this.grabSwapButton.addEvent('click', function(_evt) {
    });
    
    // left part of the image swap button
    this.leftTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('swap');
    }.bind(this));
    this.leftTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('swap');
    }.bind(this));
    this.leftTarget.addEvent('click', function(_evt) {
      var target = $((new Event(_evt)).target);
      if(this.grabSwapButton.hasClass('swap'))
      {
        this.swapImage(target);
      }
    }.bind(this));

    // middle part of the image swap button
    this.middleTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('middle');
    }.bind(this));
    this.middleTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('middle');
    }.bind(this));
    
    // right part of the imageswap button
    this.rightTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('grab');
    }.bind(this));
    this.rightTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('grab');
    }.bind(this));
    this.rightTarget.addEvent('click', function(_evt) {
      if(this.grabSwapButton.hasClass('grab'))
      {
        this.grabImage();
      }
    }.bind(this));
  },

  showInterface : function()
  {
    this.parent();
    this.attachImageEvents();
  },
  
  hideInterface : function()
  {
    this.parent();
    this.removeImageEvents();
  },
  
  attachImageEvents : function()
  {
    // listen for mouse events when the interface is shown
    var allImages = $$('img').filter(function(x) { return !$(x).hasClass('ShiftSpaceElement');});
    allImages.each(function(x){ $(x).addEvent('mouseover', this.focusRef) }.bind(this));
  },
  
  removeImageEvents : function()
  {
    // remove image mouse events
    var allImages = $$('img').filter(function(x) { return !$(x).hasClass('ShiftSpaceElement');});
    allImages.each(function(x){ $(x).removeEvent('mouseout', this.focusRef) }.bind(this));
  },
  
  grabImage : function()
  {
    // store this across windows
    this.setValue('grabbedImage', this.currentImage.src);
  },
  
  swapImage : function(targetImage)
  {
    // get the current shift
    var currentShift = this.getCurrentShift();
    // set up the shift!
    var grabbedImage = this.getValue('grabbedImage');
    // we want a reference to the image node with the replace action
    var pinRef = ShiftSpace.Pin.toRef(this.currentImage, 'replace');
    
    // tell the current shift to swap
    this.currentShift.swap(pinRef, grabbedImage);
    
    // clear out the selection interface
    this.blurImage();
    // remove the image handlers
    this.removeImageEvents();
  },
  
  focusImage : function(_evt)
  {
    var image = $((new Event(_evt)).target);
    var pos = image.getPosition();
    var size = image.getSize().size;
    
    // store the url to this image
    this.currentImage = image;
    
    this.focusDiv.setStyles({
      left: pos.x,
      top: pos.y,
      width: size.x,
      height: size.y
    });
    
    this.focusDiv.injectInside(document.body);
  },
  
  blurImage : function()
  {
    if(this.focusDiv.getParent())
    {
      this.grabSwapButton.removeClass('swap');
      this.grabSwapButton.removeClass('middle');
      this.grabSwapButton.removeClass('grab');
      this.focusDiv.remove()
    }
  }
});


var ImageSwapShift = ShiftSpace.Shift.extend({
  setup : function(json)
  {
    // build the interface
    this.buildInterface();
    
    // get the scroll
    if(json.scroll)
    {
      this.image.setStyles({
        left: json.scroll.x, 
        top: json.scroll.y
      });
    }
    this.setPinRef(json.pinRef);
    this.setZoom(json.zoom || 0);
    this.setSrc(json.src);
  },

  setZoom : function(newZoom)
  {
    this.zoomVal = newZoom;
  },
  
  getZoom : function()
  {
    return this.zoomVal;
  },

  encode : function()
  {
    // store the pin ref
    // the size/zoom
    // and the scroll offset
    return {
      scroll : {x: this.image.offsetLeft, y: this.image.offsetTop},
      pinRef : this.getPinRef(),
      src : this.image.getProperty('src'),
      summary : "Image Swap", // use page or alt text
      zoom : this.getZoom()
    };
  },
  
  setSrc : function(src)
  {
    if(src) this.image.setProperty('src', src);
  },
  
  getSrc : function()
  {
    var src;
    if(this.image)
    {
      src = this.image.getProperty('src');
    }
    return src;
  },
  
  swap : function(pinRef, src)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> swap');
    
    // set the image to that property
    this.setSrc(src);
    this.pin(this.element, pinRef);
    
    // save
    this.save();
  },
  
  pin : function(element, pinRef)
  {
    // we want the exact dimensions of the old image
    var targetNode = ShiftSpace.Pin.toNode(pinRef);
    // take the dimensions from the target
    var styles = targetNode.getStyles('width', 'height');
    this.element.setStyles(styles);

    // we call this last since we want the styles first!
    this.parent(element, pinRef);
  },

  show : function()
  {
    // detach the dragging
    if(this.dragRef) this.dragRef.detach();
    
    // remove the 
    this.zoomButton.addClass('SSDisplayNone');
    this.unzoomButton.addClass('SSDisplayNone');
    
    if(!this.isSwapped && this.getPinRef() && this.getSrc())
    {
      this.swap(this.getPinRef(), this.getSrc());
      this.isSwapped = true;
    }
  },
  
  edit: function()
  {
    // show the interface and make draggable
    if(this.dragRef) this.dragRef.attach();
    
    // show the zoom buttons
    this.zoomButton.removeClass('SSDisplayNone');
    this.unzoomButton.removeClass('SSDisplayNone');
  },

  hide : function()
  {
    if(this.isSwapped && this.getPinRef() && this.getSrc())
    {
      console.log('unpin!');
      this.unpin();
      this.isSwapped = false;
    }
  },
  
  zoom: function()
  {
    // increment the zoom level, increase the image size by ten percent
    this.setZoom(this.getZoom()+1);
    this.updateImageDimensions();
    this.update();
  },
  
  unzoom: function()
  {
    // decrement the zoom level, decrease the image size by ten percent
    this.setZoom(this.getZoom()-1);
    this.updateImageDimensions();
    this.update();
  },
  
  updateImageDimensions: function()
  {
    var incrx = this.imageSize.x * 0.1;
    var incry = this.imageSize.y * 0.1;
    
    this.imageSize.x = (this.imageSize.x + incrx * this.getZoom()).round();
    this.imageSize.y = (this.imageSize.y + incry * this.getZoom()).round();
  },
  
  refresh: function()
  {    
    // increment by percentage
    this.image.setProperty('width', this.imageSize.x);
    this.image.setProperty('height', this.imageSize.y);
    this.image.setStyles({
      width: this.imageSize.x,
      height: this.imageSize.y
    });
  },
  
  update: function()
  {
    this.refresh();
    this.save();
  },
  
  imageLoaded: function()
  {
    // get the actual dimensions of the image
    this.imageSize = this.image.getSize().size;
    this.refresh();
  },

  attachEvents: function()
  {
    this.zoomButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      // Forward it to ShiftSpace only?
      this.zoom();
    }.bind(this));
    this.unzoomButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      // Forward it to ShiftSpace?
      this.unzoom();
    }.bind(this));
    this.image.addEvent('load', this.imageLoaded.bind(this));
  },

  buildInterface : function()
  {
    this.element = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShift"
    });
    this.image = new ShiftSpace.Element('img', {
      'class': "SSImageSwapShiftImage"
    });

    // add the zoom buttons
    this.zoomButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShiftZoom SSDisplayNone"
    });
    this.unzoomButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShiftUnzoom SSDisplayNone"
    });
    
    // add them to the shift element
    this.zoomButton.injectInside(this.element);
    this.unzoomButton.injectInside(this.element);
    
    // show the zooming interface
    this.image.injectInside(this.element);
    this.dragRef = new Drag.Move(this.image, {
      onComplete : function()
      {
        this.save();
      }.bind(this)
    })
    this.dragRef.detach();
    this.image.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
    });
    
    this.attachEvents();
  }
  
});

var ImageSwap = new ImageSwapSpace(ImageSwapShift);