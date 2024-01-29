sap.ui.define(
  [
    "zwfuol/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/Link",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    MessagePopover,
    MessageItem,
    Link,
    Message,
    library
  ) {
    "use strict";
    var _oi18Bundle;
    var _oParams;
    var _oMessagePopover;
    var _MessageType = library.MessageType;
    var _oTableControl;

    return BaseController.extend("zwfuol.pages.controller.DetermineAgent", {
      /**
       * @override
       */
      onInit: function () {
        var oViewModel = new JSONModel({
          showSave: false,
          showDelete: false,
          WfGuid: "",
          WfName: "",         
        });

        var oView = this.getView();
        oView.setModel(oViewModel, "viewData");

        

        var oLink = new Link({
          text: "Show more information",
          href: "http://helpdesk.uol.com",
          target: "_blank",
        });

        var oMessageTemplate = new MessageItem({
          type: "{message>type}",
          title: "{message>message}",
          activeTitle: false,
          description: "{message>description}",
          subtitle: "{message>subtitle}",
          counter: "{message>counter}",
          link: oLink,
        });

        _oMessagePopover = new MessagePopover({
          items: {
            path: "message>/",
            template: oMessageTemplate,
          },
        });

        this.byId("messagePopoverBtn").addDependent(_oMessagePopover);

        this._oMessageManager = sap.ui.getCore().getMessageManager();

        oView.setModel(this._oMessageManager.getMessageModel(), "message");
        _oTableControl = this.byId("detagenttbl");

        this._oRouter = this.getRouter();
        this._oRouter
          .getRoute("DetermineAgent")
          .attachPatternMatched(this.__onRouteMatched, this);
      },
      __onRouteMatched: function (oEvent) {
        _oi18Bundle = this.getResourceBundle();
        _oParams = oEvent.getParameter("arguments");
        this._oMessageManager.removeAllMessages();
      },
      onAdd: function () {
        var oData = {
          WfGuid: "",          
          Initiatorgrp: "",
          Validfrom: new Date(),
          Validto: new Date("9999-12-31"),
          Opt: "",
          Value1: "0.00",
          Value2: "0.00",         
          L1approvergrp: "",
          L2approvergrp: "",
          L3approvergrp: "",
          L1approverrole: "",
          L2approverrole: "",
          L3approverrole: "",
          Enabled: true,
        };

        var oView = this.getView();
        var oModel = oView.getModel("viewData");
        
        oData.WfGuid = oModel.getProperty("/WfGuid"); 

        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();

        oSAPModel.setDeferredGroups(["groupBatchId"]);
        oSAPModel.createEntry("/DetermineAgentSet", {
          properties: oData,
        });
        if (oSAPModel.hasPendingChanges()) {
          oSAPModel.submitChanges({
            success: function (oResponse) {},
            error: function (oError) {},
            groupId: "groupBatchId",
          });
        }
      },

      onSave: function () {
        var oThis = this;
        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();
        //oSAPModel.setDeferredGroups(["groupBatchId"]);

        console.log(oSAPModel.hasPendingChanges());

        if (oSAPModel.hasPendingChanges()) {
          oSAPModel.submitChanges({
            success: function (oData, oResponse) {
              MessageToast.show(_oi18Bundle.getText("Success.Saved", ["Data"]));
              oThis._dirtyShowSave();
            },
            error: function (oError) {
              //console.log(oError);
            },
            //groupId: "groupBatchId"
          });
        } else {
          oThis._dirtyShowSave();
        }
      },

      onWFSelect: function (oEvent) {
        var aParams = oEvent.getParameters();
        var sKey = aParams.selectedItem.getKey();
        var sText = aParams.selectedItem.getText();

        var oView = this.getView();
        var oModel = oView.getModel("viewData");
                

        var oFilter = new Filter([new Filter("WfGuid", FilterOperator.EQ, sKey),], true);;

        _oTableControl.getBinding().filter(oFilter, "Application");
        

      },
      onMessagePopoverPress: function (oEvent) {
        _oMessagePopover.toggle(oEvent.getSource());
      },

      onChanged: function (oEvent) {
        var oSource = oEvent.getSource();

        var sCtrlType = oSource.getMetadata().getName();

        var aParams = oEvent.getParameters();

        var sValue = aParams.newValue;
        if (!sValue) {
          sValue = aParams.selectedItem.getKey();
        }

        var oSAPModel = oSource.getBindingContext().getModel();

        var sPath = oSource.getBindingContext().getPath();
        if (oSource.getBinding("selectedKey")) {
          var sSubPath = oSource.getBinding("selectedKey").getPath();
        } else {
          sSubPath = oSource.getBinding("value").getPath();
        }

        sSubPath = sPath + "/" + sSubPath;

        if (sCtrlType === "sap.m.DatePicker") {
          oSAPModel.setProperty(sSubPath, new Date(sValue));
        } else {
          oSAPModel.setProperty(sSubPath, sValue);
        }
        this._dirtyShowSave();
      },

      _dirtyShowSave: function () {
        var oViewModel = this.getView().getModel("viewData");
        var oSAPModel = this.getView().getModel();
        var bChanged = oSAPModel.hasPendingChanges();
        if (bChanged)
          oViewModel.setProperty("/showSave", oSAPModel.hasPendingChanges());
        else oViewModel.setProperty("/showSave", oSAPModel.hasPendingChanges());
      },
    });
  }
);
