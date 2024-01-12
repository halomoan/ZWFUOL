sap.ui.define([
	"zwfuol/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/m/Link',
    'sap/ui/core/message/Message',
    "sap/ui/core/library"
    
], function(
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

    var _oFormInitData = {
        "Groupid": "",
        "Groupname": "",
        "Status": {
            "Groupid": "None",
            "Groupname": "None"
        },
        "StatusTxt": {
            "Groupid": "",
            "Groupname": ""
        }
    };

	return BaseController.extend("zwfuol.pages.controller.InitiatorGroup", {
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

            var oFormModel = new JSONModel(_oFormInitData);

            oView.setModel(oFormModel, "form");


            var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

            var oMessageTemplate = new MessageItem({
				type: '{message>type}',
				title: '{message>message}',
				activeTitle: false,
				description: '{message>description}',
				subtitle: '{message>subtitle}',
				counter: '{message>counter}',
				link: oLink
			});

            _oMessagePopover = new MessagePopover({
				items: {
					path: 'message>/',
					template: oMessageTemplate
				}               
			});

             
            
            this.byId("messagePopoverBtn").addDependent(_oMessagePopover);

            this._oMessageManager = sap.ui.getCore().getMessageManager();
            this._oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor(); 
            this._oMessageManager.registerMessageProcessor(this._oMessageProcessor);             

            this._oMessageManager.registerObject(oView, true);

           

            

            oView.setModel(this._oMessageManager.getMessageModel(), "message");

            _oTableControl = this.byId("initiatortbl");
            this._oRouter = this.getRouter();
			this._oRouter
                .getRoute("RouteMainView")
                .attachPatternMatched(this.__onRouteMatched, this);
		},
            
        __onRouteMatched: function(oEvent){
			_oi18Bundle = this.getResourceBundle();
			_oParams = oEvent.getParameter("arguments");
            
			
		},

        onClear: function(){
            var oView = this.getView();

            var oFormModel = new JSONModel(_oFormInitData);

            oView.setModel(oFormModel, "form");
        },

        onAdd: function(){

            this._oMessageManager.removeAllMessages();

            if (!this._validForm()){
                return;
            }

            var oView = this.getView();
            var oFormModel = oView.getModel("form");
            var oData = oFormModel.getData();

            var oSAPModel = oView.getModel();

           
            //oSAPModel.setDeferredGroups(oSAPModel.getDeferredGroups().concat(["groupBatchId"])); 
            oSAPModel.setDeferredGroups(["groupBatchId"]);
            oSAPModel.createEntry("/InitGroupSet",{
                properties: {
                    "Groupid": oData.Groupid,
                    "Groupname": oData.Groupname
                }
            });
          

            if (oSAPModel.hasPendingChanges()) {

                oSAPModel.submitChanges({
                    success: function(oResponse){                  
                        //MessageToast.show(_oi18Bundle.getText("Success.Created"))
                        },
                        error: function(oError){    
                            //console.log(oError)
                            
                        },
                        //groupId: "groupBatchId"
                    });
            }

        },
        onSave: function(){
            var oView = this.getView();                        
            var oSAPModel = oView.getModel();

            this._oMessageManager.removeAllMessages();

             if (oSAPModel.hasPendingChanges()) {

                oSAPModel.submitChanges({
                    success: function(oResponse){                  
                
                        var oViewModel = oView.getModel("viewData");
                        oViewModel.setProperty("/showSave",false);
            

                        MessageToast.show(_oi18Bundle.getText("Success.Save"))

                        },
                        error: function(oError){    
                            console.log(oError)
                            
                        },
                        //groupId: "groupBatchId"
                    });
            }
        },

        onChange: function(oEvent){
            var oSource = oEvent.getSource();

            var aParams = oEvent.getParameters();
            var sValue = aParams.newValue;

            
            var oSAPModel = oSource.getBindingContext().getModel();
                      

            var sPath = oSource.getBindingContext().getPath();
            var sSubPath = oSource.getBinding("value").getPath();
            sPath = sPath + "/" + sSubPath;

            oSAPModel.setProperty(sPath,sValue); 
            

            var oViewModel = oView.getModel("viewData");
            oViewModel.setProperty("/showSave",oSAPModel.hasPendingChanges());

           
        },

        onSelectionChange: function(oEvent) {
			var oPlugin = oEvent.getSource();
			
		    _oTableIndices = oPlugin.getSelectedIndices();

            var oViewModel = this.getView().getModel("viewData");
            oViewModel.setProperty("/showDelete",_oTableIndices.length > 0);

		
		},

        onDelete: function(){
            var oSAPModel = this.getView().getModel();
            this._oMessageManager.removeAllMessages();
            

            for (var i = 0; i < _oTableIndices.length; i++) {
                
                var sPath = _oTableControl.getContextByIndex(_oTableIndices[i]).getPath();                
                                
                oSAPModel.remove(sPath,
                    {success: function(oData, oResponse){
                                              
                        // oThis._oMessageManager.addMessages(
                        //     new sap.ui.core.message.Message({
                        //         message: _oi18Bundle.getText("Success.Deleted",[sPath]),
                        //         type: _MessageType.Success, 
                                
                        //         processor: oThis._oMessageProcessor
                        //      })
                        // );

                    }, error: function(oError){

                        // oThis._oMessageManager.addMessages(
                        //     new sap.ui.core.message.Message({
                        //         message: _oi18Bundle.getText("Error.Delete",[sPath]),
                        //         type: sap.ui.core.MessageType.Error,                                
                        //         processor: oThis._oMessageProcessor
                        //      })
                        // );
                    }}
                    
                    )
            }
       

        },

        _validForm: function(){
            var bValid = true;
            var oView = this.getView();
            var oFormModel = oView.getModel("form");
            var oData = oFormModel.getData();

            if (oData.Groupid.length < 3) {
                oData.Status.Groupid = "Error";
                oData.StatusTxt.Groupid = "Group ID minimum 3 characters";
                bValid = false;
            } else {
                oData.Status.Groupid = "None";

            }
            if (oData.Groupname.length < 1) {
                oData.Status.Groupname = "Error";
                oData.StatusTxt.Groupname = "Group name cannot be blank";
                bValid = false;
            }else {
                oData.Status.Groupname = "None";
                
            }

            
            oFormModel.setProperty("/form",oData);
            
            return bValid;


        },
        onMessagePopoverPress : function (oEvent) {
			_oMessagePopover.toggle(oEvent.getSource());
		}
	});
});