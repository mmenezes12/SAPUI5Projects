sap.ui.jsview("sapui5.mdapp.view.Detail", {
    getControllerName: function () {
        return "sapui5.mdapp.controller.Detail";
    },
    createContent: function (oController) {
        var oObjectHeader = new sap.m.ObjectHeader({
            title: "{Name}",
            number: "ID: {ID}",
            attributes: [
                new sap.m.ObjectAttribute({
                    text: "{Address/Country}"
                })
            ]
        });
        var oPageDetail = new sap.m.Page({
            title: "Supplier Detail",
            showNavButton: true,
            navButtonPress: [oController.onNavPress, oController],
            content: [oObjectHeader]
        });
        return oPageDetail;
    }
});