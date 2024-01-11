sap.ui.define([
	"zwfuol/controller/BaseController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function(
	BaseController,
	JSONModel,
	History

) {
	"use strict";

    var _oi18Bundle;

    return BaseController.extend("zwfuol.pages.controller.Homepage", {
        _oRouter: null,

        onInit: function () {

            var oView = this.getView();

            var oViewModel = new JSONModel({
				"PropertyName": "United Square"
			});
            oView.setModel(oViewModel, "viewData");

            this._oRouter = this.getRouter();
            this._oRouter
                        .getRoute("RouteMainView")
                        .attachPatternMatched(this.__onRouteMatched, this);

        },

        __onRouteMatched: function (oEvent) {
			_oi18Bundle = this.getResourceBundle();
           
			
		},

        onPageChanged: function(oEvent){
            //var oldPage = oEvent.getParameter("oldActivePageId");
            var newPage = oEvent.getParameter("newActivePageId");
            
            var oImage = sap.ui.getCore().byId(newPage)
            var oData = oImage.getBindingContext().getObject();
            
            var oView = this.getView();
            var oModel = oView.getModel("viewData");
            oModel.setProperty("/PropertyName",oData.Name);

        },

        onDataReceived: function(oEvent){          
            var oCarousel = this.byId("Property");
            var activePage = oCarousel.getPages()[0];
            var sProperty = activePage.getTooltip();

            var oView = this.getView();
            var oModel = oView.getModel("viewData");
            oModel.setProperty("/PropertyName",sProperty);
        },
        onDataRequested: function(oEvent){           
        },
        onDataChange: function(oEvent){           
        },
        onStart: function(){
            var oCarousel = this.byId("Property");
            var sId = oCarousel.getActivePage();
            var oImage = sap.ui.getCore().byId(sId);
            var oData = oImage.getBindingContext().getObject();

            var oContractType = this.byId("ContractType");
            var sContractType = oContractType.getSelectedKey();
            
            this._oRouter.navTo("FloorUnitPlanner",{
                Bukrs : oData.Bukrs,
                Busentity : oData.Busentity,
                Contrtype: sContractType,
                Keydate: this.getKeyDate()
            })
        },
        onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		}
    });
});