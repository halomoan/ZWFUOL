sap.ui.define([
	"zwfuol/controller/BaseController",
	"zwfuol/controller/InitiatorEntryMgr",
	"sap/ui/model/json/JSONModel",
], function(
	BaseController,
	InitiatorEntryMgr,
	JSONModel
) {
	"use strict";

	var _oi18Bundle;
	var _oParams;
	var _oTableManager;

	return BaseController.extend("zwfuol.pages.controller.InitiatorEntry", {
		/**
		 * @override
		 */
		onInit: function() {
			var oViewModel = new JSONModel({
				"showSave": false,
				"showDelete": false		
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

		__onRouteMatched: function(oEvent){
			_oi18Bundle = this.getResourceBundle();
			_oParams = oEvent.getParameter("arguments");
			this._getTableData(); 
		},
		onAdd: function(){
			var oData = {
				"Groupid" : "",
				"Useragent": "",
				"Validfrom": new Date(),
				"Validto": new Date("9999-12-31")
			}

			var oModel = this.getView().getModel("tblData");
			var aData = oModel.getProperty("/InitiatorGroup");

			aData.push(oData);

			oModel.setProperty("/InitiatorGroup",aData);



		},

		onManageGroup: function(){

		},
		_getTableData: function(){
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

		}
	});
});