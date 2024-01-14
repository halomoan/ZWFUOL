sap.ui.define(
  [
    "zwfuol/controller/BaseController",
    "zwfuol/controller/InitiatorEntryMgr",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    InitiatorEntryMgr,
    JSONModel,
    Filter,
    FilterOperator
  ) {
    "use strict";

    var _oi18Bundle;
    var _oParams;
    var _oTableManager;
    var _oTableIndices;

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
        this._getTableData();
      },
      onAdd: function () {
        var oData = {
          Groupid: "",
          Function: "",
          Department: "",
          Useragent: "",
          Validfrom: new Date(),
          Validto: new Date("9999-12-31"),
          xStatus: {
            isNew: true,
            isDeleted: false,
          },
        };

        var oModel = this.getView().getModel("tblData");
        var aData = oModel.getProperty("/InitiatorGroup");

        aData.push(oData);

        oModel.setProperty("/InitiatorGroup", aData);
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
        var oData = oSource.getBindingContext("tblData").getObject();
        var oBinding = oEvent.getSource().getBinding("suggestionItems");

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
        var oData = oSource.getBindingContext("tblData").getObject();
        var oModel = oSource.getBindingContext("tblData").getModel();
        var sPath = oSource.getBindingContext("tblData").getPath();
        if (!oData.xStatus.isNew) {
          oData.xStatus.isChanged = true;
        }

        oModel.setProperty(sPath, oData);
      },

      onManageGroup: function () {},
      _getTableData: function () {
        var aFilters = [];
        var oModel = this.getView().getModel();
        var oTable = _oTableManager.getTableControl();
        oTable.setBusy(true);

        oModel.read("/InitiatorGroupSet", {
          filters: aFilters,
          success: function (oResponse) {
            if (oResponse.results) {
              var aData = oResponse.results;

              var oTableModel = new JSONModel({
                InitiatorGroup: aData,
              });

              _oTableManager.setTableModel(oTableModel);

              oTable.setBusy(false);

              this.getView().setModel(oTableModel, "tblData");
            }
          }.bind(this),
          error: function (oError) {
            oTable.setBusy(false);
            MessageBox.error("{i18n>Error.FailLoad}");
          },
        });
      },
    });
  }
);
