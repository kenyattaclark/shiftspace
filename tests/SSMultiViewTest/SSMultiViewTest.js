// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSMultiViewTest = new Class({
  
  name: "SSMultiViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    
  },
  
  teardown: function()
  {
    
  },
  
  testShowSubView: function()
  {
    this.doc("Test showing a subview wether controller backed or not");
    
    var hook = this.startAsync();
    Sandalphon.load('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      this.endAsync(hook);
    }.bind(this));
  },
  
  
  testSubViewSelector: function()
  {
    this.doc("Test using a different subview CSS selector than .SSSubView");
  }
  
});