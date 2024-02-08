sap.ui.define(
  [
    "zwfuol/controller/BaseController",
    "sap/ui/model/json/JSONModel",
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
    var _MessageType = library.MessageType;
    var _oMessagePopover;
    var _oTableControl;
    var _oTableIndices;

    return BaseController.extend("zwfuol.pages.controller.WFRegister", {
      /**
       * @override
       */
      onInit: function () {
        var oViewModel = new JSONModel({
          showSave: false,
          showDelete: false,
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
        //this._oMessageProcessor =
        //  new sap.ui.core.message.ControlMessageProcessor();
        //this._oMessageManager.registerMessageProcessor(this._oMessageProcessor);

        //this._oMessageManager.registerObject(oView, true);

        oView.setModel(this._oMessageManager.getMessageModel(), "message");

        _oTableControl = this.byId("wfregister");

        this._oRouter = this.getRouter();
        this._oRouter
          .getRoute("WFRegister")
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
          WfName: "",
          WfDesc: "",          
          WfTablenm: "",
          WfTotalfield: "",
        };

        var oThis = this;
        this._oMessageManager.removeAllMessages();

        var oView = this.getView();
        var oSAPModel = oView.getModel();

        //oSAPModel.setDeferredGroups(oSAPModel.getDeferredGroups().concat(["groupBatchId"]));
        oSAPModel.setDeferredGroups(["groupBatchId"]);
        oSAPModel.createEntry("/ZWFRegisterSet", {
          properties: oData
        });

        if (oSAPModel.hasPendingChanges()) {
          oSAPModel.submitChanges({
            success: function (oResponse) {},
            error: function (oError) {},
            groupId: "groupBatchId",
          });
        }
      },
      onDelete: function () {
        var oSAPModel = this.getView().getModel();
        this._oMessageManager.removeAllMessages();

        for (var i = 0; i < _oTableIndices.length; i++) {
          var sPath = _oTableControl
            .getContextByIndex(_oTableIndices[i])
            .getPath();

          oSAPModel.remove(sPath, {
            success: function (oData, oResponse) {},
            error: function (oError) {},
          });
        }
      },

      onSave: function () {
        var oThis = this;
        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();
        //oSAPModel.setDeferredGroups(["groupBatchId"]);

        //console.log(oSAPModel.hasPendingChanges());

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
      onSelectionChange: function (oEvent) {
        var oPlugin = oEvent.getSource();
        _oTableIndices = oPlugin.getSelectedIndices();
        var oViewModel = this.getView().getModel("viewData");
        oViewModel.setProperty("/showDelete", _oTableIndices.length > 0);
      },

      onChanged: function (oEvent) {
        var oSource = oEvent.getSource();
        var sDataType = "String";

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
          if (oSource.getBinding("value").getType()) { 
            sDataType = oSource.getBinding("value").getType().getName();
          }
        }

        sSubPath = sPath + "/" + sSubPath;

        if (sCtrlType === "sap.m.DatePicker") {
          oSAPModel.setProperty(sSubPath, new Date(sValue));
        } else {
          if (sDataType === 'Integer') 
            oSAPModel.setProperty(sSubPath, parseInt(sValue));
          else
            oSAPModel.setProperty(sSubPath, sValue);
        }
        this._dirtyShowSave();
      },

      onMessagePopoverPress: function (oEvent) {
        _oMessagePopover.toggle(oEvent.getSource());
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
