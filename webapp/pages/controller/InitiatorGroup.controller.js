sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function(
	Controller,
    JSONModel
) {
	"use strict";

	return Controller.extend("zwfuol.pages.controller.InitiatorGroup", {
        /**
         * @override
         */
        onInit: function() {

            var oView = this.getView();

            var oFormModel = new JSONModel({
                "Groupid": "IG",
                "Groupname": "XXX"
            });

            oView.setModel(oFormModel, "form");
            
        },

        onAdd: function(){
            var oView = this.getView();
            var oFormModel = oView.getModel("form");
            var oData = oFormModel.getData();

            var oSAPModel = oView.getModel();

            
            oSAPModel.createEntry("/InitGroupSet",{
                properties: {
                    "Groupid": oData.Groupid,
                    "Groupname": oData.Groupname
                }
            })

        }
	});
});