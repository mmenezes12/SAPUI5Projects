sap.ui.define(["sap/ui/base/Object", "sap/ui/export/Spreadsheet"],

    function (BaseObject, Spreadsheet) {

        /**
         * @extends sap.ui.base.Object
         * @name tools.exportExcel .
         */
        return BaseObject.extend("tools.exportExcel", /** @lends tools.exportExcel */ {

            _Spreadsheet: Spreadsheet,

            constructor: function (fileName, data) {
                if (!fileName || !data) throw new Error("parametros invalidos")

                this._fileName = fileName
                this._data = data
                this._construct()
            },

            export: function () {
                var that = this
                return new Promise((resolve, reject)=>{
                    this._oSheet.build()
                    .then(function(resp) {
                        resolve('Export Finalizado')
                    }).catch(function(resp) {
                        reject('Erro Export')
                    }).finally(function() {
                        that._oSheet.destroy();
                    });
                })
            },

            /**
             * @private
             */
            _construct: function () {
                this._oSheet = new this._Spreadsheet({
                    workbook: { columns: this._createColumnConfig() },
                    fileName: this._fileName,
                    dataSource: this._data
                });
            },

            _createColumnConfig: function() {
                return [
                    {
                        label: 'Titulo 1',
                        property: 'Campo1'
                    },
                    {
                        label: 'Titulo 2',
                        property: 'Campo2'
                    }];
            },
        });
    });