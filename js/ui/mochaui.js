var QMochaUIWindow = new Class({
  Extends: UIWindow,
  
  initialize: function(parentObject, client, type, name) {
    this.parent(parentObject, client, type, name);

    this.lines = new Element("div", {styles: {overflow: "auto", "width": "90"}});

    this.form = new Element("form");
    this.inputbox = new Element("input", {styles: {border: 0, width: "100%"}});
    this.inputbox.addClass("input");
  
    this.form.addEvent("submit", function(e) {
      new Event(e).stop();
    
      this.client.exec(this.inputbox.value);
      this.inputbox.value = "";
    }.bind(this));
    //this.container.appendChild(form);  
    this.form.appendChild(this.inputbox);
    
    var prefs = {
      width: 500,
      height: 400,
      title: name,
      footerHeight: 0,
      toolbar: true,
      container: $("pageWrapper"),
      toolbarHeight: parentObject.inputHeight,
      toolbarPosition: "bottom",
      toolbarContent: "",
      content: this.lines,
      onFocus: function() {
        parentObject.selectWindow(this);
      }.bind(this),
      onClose: function() {
        if(type == WINDOW_CHANNEL)
          this.client.exec("/PART " + name);

        this.close();
      }.bind(this)
    };
    
    if(type == WINDOW_STATUS)
      prefs.closable = false;
    
    var nw = new MochaUI.Window(prefs);
    /* HACK */
    var toolbar = $(nw.options.id + "_toolbar");
    toolbar.appendChild(this.form);
    
    return;
/*    
    if(type == WINDOW_CHANNEL) {
      this.nicklist = new Element("div");
      this.nicklist.addClass("nicklist");
      
      this.outerContainer.appendChild(this.nicklist);
    }
    
    var innerContainer = new Element("div");
    innerContainer.addClass("innercontainer");
    this.outerContainer.appendChild(innerContainer);
    
    if(type == WINDOW_CHANNEL) {
      this.topic = new Element("div");
      this.topic.addClass("topic");
      innerContainer.appendChild(this.topic);
    }
    */
  },
  updateNickList: function(nicks) {
    this.parent(nicks);
    
    return;
    var n = this.nicklist;
    while(n.firstChild)
      n.removeChild(n.firstChild);

    nicks.each(function(nick) {
      var e = new Element("div");
      n.appendChild(e);
      e.appendChild(document.createTextNode(nick));
    });
  },
  updateTopic: function(topic) {
    this.parent(topic);
    return;
    var t = this.topic;
    
    while(t.firstChild)
      t.removeChild(t.firstChild);

    Colourise(topic, t);
  },
  addLine: function(type, line, colour) {
    this.parent(type, line, colour);
    
    var e = new Element("div");

    if(colour) {
      e.setStyles({"background": colour});
    } else if(this.lastcolour) {
      e.addClass("linestyle1");
    } else {
      e.addClass("linestyle2");
    }
    
    if(type)
      line = this.parentObject.theme.message(type, line);
    
    Colourise(IRCTimestamp(new Date()) + " " + line, e);
    
    this.lastcolour = !this.lastcolour;
    
    var pe = this.lines.parentNode.parentNode;
    
    var prev = pe.getScroll();
    var prevbottom = pe.getScrollSize().y;
    var prevsize = pe.getSize();
    this.lines.appendChild(e);
    
    if(prev.y + prevsize.y == prevbottom)
      pe.scrollTo(prev.x, pe.getScrollSize().y);
      
    if(!this.active)
      this.lines.showLoadingIcon();
  }
});

var QMochaUI = new Class({
  Extends: UI,
    initialize: function(parentElement, theme) {
    this.parent(parentElement, QMochaUIWindow, "mochaui");
    this.theme = theme;
    this.parentElement = parentElement;
    
    window.addEvent("domready", function() {
      /* determine input size */
      var l = new Element("input", {styles: {border: 0}});
      this.parentElement.appendChild(l);
      this.inputHeight = l.getSize().y;
      this.parentElement.removeChild(l);
      
      MochaUI.Desktop = new MochaUI.Desktop();
      MochaUI.Dock = new MochaUI.Dock({
        dockPosition: "top"
      });

      MochaUI.Modal = new MochaUI.Modal();
      MochaUI.options.useEffects = false;
    }.bind(this));
    
    window.addEvent("unload", function() {
      if(MochaUI)
        MochaUI.garbageCleanUp();
    });
  },
  postInitialize: function() {    
    return;
    this.tabs = new Element("div");
    this.tabs.addClass("tabbar");
    
    this.parentElement.appendChild(this.tabs);
    
    this.container = new Element("div");
    this.container.addClass("container");
    
    this.parentElement.appendChild(this.container);
  
    var form = new Element("form");
    var inputbox = new Element("input");
    inputbox.addClass("input");
  
    form.addEvent("submit", function(e) {
      new Event(e).stop();
    
      this.getActiveWindow().client.exec(inputbox.value);
      inputbox.value = "";
    }.bind(this));
    this.parentElement.appendChild(form);  
    form.appendChild(inputbox);
    inputbox.focus();
  },
  loginBox: function(callbackfn, intialNickname, initialChannels) {
    this.parent(function(options) {
      this.postInitialize();
      callbackfn(options);
    }.bind(this), intialNickname, initialChannels);
  }
});
