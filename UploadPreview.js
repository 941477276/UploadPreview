/*!
* @Author: 李燕南 9411477276@qq.com
* @Date:   2017-08-15 16:59:16
* @Last Modified by:   李燕南
* @Last Modified time: 2017-09-21 19:56:37
* @git: https://github.com/941477276/UploadPreview.git
*/
;
(function (factory){
    if ( typeof define === "function" && define.amd ) {
        define( ["jquery"], factory );
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory( require( "jquery" ) );
    } else {
        window.UploadPreview = factory( jQuery );
        try{
            if(typeof define === "function"){
                define(function (require){
                    return factory(require("jquery"));
                });
            }
        }catch(e){}
    }
})(function($) {

    function UploadPreview(options){
        this._init(options);
    }
    /*初始化*/
    UploadPreview.prototype._init = function (options){
        this.options = {
            previewInfo: {//预览参数配置
                width: -1, //预览图片的宽度
                height: -1, //预览图片的高度
                viewImgHorizontal: true,//预览图是否水平垂直居中
                previewClass: "",//每个预览框的class
                previewElement: "div",//每个预览框的元素，只能为字符串
                showToolBtn: true, //当鼠标放在图片上时是否显示工具按钮,
                onlyDel: false,//是否只生成"删除"按钮
                previewWrap: null,//包裹所有预览图片的父级元素
                errorMsg: "上传失败, ",//上传失败后的提示文字
                delBtn: "删除",//当上传失败时会显示错误信息，默认会有"删除"按钮，并且点击后可以删除当前文件，如果值为-1则不创建
                retryBtn: "重试",//当上传失败时会显示错误信息，默认会有"重试"按钮，并且点击后可以重新上传当前文件，如果值为-1则不创建
                changeUploadBtnText: true,//在上传过程中是否改变"开始上传"按钮的文字，如果按钮文字从"开始上传"变成了"暂停上传"，再次点击按钮就会暂停上传。如果文字从"暂停上传"变成了"继续上传"，再次点击按钮就会继续上传
                pauseText: "暂停上传",
                continueText: "继续上传"
            },
            btns: {
                uploadBtn: null, //开始上传按钮
                retryBtn: null, //用户自定义"重新上传"按钮
                chooseBtn: null,// 指定选择文件的按钮容器，不指定则不创建按钮。选择器支持 id, class, dom。
                chooseBtnText: "选择图片",//选择文件按钮显示的文字
                chooseBtnCanUseOnFinish: true,//当所有文件上传结束后"选择文件"按钮是否可用
                uploadBtnCanUsOnFinish: true//当所有文件上传结束后"开始上传"按钮是否可用
            },
            ignore: {//指定排除哪些类型的文件
                extensions: '',
                mimeTypes: ''
            },
            auto: false, //是否自动上传
            fileVal: "file", // [默认值：'file'] 设置文件上传域的name。
            method: "POST",//请求方式，默认post
            sendAsBlob: false,//是否以二进制流的形式发送
            pictureOnly: true,//只能上传图片
            multiple: true, //是否支持多选能力
            swf: "Uploader.swf", //swf文件路径
            url: "upload.php", //图片上传的路径
            datas: null, //上传的参数
            // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！false为不压缩
            resize: false,
            //是否可以重复上传，即上传一张图片后还可以再次上传。默认是不可以的，false为不可以，true为可以
            duplicate: false,
            threads: 3,//上传并发数。允许同时最大上传进程数。
            compress: false,//图片在上传前不进行压缩
            maxFileNum: 50, //最大上传文件个数
            maxFileTotalSize: 524288000, //最大上传文件大小，默认500M
            maxFileSize: 5242880, //单个文件最大大小，默认5M
            fileQueued: function (){}, //当有文件进来后所处理函数
            fileDequeued: function (){}, //当预览图销毁时或文件被删除时所处理函数
            uploadStart: function (){},//上传开始时执行的函数
            uploadComplete: function (){}, //每个文件上传完成时所执行的函数，不管成功或失败都会执行
            uploadError: function (){}, //上传出错时执行的函数
            notSupport: function (){}, //当浏览器不支持该插件时所执行的函数
            uploadSuccess: function (){}, //当上传成功（此处的上传成功指的是上传图片请求成功，并非图片真正上传到服务器）后所执行的函数
            uploadFinish: function (){},//上传结束时执行的函数
            error: function (){},//当validate不通过时（如文件数量超出、文件大小超出、类型不匹配等等），会以派送错误事件的形式通知调用者。
            onDel: function (){}//当点击预览框中的"删除"按钮时所触发的函数，如果此函数返回false，则点击"删除"不会删除预览框及文件
        }
        if(!options || !$.isPlainObject(options)){
            throw "必须传递一个包含上传文件必要参数的对象！";
        }

        $.extend(true, this.options, options);

        var accept = { //指定接受哪些类型的文件
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/png,image/gif,image/jpeg,image/jpg,image/bmp'
        },
        optionAccept = this.options.accept;
       
        //判断用户是否设置了上传文件的类型
        if(optionAccept && $.isPlainObject(optionAccept)){
            var extensions = optionAccept.extensions || "",
                mimeTypes = optionAccept.mimeTypes || "";
            accept.extensions = accept.extensions += "," + (extensions.replace(".",""));
            accept.mimeTypes = accept.mimeTypes += "," + mimeTypes;
        }
        if(!this.options.pictureOnly){
            accept = null;
        }
        this.options.accept = accept;
        this.retryBtn = this.options.btns.retryBtn ? $(this.options.btns.retryBtn) : null;

        // 实例化uploader
        this.uploader = WebUploader.create({
            pick: { //指定选择文件的按钮容器，不指定则不创建按钮。
                id: $(this.options.btns.chooseBtn)[0], // 指定选择文件的按钮容器，不指定则不创建按钮。选择器支持 id, class, dom。
                label: this.options.btns.chooseBtnText || "选择文件",
                multiple: this.options.multiple || true //是否支持多选能力
            },
            accept: accept,
            auto: this.options.auto, //是否自动上传
            swf: this.options.swf, // swf文件路径
            server: this.options.url,
            fileVal: this.options.fileVal,
            chunked: true, //是否要分片处理大文件上传。
            method: this.options.method.toUpperCase() || "POST",
            threads: this.options.threads || 3,
            resize: this.options.resize,
            duplicate: this.options.duplicate,
            compress: this.options.compress,
            sendAsBlob: this.options.sendAsBlob,
            fileNumLimit: this.options.maxFileNum, //设置上传文件总数量, 超出则不允许加入队列
            fileSizeLimit: this.options.maxFileTotalSize, // 设置上传文件总大小, 超出则不允许加入队列
            fileSingleSizeLimit: this.options.maxFileSize // 设置单个上传文件大小, 超出则不允许加入队列
        });
        //给uploader绑定 beforeFileQueued 事件
        this._beforeFileQueued();
         //给uploader绑定 fileQueued 事件
        this._fileQueued();
        //给uploader绑定 fileDequeued 事件
        this._fileDequeued();
        //个uploader绑定 uploadProgress 事件
        this._error();
        //给uploader绑定 uploadBeforeSend 事件
        this._uploadBeforeSend();
        //个uploader绑定 uploadProgress 事件
        this._startUpload();
        //给uploader绑定 uploadProgress 事件
        this._uploadProgress();
        //个uploader绑定 stopUpload 事件
        this._stopUpload();
        //个uploader绑定 uploadComplete 事件
        this._uploadComplete();
        //给uploader绑定 uploadFinished 事件
        this._uploadFinished();
        //给uploader绑定 uploadAccept 事件
        this._uploadAccept();
        //给uploader绑定 uploadError 事件
        this._uploadError();

        //判断浏览器是否支持transition属性
        this.supportTransition = (function() { 
            var s = document.createElement('p').style,
                r = 'transition' in s || 'WebkitTransition' in s || 'MozTransition' in s || 'msTransition' in s || 'OTransition' in s;
            s = null;
            return r;
        })();
        //存储所有文件的上传进度信息，以文件的id为key，值为上传的进度
        //其中total为上传的总信息，它也是一个对象，len为上传的文件的总数量，percentages为上传的总进度
        this.percentages = {
            total: {
                len: 0,
                percentages: 0
            }
        };
        //给"开始上传"按钮进行一些初始化
        this.uploadBtn = $(this.options.btns.uploadBtn).addClass('upload-ready');
        this.uploadBtn.attr("data-originText",this.uploadBtn.html());
        /*给"开始上传"按钮绑定事件*/
        this._uploadBtnBindEvent();
        this.isProgress = false;
        this.files = {};//存储选择的文件

        if(this.options.previewInfo.previewWrap){
            $(this.options.previewInfo.previewWrap).addClass('_filelist');
        }
    }
    /*给uploader绑定 beforeFileQueued 事件*/
    UploadPreview.prototype._beforeFileQueued = function (){
        var that = this,
            uploader = this.uploader,
            ignore = this.options.ignore,
            ignoreExtensions = "",
            ignoreMimeType = "";
        if(ignore){
            ignoreExtensions = ignore.extensions;
            ignoreMimeType = ignore.mimeTypes;
        }
        if(ignoreExtensions.length > 0){
            ignoreExtensions = ignoreExtensions.replace(".","");
        }
        uploader.on("beforeFileQueued", function (WuFile){
            //判断用户选择的文件是否是用户需要排除的类型，如果是则不添加到队列中
            var errorInfo = {};
            if(ignoreExtensions.length > 0){
                if(new RegExp(WuFile.source.ext).test(ignoreExtensions)){
                    errorInfo.code = "Q_TYPE_DENIED";
                    errorInfo.size = WuFile.size;
                    errorInfo.type = WuFile.type;
                    errorInfo.ext = WuFile.source.ext;
                    errorInfo.msg = "文件类型不正确！";
                    that.options.error(errorInfo, WuFile);
                    return false;
                }
            }
            if(ignoreMimeType.length > 0){
                if(new RegExp(WuFile.type).test(ignoreMimeType)){
                    errorInfo.code = "Q_TYPE_DENIED";
                    errorInfo.size = WuFile.size;
                    errorInfo.type = WuFile.type;
                    errorInfo.ext = WuFile.source.ext;
                    errorInfo.msg = "文件类型不正确！";
                    that.options.error(errorInfo, WuFile);
                    return false;
                }
            }
            if((that.getFileLength() + 1) > that.uploader.options.fileNumLimit){
                errorInfo.code = "Q_EXCEED_NUM_LIMIT";
                errorInfo.size = that.uploader.options.fileNumLimit;
                errorInfo.type = WuFile.type;
                errorInfo.ext = WuFile.source.ext;
                errorInfo.msg = "文件总数量超出！";
                that.options.error(errorInfo, WuFile);
                return false;
            }

            if(!(WuFile.id in that.files)){
                that.files[WuFile.id] = WuFile;
            }
            if(!that.chooseBtnInput){
                that.chooseBtnInput = $(that.options.btns.chooseBtn).find("input");
                if(that.chooseBtnInput.length == 0){
                    that.chooseBtnInput = $(that.options.btns.chooseBtn).find("object");
                }
                that.chooseBtnCanUse = true;
            }
            
            return true;
        });
    }
    /*给uploader绑定 fileQueued 事件*/
    UploadPreview.prototype._fileQueued = function (){
        var that = this,
            uploader = this.uploader;
        uploader.on("fileQueued", function (WuFile){
            //渲染预览框
            var previewBox = that.render(WuFile,(!/image\//.test(WuFile.type))),//如果文件不是图片则只生成删除按钮
                imgWrap = previewBox.find(".imgWrap");
            if(/image\//.test(WuFile.type)){//如果是图片则直接生成预览图
                var width = that.options.previewInfo.width,
                    height = that.options.previewInfo.height;
                
                if((width == -1 || width == 0) && (height == -1 || height == 0)){
                    width = imgWrap.width();
                }
                that.createPreviewImg(WuFile, width, height, function (file, img, src){
                    imgWrap.find(".previewing").remove();
                    imgWrap.prepend(img);
                    that.options.fileQueued.call(this, file, img, src);
                });
            }else{
                var notSupportHtml = '<div class="not-support-preview">文件: <b>' + (WuFile.name) + ' </b>不支持预览</div>';
                imgWrap.find(".previewing").remove();
                imgWrap.prepend(notSupportHtml);
                that.options.fileQueued.call(this, WuFile);
            }
            //设置当前文件的上传进度为0
            that._uploadPercentage("add", WuFile.id, 0);

            if(!that.WUFile){
                that.WUFile = WuFile.constructor;    
            }
            that._WuFileBindStatusChangeEvent(WuFile);
        });
    }

    /*给uploader绑定 fileDequeued 事件*/
    UploadPreview.prototype._fileDequeued = function (){
        var that = this;
        that.uploader.on("fileDequeued", function (WuFile){
            var previewBox = $("#" + WuFile.id);
            if(previewBox.length > 0){
                $("#" + WuFile.id).remove();//删除文件预览框    
            }
            
            if(WuFile.id in that.files){
                delete that.files[WuFile.id];
            }
            that._uploadPercentage("delete", WuFile.id);//修改进度信息
            that.options.fileDequeued.apply(this, arguments);
        });
    }

    /*给添加到队列中的文件绑定 statuschange 事件*/
    UploadPreview.prototype._WuFileBindStatusChangeEvent = function (WuFile){
        WuFile.on("statuschange", function (currentState, prev){
            /* 文件状态值，具体包括以下几种类型：

                inited 初始状态
                queued 已经进入队列, 等待上传
                progress 上传中
                complete 上传完成。
                error 上传出错，可重试
                interrupt 上传中断，可续传。
                invalid 文件不合格，不能重试上传。会自动从队列中移除。
                cancelled 文件被移除。*/
            switch(currentState){
                case "inited":
                    break;
                case "queued":
                    break;
                case "progress":
                    break;
                case "complete":
                    break;
                case "error":
                    break;
                case "interrupt":
                    break;
                case "invalid":
                    break;
                default:
                    break;
            }
        });
    }

     /*给uploader绑定 uploadBeforeSend 事件。局部设置，给每个独立的文件上传设置。*/
    UploadPreview.prototype._uploadBeforeSend = function (){
        var that = this;
        this.uploader.on( 'uploadBeforeSend', function( block, data ) {
            /* block为分块数据。// file为分块对应的file对象。var file = block.file;修改data可以控制发送哪些携带数据。
            默认会传递当前这张图的旋转角度*/
            // 将存在file对象中的md5数据携带发送过去。// data.fileMd5 = file.md5;// 删除其他数据// delete data.key;
            var globalDatas = that.options.datas;
            //将全局的额外数据添加进额外数据中
            if(globalDatas && $.isPlainObject(globalDatas)){
                $.each(globalDatas, function (attr, val){
                    data[attr] = val;
                });
            }
            var fileDatas = block.file.datas;
            //当前文件中的数据添加进额外数据中
            if(fileDatas && $.isPlainObject(fileDatas)){
                $.each(fileDatas, function (attr, val){
                    data[attr] = val;
                });
            }

            data.rotation = block.file.rotation;
        });
    }

    /*个uploader绑定 uploadProgress 事件*/
    UploadPreview.prototype._startUpload = function (){
        var that = this;
        that.uploader.on("startUpload", function (){
            //开始上传后"选择文件"按钮不可用
            if(that.chooseBtnCanUse && that.chooseBtnInput && that.chooseBtnInput[0]){
                //that.chooseBtnEnableUse(false);
                that.disable();
                that.chooseBtnCanUse = false;
            }
            if(that.options.previewInfo.changeUploadBtnText){
                var uploadBtn = that.uploadBtn;
                if(uploadBtn && uploadBtn.length > 0){
                    uploadBtn.addClass('upload-pause').removeClass('upload-ready upload-continue').html(that.options.previewInfo.pauseText);
                    uploadBtn[0].unabled = false;
                    uploadBtn[0].isProgress = true;
                }
            }
            //给"重新上传"按钮绑定事件
            if(that.retryBtn && that.retryBtn.length > 0 && !that.retryBtnBindedEvent){
                that.retryBtn.on("click", function (){
                    if(this.unable){return;}
                    that.retry();
                    this.unable = true;
                });
                that.retryBtnBindedEvent = true;
            }

            that.options.uploadStart.call(this);
        });
    }

    /*个uploader绑定 uploadProgress 事件*/
    UploadPreview.prototype._uploadProgress = function (){
        var that = this;
        that.uploader.on("uploadProgress", function (WuFile, percentage){
            //设置显示的进度条的长度
            UploadPreview.setProgressWidth(WuFile.id, (percentage * 100 + "%"));
            //修改当前文件的上传进度
            that._uploadPercentage("update", WuFile.id, percentage);
             var previewBox = $("#" + WuFile.id);
            if(!previewBox.showToolEventRemoved){
                previewBox.off("mouseenter.showTool").off("mouseleave.showTool");
                previewBox.showToolEventRemoved = true;
            }
        });
    }

     /*个uploader绑定 stopUpload 事件*/
    UploadPreview.prototype._stopUpload = function (){
        var that = this;
        that.uploader.on("stopUpload", function (WuFile, percentage){
            if(that.options.previewInfo.changeUploadBtnText){
                var uploadBtn = that.uploadBtn;
                if(uploadBtn && uploadBtn.length > 0){
                    uploadBtn.addClass('upload-continue').removeClass('upload-ready upload-pause').html(that.options.previewInfo.continueText);
                    uploadBtn[0].unabled = false;
                    uploadBtn[0].isProgress = false;
                }
                
            }
            
        });
    }

     /*个uploader绑定 uploadComplete 事件*/
    UploadPreview.prototype._uploadComplete = function (){
        var that = this;
        that.uploader.on("uploadComplete", function (WuFile){
            var previewBox = $("#" + WuFile.id);
            if(previewBox.find(".progress").length > 0){
                previewBox.find(".progress").hide();
            }
           that.options.uploadComplete.call(this, WuFile); 
        });
    }

    /*给uploader绑定 uploadFinished 事件*/
    UploadPreview.prototype._uploadFinished = function (){
        var that = this;
        that.uploader.on("uploadFinished", function (){
            //上传完成、上传结束后"选择文件"按钮重新变可用
            if(!that.chooseBtnCanUse && that.chooseBtnInput && that.chooseBtnInput[0]){
                if(that.options.btns.chooseBtnCanUseOnFinish){
                    //that.chooseBtnEnableUse(true);
                    that.enable();
                    that.chooseBtnCanUse = true;    
                }else{
                    //that.chooseBtnEnableUse(false);
                    that.disable();
                    that.chooseBtnCanUse = false;
                }
            }

            if(that.options.previewInfo.changeUploadBtnText){
                var uploadBtn = that.uploadBtn;
                if(!uploadBtn || uploadBtn.length == 0){return;}
                if(that.options.btns.uploadBtnCanUsOnFinish){
                    //当所有文件都上传后(不论成功或失败)，再调用upload()方法都不起作用，所以这里直接让按钮不可点
                    uploadBtn.removeClass('upload-continue upload-pause').addClass('upload-ready').html(uploadBtn.data("origintext"));
                    uploadBtn[0].unabled = false;
                    uploadBtn[0].isProgress = false;
                }else{
                    uploadBtn.removeClass('upload-continue upload-pause').addClass('upload-ready unable-btn').html(uploadBtn.data("origintext"));
                    uploadBtn[0].unabled = true;
                    uploadBtn[0].isProgress = false;
                }
                
            }

            //给"重新上传"按钮设置为可用
            if(that.retryBtn && that.retryBtn.length > 0 && that.retryBtnBindedEvent){
                that.retryBtn.each(function (){
                    this.unable = false;
                });
            }

            that.options.uploadFinish.call(this);
        });
    }

    /*给uploader绑定 uploadError 事件*/
    UploadPreview.prototype._uploadError = function (){
        var that = this;
        this.uploader.on('uploadError', function(WuFile, reason) {
            //修改当前文件的上传进度
            that._uploadPercentage("update", WuFile.id, 0);
            //显示上传失败的提示
            var previewBox = $("#" + WuFile.id);
            if(previewBox.find(".error").length > 0){
                previewBox.find(".error").show();
            }else{
                that.renderUploadError(previewBox, WuFile);
            }
            if(!previewBox.showToolEventRemoved){
                previewBox.off("mouseenter.showTool").off("mouseleave.showTool");
                previewBox.showToolEventRemoved = true;
            }
             //设置显示的进度条的长度
            UploadPreview.setProgressWidth(WuFile.id, 0);
            that.options.uploadError.apply(this,arguments);
        });
    }

    /*给uploader绑定 uploadAccept 事件
        如何判断文件是否上传成功。默认如果啥也不处理，只要有返回数据就认为是成功，就算返回的是错误信息，也认为是成功了。
        但是，在认为成功前会派送一个事件uploadAccept，这个事件是用来询问是否上传成功的。
        在这个事件中你可以拿到上传的是哪个文件，以及对应的服务端返回reponse
    */
    UploadPreview.prototype._uploadAccept = function (){
        var that = this;
        this.uploader.on('uploadAccept', function(file, response) {
            that.options.uploadSuccess.apply(this, arguments);
        });
    }

    /*给uploader绑定 error 事件*/
    UploadPreview.prototype._error = function (){
        var that = this;
        this.uploader.on("error", function (code, size, WuFile){
            var errorInfo = {};
            errorInfo.code = code;
            errorInfo.size = size;
            if(WuFile){
                errorInfo.type = WuFile.type;
                errorInfo.ext = WuFile.source.ext;
            }
            
            switch(code){
                case "Q_TYPE_DENIED":
                    errorInfo.msg = "文件类型不正确！";
                    break;
                case "Q_EXCEED_NUM_LIMIT":
                    errorInfo.msg = "文件总数量超出！";
                    break;
                case "Q_EXCEED_SIZE_LIMIT":
                    errorInfo.msg = "文件总体积超出！";
                    break;
                case "F_EXCEED_SIZE":
                    errorInfo.msg = "单个文件体积超出！";
                    break;
                default:
                    errorInfo.msg = "";
                    break;
            }
            that.options.error(errorInfo, WuFile);
        });
    }

    

    /*修改当前的进度信息*/
    UploadPreview.prototype._uploadPercentage = function (type, id, percentage){
        var that = this;
        if(type == "add"){
            that.percentages[id] = percentage;
            that.percentages.total.len += 1;
            that.percentages.total.percentages += percentage;
        }else if(type == "update"){
            that.percentages[id] = percentage;
            var percentages = that.percentages;
            that.percentages.total.percentages = 0;
            $.each(percentages,function (attr, val){
                if(attr != "total"){
                    that.percentages.total.percentages += val;
                }
            });
            
        }else if(type == "delete"){
            that.percentages.total.len -= 1;
            delete that.percentages[id];
            var percentages = that.percentages;
            that.percentages.total.percentages = 0;
             $.each(percentages,function (attr, val){
                if(attr != "total"){
                    that.percentages.total.percentages += val;
                }
            });
        }
    }
    /*上传文件*/
    UploadPreview.prototype.upload = function (){
        this.uploader.upload();
        return this;
    }
    /*重新上传文件*/
    UploadPreview.prototype.retry = function (file){
        if(file && typeof file === "object"){
            this.uploader.retry(file);
        }else{
            this.uploader.retry();
        }
        
        return this;
    }
    /*停止上传文件*/
    UploadPreview.prototype.stop = function (){
        this.uploader.stop();
        return this;
    }
    /*获取选择的文件数量*/
    UploadPreview.prototype.getFileLength = function (status){
        return this.uploader.getFiles(status || "queued").length;
    }
    /*修改允许上传的文件总数量*/
    /*UploadPreview.prototype.updateMaxFileNum = function (newNum){
        if(isNaN(parseInt(newNum))){return;}
        newNum = Math.abs(newNum);
        var currentNum = this.getFileLength();
        if(newNum < currentNum){return;}
        this.uploader.options.fileNumLimit = newNum;
        return this;
    }*/
    /*获取文件统计信息*/
    UploadPreview.prototype.getStats = function (){
        return this.uploader.getStats();
    }

    /*获取所有文件*/
    UploadPreview.prototype.getFiles = function (){
        return this.files;
    }

    /*销毁webuploader实例*/
    UploadPreview.prototype.destroy = function (){
        this.uploader.destroy();
    }

    /*给上传的文件添加额外的参数
        @param WuFile: 这个参数可以为WUFile对象或WUFile对象的id，传递这个参数后就可以给该文件设置额外参数
        @param data: 该参数是需要添加到文件中的额外参数，该参数必须为一个对象，并且不能是伪数组或数组
    */
    UploadPreview.prototype.setData = function (WuFile, data){
        var uploader = this.uploader,
            argsLen = arguments.length,
            that = this;
        if(argsLen == 1){
            data = WuFile;
        }else if(argsLen == 2){
            /*如果当前对象中没有WUFile则说明用户还未选择任何文件，此时添加数据就给全局的this.options.datas添加数据。
             如果传递的WuFile的构造函数不等于当前对象中的WUFile，说明传递的file不对，那么此时也会给全局的this.options.datas添加数据。
             否则就是给当前file添加额外数据*/
             if(!$.isPlainObject(data)){ return; }
            if( !this.WUFile && WuFile.constructor !== this.WUFile){

            }else if(typeof WuFile === "string"){
                //如果传递过来的WuFile是
                var files = uploader.getFiles();
                $.each(files, function (index, file){
                    if(file.id === WuFile){
                        $.each(data, function (attr,val){
                            if(file.datas == undefined){
                                file.datas = {};
                            }
                            file.datas[attr] = val;
                        });
                    }
                });
                return;
            }else{
                $.each(data, function (attr,val){
                    if(WuFile.datas == undefined){
                        WuFile.datas = {};
                    }
                    WuFile.datas[attr] = val;
                });
                return;
            }
        }
        if(!$.isPlainObject(data)){ return; }
        if(!$.isPlainObject(that.options.datas)){
            that.options.datas = {};
        }
        $.each(data, function (attr,val){
            that.options.datas[attr] = val;
        });
        return this;
    }
    /*删除指定文件
        @param WuFile: WuFile可以为一个file对象，也可以为file对象的id
    */
    UploadPreview.prototype["delete"] = function (WuFile){
        if(!WuFile){return;}
        this.uploader.removeFile(WuFile);
        return this;
    }
   /*
    按钮重新初始化。在webuploader中如果选择文件的按钮这个div
    自身或者其所处的容器是不可见的，在初始化过程中会因为取不到宽高，
    导致id未rt_开头的div的宽高只有1px × 1px。为了解决这个问题webuploader提供了refresh方法。
    可参考： http://www.jianshu.com/p/b59ebac54c43
    网上这个这种做法是行不通的，但思路可以。后来我改了webuploader插件的内部代码将这个功能实现了！
   */
   /*重新绘制"选择文件"按钮*/
    UploadPreview.prototype.refresh = function (btns){
        if(btns && $(btns).length > 0){
           btns =  $(btns);
        }else{
            btns = $(this.options.btns.chooseBtn);
        }
        btns.each(function(index, el) {
            if(!el.refresh){
                if(console){//原生IE8没有console对象
                    console.log("您的webuploader插件可能未开放refresh方法！");
                }
            }else{
                el.refresh.call(el.jsContext);
            }
        });
        return this;
    }

    /*禁用"选择文件"按钮*/
    UploadPreview.prototype.disable = function (btns){
        if(btns && $(btns).length > 0){
           btns =  $(btns);
        }else{
            btns = $(this.options.btns.chooseBtn);
        }
        btns.each(function(index, el) {
            if(!el.disableBtn){
                if(console){//原生IE8没有console对象
                    console.log("您的webuploader插件可能未开放disable方法！");
                }
            }else{
                el.disableBtn.call(el.jsContext);
            }
        });
        return this;
    }

    /*启用"选择文件"按钮*/
    UploadPreview.prototype.enable = function (btns){
        if(btns && $(btns).length > 0){
           btns =  $(btns);
        }else{
            btns = $(this.options.btns.chooseBtn);
        }
        btns.each(function(index, el) {
            if(!el.enable){
                if(console){//原生IE8没有console对象
                    console.log("您的webuploader插件可能未开放enable方法！");
                }
            }else{
                el.enable.call(el.jsContext);
            }
        });
        return this;
    }

    /*渲染预览框，并绑定事件*/
    UploadPreview.prototype.render = function (WuFile,onlyDel){
        var that = this,
            toolBar = '',
            previewBox = '',
            builder = this.builder;

        if(this.options.previewInfo.showToolBtn){
            //创建工具按钮
            toolBar = builder.buildTool(onlyDel || this.options.previewInfo.onlyDel, {
                ruid: WuFile.source.ruid || "",
                id: WuFile.id//此id可以用来删除当前的这张图片及给当前这张图片添加额外的数据
            });
        }
        //创建图像预览框
        previewBox = builder.buildPreviewBox({
            previewElement: this.options.previewInfo.previewElement,
            previewClass : this.options.previewInfo.previewClass
        }, toolBar);

        previewBox = $(previewBox).attr("data-ruid", WuFile.source.ruid);
        previewBox[0].id = WuFile.id;

        WuFile.rotation = 0;
        //给工具按钮绑定点击事件
        var panel = previewBox.find(".file-panel");
        if(panel.length > 0){
            var $imgWrap = previewBox.find(".imgWrap"),
                rotation = WuFile.source.rotation,
                deg = '';
            //给预览框绑定hover事件，以显示工具按钮
            previewBox.on("mouseenter.showTool", function (){
                panel.stop().animate({height: 30});
            }).on("mouseleave.showTool", function (){
                panel.stop().animate({height: 0});
            });

            panel.children('span').on("click", function (){
                var $this = $(this);
                if($this.hasClass('cancel')){//删除按钮
                    var id = $this.data("id");
                    if(that.options.onDel && $.isFunction(that.options.onDel)){
                        var flag = that.options.onDel(id);
                        if(flag === false){return;}
                    }
                    that.uploader.removeFile(id);//删除图片
                    //移除当前文件在进度中的信息
                    that._uploadPercentage("delete", $this.data("id"));
                    //$("#" + id).remove();//移除预览框
                }else if($this.hasClass('rotateRight') || $this.hasClass('rotateLeft')){//旋转按钮
                    if($this.hasClass('rotateRight')){
                        WuFile.rotation += 90;
                        if(WuFile.rotation > 360){
                            WuFile.rotation = 360;
                        }
                    }else if($this.hasClass('rotateLeft')){
                        WuFile.rotation -= 90;
                        if(WuFile.rotation < -270){
                            WuFile.rotation = -270;
                        }
                    }
                    rotation = WuFile.rotation;
                    if(that.supportTransition){
                        deg = 'rotate(' + rotation + 'deg)';
                        $imgWrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    }else{
                        //IE低版本浏览器旋转实现来自jquery animate的旋转
                        $imgWrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((rotation / 90) % 4 + 4) % 4) + ')');
                    }
                }
            });
        }

        if(this.options.previewInfo.previewWrap){
            $(this.options.previewInfo.previewWrap).append(previewBox);
        }
        return previewBox;
    }
    /*渲染上传失败提示，并给按钮绑定点击事件*/
    UploadPreview.prototype.renderUploadError = function (appendTo, WuFile){
        if(!appendTo || appendTo.length == 0){return;}
        if(!WuFile){return;}
        var that = this,
            previewInfo = that.options.previewInfo,
            html = $(that.builder.buildUploadErrorMsg(previewInfo.errorMsg, previewInfo.delBtn, previewInfo.retryBtn)),
            spanBtn = html.find("a");

        if(html.length == 0){return;}
        if(spanBtn.length > 0){
            if(WuFile){
                spanBtn.on("click", function (){
                    var $this = $(this);
                    if($this.hasClass('retry-this')){//重试
                        that.uploader.retry(WuFile);
                    }else if($this.hasClass('del-this')){//删除
                        that.uploader.removeFile(WuFile);
                    }
                });
            }
        }
        html.appendTo(appendTo);
    }

    /*生成缩略图
        @param file: file对象，即用户选择的文件
        @param fn: 调用makeThumb后的回调
        @param imgLoadFn: 如果调用makeThumb后可以生成预览图，则会自动生成一个img，并且会为这个
                            img绑定load事件，这个imgLoadFn就是事件执行的函数
    */
    UploadPreview.prototype.createPreviewImg = function (file, width, height, fn){
        var that = this,
            uploader = this.uploader;
        uploader.makeThumb(file, function(error, src) {
            if (error) {
                fn.call(this,error,src);
                return;
            }
            var img = document.createElement("img");
            $(img).one("load", function (){
                //如果图片是绝对定位，并且要求垂直水平居中，则需设置viewImgHorizontal为true
                if(that.options.previewInfo.viewImgHorizontal){
                    $(this).css({
                        "position": "absolute",
                        "left": "50%",
                        "top": "50%",
                        "margin-left": -this.width / 2,
                        "margin-top": -this.height / 2
                    });
                }

                fn.call(this, file, img, src);
            });
            img.src = src;

        }, width || 110, height || 110);
    }

    /*创建预览框HTML结构*/
    UploadPreview.prototype.builder = {
        buildTool: function (onlyDel, datas){/*创建工具按钮*/
            var htmlArr = [],
                datasArr = [],
                datasStr = '';
            if(datas && $.isPlainObject(datas)){
                $.each(datas, function (attr,val){
                    datasArr.push("data-" + attr + "=" + val);
                });
                datasStr = datasArr.join(" ");
            }

            htmlArr.push('<div class="file-panel">');
            htmlArr.push('    <span class="cancel" ' + datasStr + '>删除</span>');
            if(!onlyDel){
                htmlArr.push('    <span class="rotateRight" ' + datasStr + '>向右旋转</span>');
                htmlArr.push('    <span class="rotateLeft" ' + datasStr + '>向左旋转</span>');
            }
            htmlArr.push('</div>');
            return htmlArr.join("");
        },
        buildUploadErrorMsg: function (errorMsg, delBtn, retryBtn){/*创建上传失败后的提示*/
            var del = '',
                retry = '';
            if(delBtn && delBtn != -1){
                del = '<a href="javascript: void(0);" class="retry-this">重试</a>&nbsp;';
                if(retryBtn && retryBtn != -1){
                    del += '|&nbsp;';
                }
            }
            if(retryBtn && retryBtn != -1){
                retry = '<a href="javascript: void(0);" class="del-this">删除</a>';
            }
            return (!errorMsg && !delBtn && !retryBtn) ? '' : ('<p class="error">' + errorMsg + del + retry + '</p>');
        },
        buildPreviewBox: function (options, toolBar){/*创建图像预览框*/
            var htmlArr = [],
                previewElement = "div",
                previewClass = "";
            if(options && $.isPlainObject(options)){
                previewElement = options.previewElement || "div";
                previewClass = options.previewClass || "";
            }

            htmlArr.push('<' + previewElement + ' class="preview-box ' + previewClass + '">');
            //htmlArr.push('    <p class="title"></p>');
            htmlArr.push('    <div class="imgWrap"><p class="previewing">预览中...</p></div>');
            htmlArr.push('    <p class="progress"><span></span></p>');
            if(toolBar && typeof toolBar === "string"){
                htmlArr.push(toolBar);
            }
            htmlArr.push('</' + previewElement + '>');
            return htmlArr.join("");
        }
    }

    /*设置当前"选择文件"按钮是否可用，在webuploader中已经有该方法，因此就不用这个了*/
    /*UploadPreview.prototype.chooseBtnEnableUse = function (flag){
        console.log(this.chooseBtnInput);
        var chooseBtnInput = this.chooseBtnInput,
            nodeName = chooseBtnInput[0].nodeName;
        if(flag){
            if(nodeName == "INPUT"){
                chooseBtnInput[0].disabled = false;
            }else if(nodeName == "OBJECT"){
                chooseBtnInput.attr({
                    "width": "100%",
                    "height": "100%"
                });
            }
            chooseBtnInput.parents(".webuploader-container").removeClass('unable-btn');
        }else{
            if(nodeName == "INPUT"){
                chooseBtnInput[0].disabled = true;
            }else if(nodeName == "OBJECT"){
                chooseBtnInput.attr({
                    "width": 0,
                    "height": 0
                });
            }
            chooseBtnInput.parents(".webuploader-container").addClass('unable-btn');
        }
    }*/
    /*给"开始上传"按钮绑定事件*/
    UploadPreview.prototype._uploadBtnBindEvent = function (){
        var that = this;
        this.uploadBtn.on("click", function (){
            var $this = $(this);

            if($this.hasClass('unable-btn') || $this[0].unabled){return;}

            if($this.hasClass('upload-ready')){//开始上传
                that.uploader.upload();
            }else if($this.hasClass('upload-pause')){//暂停上传
                that.uploader.stop();
            }else if($this.hasClass('upload-continue')){//继续上传
                that.uploader.upload();
            }
        });
    }

    /*等比例计算宽高*/
    UploadPreview.calculateWh = function (viewW,viewH,imgW,imgH){
        if(!viewW && !viewH){return;}
        var width = 0,
            height = 0;
        if(viewW == -1){
            width = viewH * imgW / imgH;
            height = viewH;
        }
        if(viewH == -1){
            height = viewW * imgH / imgW;
            width = viewW;
        }
        return {width: width,height: height};
    }
    /*设置显示的进度条的长度*/
    UploadPreview.setProgressWidth = function (ele, width){
        if(typeof ele === "string"){
            ele = $("#" + ele).find(".progress span");
        }
        ele.width(width);
        return ele;
    }

    return UploadPreview;
});