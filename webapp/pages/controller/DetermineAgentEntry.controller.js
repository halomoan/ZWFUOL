sap.ui.define([
	"zwfuol/controller/BaseController",
	"sap/ui/model/json/JSONModel",
], function(
	BaseController,
	JSONModel
) {
	"use strict";

	return BaseController.extend("zwfuol.pages.controller.DetermineAgentEntry", {
		/**
		 * @override
		 */
		onInit: function() {
			var oViewModel = new JSONModel({
				showSave: false,
				showDelete: false,
				RuleOrderSet: []
			});

			var aRuleOrder = [];

			for(var i = 0; i<50 ; i++){
				var idx = "" + i;
				aRuleOrder.push(idx.padStart(3,"0"));
			}

			var oView = this.getView();
			oView.setModel(oViewModel, "viewData");

		}
	});
});