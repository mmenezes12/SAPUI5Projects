sap.ui.controller("yewmrectonew.petrobras.com.br.yewmrectonew.ext.controller.CreateItm", {
    _attachmentsDmsId: 'yewmrectonew.petrobras.com.br.yewmrectonew::sap.suite.ui.generic.template.ObjectPage.view.Details::YEC_EWM_RECTO_ITEMB--attachmentReuseComponent::simple::AttachmentsDms::ComponentContainerContent---attachmentService',
    _attachmentsGOSId: 'yewmrectonew.petrobras.com.br.yewmrectonew::sap.suite.ui.generic.template.ObjectPage.view.Details::YC_EWM_RECTO_CABEC--attachmentReuseComponent::AttachmentsGOS::ComponentContainerContent---attachmentService',


    onInit: function (evt) {
        this.getOwnerComponent()?.getModel()?.attachBatchRequestCompleted(this.batchComplete, this)
    },


    batchComplete: function (evt) {
        if (evt?.mParameters?.method == 'POST' &&
            evt?.mParameters?.requests?.length > 0 &&
            evt?.mParameters?.requests[0]?.url.includes('criar_itm')) {
            var oItensTable = this.oView.byId('yewmrectonew.petrobras.com.br.yewmrectonew::sap.suite.ui.generic.template.ObjectPage.view.Details::YC_EWM_RECTO_CABEC--ITEM::Table')
            oItensTable?._oTable?.getBinding('items')?.refresh()
        }




        //Sobrescreve os metodos do componente de arquivo de fotografias  
        //para possibilidade  de exclusao e renomear os arquivos.


        var oAtt = this.oView.byId(this._attachmentsDmsId);
        if (oAtt) {
            this._AttControl = oAtt.getController()
            this._AttControl.__proto__._getEditMode = this.OverriderEditMode;
           
            //Busca component Anexos do protocolo da view de detalhes do header
            var oCabecView = sap.ui.getCore().byId('yewmrectonew.petrobras.com.br.yewmrectonew::sap.suite.ui.generic.template.ObjectPage.view.Details::YC_EWM_RECTO_CABEC');
            this._AttControl.__proto__.setAttachmentsGOS = this.setAttachmentsGOS
            this._AttControl.__proto__.getAttachmentsGOS = this.getAttachmentsGOS
            this._AttControl.setAttachmentsGOS(oCabecView?.byId(this._attachmentsGOSId))


            if (this._AttControl.getUploadCollectionControl()) {
                this._AttControl.getUploadCollectionControl().attachUploadComplete(this._handlerUploadComplete, this);


                //Extend FileUploader
                var FileUploader = this._AttControl?.getUploadCollectionControl()?._getFileUploader();
                if (FileUploader && FileUploader.__proto__._sendFilesWithXHR.name != '_OverriderSendFilesWithXHR') {
                    FileUploader.__proto__._originalSendFilesWithXHR = FileUploader.__proto__._sendFilesWithXHR
                    FileUploader.__proto__._sendFilesWithXHR = this._OverriderSendFilesWithXHR;
                    FileUploader.__proto__._sendFileToAnexosProtocolo = this._sendFileToAnexosProtocolo;
                }
            }
        }
    },


    getAttachmentsGOS: function () {
        return this._oAttachmentsGOS;
    },


    setAttachmentsGOS: function (ref) {
        this._oAttachmentsGOS = ref
    },


    _handlerUploadComplete: function (params) {
        setTimeout((oUploadController) => {
            for (const item of oUploadController.mAggregations._list.getItems()) {
                if (!item.getId().includes('attachmentServiceFileUpload')) {
                    oUploadController.mAggregations._list.removeItem(item)
                }
            }
        }, 100, this._AttControl.getUploadCollectionControl());
    },




    //* Overriders
    //*
    //* O Anexo de fotos é feito pelo componente standard Attachment Service
    //* Devido a sua natureza nâo é possivel editar o nome do arquivo apos anexo
    //* sendo necessario entao realizar a sobrescrita do metodo _sendFilesWithXHR
    //* do componente FileUpload para modificar o nome no momento do envio do arquivo
    //* para o S4!
    //*
    _OverriderSendFilesWithXHR: function (aFiles) {
        if (!this._sOwnerId.includes('simple::AttachmentsDms')) {
            this._originalSendFilesWithXHR(aFiles);
            return this
        }


        if (aFiles.length = 0) {
            return this
        }


        let content = []
        for (idx = 0; idx < aFiles.length; idx++) {
            let id = `idNewNameFile${idx}`;
            content.push(
                new sap.m.Input(id, { value: aFiles[idx].name })
            )
        }


        var that = this
        that.oConfirmDialog = new sap.m.Dialog({
            type: sap.m.DialogType.Message,
            title: "Renomear arquivo(s) ?",
            content: content,
            beginButton: new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                text: "Confirmar",
                press: function () {
                    let customListFile = new DataTransfer();
                    for (idx = 0; idx < aFiles.length; idx++) {
                        let id = `idNewNameFile${idx}`;
                        var file = aFiles[idx]
                        var oInput = this.oConfirmDialog?.mAggregations?.content?.find(e => e.sId == id);
                        var newName = oInput?.getProperty('value');


                        var aSplitOldName = file.name.split('.')
                        if (aSplitOldName.length == '2') {
                            newName = newName + '.' + aSplitOldName[1]
                        }


                        var customFile = new File([file.slice(0, file.size, file.type)], newName, { type: file.type });


                        customListFile.items.add(customFile);
                        oInput.destroy()
                    }


                    aFiles = customListFile.files
                   
                    //Envia arquivo pro S4
                    this._originalSendFilesWithXHR(aFiles);


                    //Envia arquivo para anexos do protocolo
                    this._sendFileToAnexosProtocolo(aFiles)


                    this.oConfirmDialog.close();
                }.bind(that)
            }),
            endButton: new sap.m.Button({
                text: "Cancelar",
                press: function () {
                    for (idx = 0; idx < aFiles.length; idx++) {
                        let id = `idNewNameFile${idx}`;
                        var oInput = this.oConfirmDialog?.mAggregations?.content?.find(e => e.sId == id);
                        oInput.destroy()
                    }


                    //Envia arquivo pro S4
                    this._originalSendFilesWithXHR(aFiles);


                    //Envia arquivo para anexos do protocolo
                    this._sendFileToAnexosProtocolo(aFiles)
                   
                    this.oConfirmDialog.close();
                }.bind(that)
            })
        });


        that.oConfirmDialog.open();
    },


    OverriderEditMode: function () {
        return this._properties.visibleEdit;
    },


    _sendFileToAnexosProtocolo: function (aFiles) {
        //Navega na arvore de componentes para buscar referencia do AttachmentsGOS
        var fRetriveAttachementGOS = function (oComp) {
            const _sAttachmentsDmsId = 'yewmrectonew.petrobras.com.br.yewmrectonew::sap.suite.ui.generic.template.ObjectPage.view.Details::YEC_EWM_RECTO_ITEMB--attachmentReuseComponent::simple::AttachmentsDms::ComponentContainerContent---attachmentService'


            //Achou? Retorna AttachmentsGOS
            if (oComp?.getId() == _sAttachmentsDmsId)
                return oComp?.getController()?.getAttachmentsGOS()


            //Não? Continua busca...    
            return fRetriveAttachementGOS(oComp?.getParent())
        }


       
        //Envia arquivo tambem para componente do Anexos protocolos
        var oAttachmentsGOS = fRetriveAttachementGOS(this.getParent())
        var oAnexosProtFileUploader = oAttachmentsGOS?.getController()?.
                                            getUploadCollectionControl()?._getFileUploader();
       


        if (!oAnexosProtFileUploader) {
            new sap.m.MessageBox.warning('O componente do anexos do protocolo não foi carregado, por isso não é possivel anexar registro fotografico. Favor reiniciar aplicação!');
            return
        }


        //Ações necessarias para o upload funcionar
        oAnexosProtFileUploader.FUEl.files = aFiles
        oAnexosProtFileUploader.setEnabled(true)
       
        //Realiza upload
        oAnexosProtFileUploader.handlechange({target:{files: aFiles}})
        oAnexosProtFileUploader.setEnabled(false)
    },


    _originalSendFilesWithXHR: function (aFiles) {
        var iFiles,
            sHeader,
            sValue,
            oXhrEntry,
            oXHRSettings = this.getXhrSettings();


        if (aFiles.length > 0) {
            if (this.getUseMultipart()) {
                //one xhr request for all files
                iFiles = 1;
            } else {
                //several xhr requests for every file
                iFiles = aFiles.length;
            }
            // Save references to already uploading files if a new upload comes between upload and complete or abort
            this._aXhr = this._aXhr || [];
            for (var j = 0; j < iFiles; j++) {
                //keep a reference on the current upload xhr
                this._uploadXHR = new window.XMLHttpRequest();


                oXhrEntry = {
                    xhr: this._uploadXHR,
                    requestHeaders: []
                };
                this._aXhr.push(oXhrEntry);
                oXhrEntry.xhr.open(this.getHttpRequestMethod(), this.getUploadUrl(), true);
                if (oXHRSettings) {
                    oXhrEntry.xhr.withCredentials = oXHRSettings.getWithCredentials();
                }
                if (this.getHeaderParameters()) {
                    var aHeaderParams = this.getHeaderParameters();
                    for (var i = 0; i < aHeaderParams.length; i++) {
                        sHeader = aHeaderParams[i].getName();
                        sValue = aHeaderParams[i].getValue();
                        oXhrEntry.requestHeaders.push({
                            name: sHeader,
                            value: sValue
                        });
                    }
                }
                var sFilename = aFiles[j].name;
                var aRequestHeaders = oXhrEntry.requestHeaders;
                oXhrEntry.fileName = sFilename;
                oXhrEntry.file = aFiles[j];
                this.fireUploadStart({
                    "fileName": sFilename,
                    "requestHeaders": aRequestHeaders
                });
                for (var k = 0; k < aRequestHeaders.length; k++) {
                    // Check if request is still open in case abort() was called.
                    if (oXhrEntry.xhr.readyState === 0) {
                        break;
                    }
                    sHeader = aRequestHeaders[k].name;
                    sValue = aRequestHeaders[k].value;
                    oXhrEntry.xhr.setRequestHeader(sHeader, sValue);
                }
            }
            if (this.getUseMultipart()) {
                var formData = new window.FormData();
                var name = this.FUEl.name;
                for (var l = 0; l < aFiles.length; l++) {
                    this._appendFileToFormData(formData, name, aFiles[l]);
                }
                formData.append("_charset_", "UTF-8");
                var data = this.FUDataEl.name;
                if (this.getAdditionalData()) {
                    var sData = this.getAdditionalData();
                    formData.append(data, sData);
                } else {
                    formData.append(data, "");
                }
                if (this.getParameters()) {
                    var oParams = this.getParameters();
                    for (var m = 0; m < oParams.length; m++) {
                        var sName = oParams[m].getName();
                        sValue = oParams[m].getValue();
                        formData.append(sName, sValue);
                    }
                }
                oXhrEntry.file = formData;
                this.sendFiles(this._aXhr, 0);
            } else {
                this.sendFiles(this._aXhr, 0);
            }
            this._bUploading = false;
            this._resetValueAfterUploadStart();
        }


        return this;
    }
});

