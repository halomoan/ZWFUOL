sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	return ManagedObject.extend("zwfuol.controller.InitiatorEntryMgr", {

        aTableData: null,
        oTableModel: null,
        oTable: null,
        constructor: function (oTable) {
            ManagedObject.prototype.constructor.apply(this, []);
            this.oTable = oTable;      
      
            return this;
        },

        getTableControl: function(){
            return this.oTable;
        },

        setTableModel: function(oModel){
            this.oTableModel = oModel;
            this.aTableData = oModel.getData();
        },
        getTableModel: function () {
            return this.oTableModel;
          },
        getTableData: function(){
            return this.aTableData;
        },
	});
});