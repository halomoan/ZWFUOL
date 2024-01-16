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
    var _oTableControl;
    var _oTableIndices;
    var _MessageType = library.MessageType;
    var _oMessagePopover;
    var _oDepartmentDialog;
    var _sPath;
    var _DeptFilters = [];

    return BaseController.extend("zwfuol.pages.controller.InitiatorEntry", {
      _formFragments: {},
   

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

        _oTableControl = this.byId("initiatortbl");

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
          Validto: new Date("9999-12-31"),
        };

        this._oMessageManager.removeAllMessages();

        var oSAPModel = this.getView().getModel();

        oSAPModel.setDeferredGroups(["groupBatchId"]);
        oSAPModel.createEntry("/InitiatorGroupSet", {
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

      onManageGroup: function () {},
      onMessagePopoverPress: function (oEvent) {
        _oMessagePopover.toggle(oEvent.getSource());
      },

      onVHDepartment: function (oEvent) {
        var oView = this.getView();
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext().getObject();
        _sPath = oSource.getBindingContext().getPath();

        if (_oDepartmentDialog) {
          _oDepartmentDialog.open();
        } else {
          _oDepartmentDialog = this.showFormDialogFragment(
            this.getView(),
            this._formFragments,
            "zwfuol.fragments.DepartmentSelect",
            this
          );
        }
        _oDepartmentDialog.setDraggable(true);

        var oList = sap.ui.core.Fragment.byId(oView.getId(), "seldepartment");
        var oBinding = oList.getBinding("items");

        _DeptFilters = [];
        _DeptFilters.push(
          new Filter("Function", FilterOperator.EQ, oData.Function)
        );
        oBinding.filter(_DeptFilters);
      },

      onSearchDepartment: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Department", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");

        var aFilters = [];
        for (var i = 0; i < _DeptFilters.length; i++) {
          aFilters.push(_DeptFilters[i]);
        }
        aFilters.push(oFilter);
        oBinding.filter(aFilters);
      },
      onDepartmentDialogClose: function (oEvent) {
        var oThis = this;
        var aContexts = oEvent.getParameter("selectedContexts");
        if (aContexts && aContexts.length) {
          aContexts.map(function (oContext) {
            var oData = oContext.getObject();
            var oSAPModel = oContext.getModel();
            oSAPModel.setProperty(_sPath + "/Department", oData.Department);
            oThis._dirtyShowSave();
          });
        }
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
