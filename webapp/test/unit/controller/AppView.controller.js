/*global QUnit*/

sap.ui.define([
	"zwfuol/zwfuol/controller/AppView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("AppView Controller");

	QUnit.test("I should test the AppView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
