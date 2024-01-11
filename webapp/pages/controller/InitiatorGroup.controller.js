sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(
	Controller,
    JSONModel,
    MessageToast
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
            });

            console.log(oSAPModel.hasPendingChanges());

            oSAPModel.submitChanges({
                success: function(oResponse){
                    if( !that._responseHasError(oRes) ){
                        //Execute Success function									
                        console.log(oResponse)
                    }
                },
                error: function(oError){    
                    console.log(oError)

                },
                groupId: "createGroupBatch"
            });
            MessageToast.show("{i18n>Success.Created}")

        },

        _responseHasError: function(oRes) {
            var bStatusExists = "response" in oRes.__batchResponses[0];
            if (!bStatusExists){
                return false;
            }
            else if ( oRes.__batchResponses[0].response.statusCode >= 400 ){
                return true;
            }
            return false;
        },
	});
});