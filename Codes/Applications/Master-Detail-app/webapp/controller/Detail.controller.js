sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("sapui5.mdapp.controller.Detail", {
        onNavPress: function () {
            oApp.back();
        }
    });
});