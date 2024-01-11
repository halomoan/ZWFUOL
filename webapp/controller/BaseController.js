sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/routing/History",
      "sap/ui/core/format/DateFormat",
      "sap/ui/core/format/NumberFormat",
      "sap/ui/core/UIComponent",
    ],
    function (Controller, History, DateFormat, NumberFormat, UIComponent) {
     
     
      ("use strict");
      return Controller.extend("zwfuol.controller.BaseController", {     
  
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },    
         
        getFragmentByName: function (_formFragments, sFragmentName) {
          return _formFragments[sFragmentName];
        },
  
        showPopOverFragment: function (
          oView,
          oSource,
          _formFragments,
          sFragmentName,
          oThis
        ) {
          return this.getFormFragment(
            oView,
            _formFragments,
            sFragmentName,
            oThis
          ).openBy(oSource);
        },
  
        showFormDialogFragment: function (
          oView,
          _formFragments,
          sFragmentName,
          oThis
        ) {
           return this.getFormFragment(
            oView,
            _formFragments,
            sFragmentName,
            oThis
          ).open();
        },
  
        getFormFragment: function (oView, _formFragments, sFragmentName, oThis) {
          var oFormFragment = _formFragments[sFragmentName];
  
          if (oFormFragment) {
            return oFormFragment;
          }
  
          oFormFragment = sap.ui.xmlfragment(oView.getId(), sFragmentName, oThis);
          oView.addDependent(oFormFragment);
  
          var myFragment = (_formFragments[sFragmentName] = oFormFragment);
          return myFragment;
        },
  
        removeFragment: function (_formFragments) {
          for (var sPropertyName in _formFragments) {
            if (!_formFragments.hasOwnProperty(sPropertyName)) {
              return;
            }
  
            _formFragments[sPropertyName].destroy();
            _formFragments[sPropertyName] = null;
          }
        },
  
        onNavBack: function () {
          var oHistory, sPreviousHash;
          oHistory = History.getInstance();
          sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("RouteMainView", {}, true /*no history*/);
          }
        },
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
      });
    }
  );