sap.ui.define(
  [
    "zwfuol/controller/BaseController",
    "zwfuol/controller/InitiatorEntryMgr",
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
    InitiatorEntryMgr,
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
    var _oTableManager;
    var _oTableIndices;
    var _MessageType = library.MessageType;
    var _oMessagePopover;

    return BaseController.extend("zwfuol.pages.controller.InitiatorEntry", {
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
        this._oMessageProcessor =
          new sap.ui.core.message.ControlMessageProcessor();
        this._oMessageManager.registerMessageProcessor(this._oMessageProcessor);

        this._oMessageManager.registerObject(oView, true);
        oView.setModel(this._oMessageManager.getMessageModel(), "message");

        var oTable = this.byId("initiatortbl");
        _oTableManager = new InitiatorEntryMgr(oTable);

        this._oRouter = this.getRouter();
        this._oRouter
          .getRoute("RouteMainView")
          .attachPatternMatched(this.__onRouteMatched, this);
      },

      __onRouteMatched: function (oEvent) {
        _oi18Bundle = this.getResourceBundle();
        _oParams = oEvent.getParameter("arguments");        
      },
      onAdd: function () {
        var oData = {
          Groupid: "",
          Function: "",
          Department: "",          
          Validfrom: new Date(),
          Validto: new Date("9999-12-31")          
        };

        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();
        
        oSAPModel.setDeferredGroups(["groupBatchId"]);
        oSAPModel.createEntry("/InitiatorGroupSet", {
          properties: oData
        });
        if (oSAPModel.hasPendingChanges()) {          
          oSAPModel.submitChanges({
            success: function (oResponse) {                          
            },
            error: function (oError) {             
            },
            groupId: "groupBatchId"
          });
        }
      },

      onSave: function() {
        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();
        //oSAPModel.setDeferredGroups(["groupBatchId"]);  
        
        console.log(oSAPModel.hasPendingChanges())
        if (oSAPModel.hasPendingChanges()) {
          oSAPModel.submitChanges({
            success: function (oData,oResponse) {                          
              console.log(oResponse)        
            },
            error: function (oError) { 
              console.log(oError)        
            },
            //groupId: "groupBatchId"
          });
        }

      },
      onDelete: function () {
        var oTable = _oTableManager.getTableControl();
        //var aIndices = oTable.getSelectedIndices();

        console.log(oTable)
        return;
        var sMsg;
        if (aIndices.length < 1) {
          sMsg = "no item selected";
        } else {
          sMsg = aIndices;
        }
        MessageToast.show(sMsg);
      },

      onDepartmentInputSuggest: function (oEvent) {
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext().getObject();
        var sPath = oSource.getBindingContext().getPath();
        var oSAPModel = oSource.getBindingContext().getModel();

        console.log(oSAPModel)
        //console.log(oSAPModel.getProperty(sPath+"/Function"));


        var oBinding = oEvent.getSource().getBinding("suggestionItems");

        console.log(oData);
        if (oData.Function) {
          oSource.setValueState("None");
          oSource.setValueStateText("");

          var aFilters = [];
          aFilters.push(
            new Filter("Function", FilterOperator.EQ, oData.Function)
          );
          oBinding.filter(aFilters);
        } else {
          oSource.setValue("");
          oSource.setValueState("Error");
          oSource.setValueStateText(_oi18Bundle.getText("Error.PropertyEmpty"));
        }

        if (oBinding.isSuspended()) {
          oBinding.resume();
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

        var sCtrlType = oSource.getMetadata().getName();

        var aParams = oEvent.getParameters();
                
        var sValue = aParams.newValue;
        if (!sValue){
          sValue = aParams.selectedItem.getKey();          
        }        

        var oSAPModel = oSource.getBindingContext().getModel();

        var sPath = oSource.getBindingContext().getPath();
        if (oSource.getBinding("selectedKey")){
          var sSubPath = oSource.getBinding("selectedKey").getPath();
          
        } else {
          sSubPath = oSource.getBinding("value").getPath();
        }
        
        sSubPath = sPath + "/" + sSubPath;

        if (sCtrlType === "sap.m.DatePicker"){
          oSAPModel.setProperty(sSubPath, new Date(sValue));
        } else {
          oSAPModel.setProperty(sSubPath, sValue);
        }

        //console.log(oSAPModel.getProperty(sPath),oSAPModel.getProperty(sSubPath))

        var oViewModel = this.getView().getModel("viewData");
        oViewModel.setProperty("/showSave", oSAPModel.hasPendingChanges());
      },


      onManageGroup: function () {},      
      onMessagePopoverPress: function (oEvent) {
        _oMessagePopover.toggle(oEvent.getSource());
      },

	
    });
  }
);
