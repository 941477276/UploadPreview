# UploadPreview
UploadPreview是一个基于百度(Baidu) WebFE(FEX)团队开发的WebUploader的多文件上传插件！ UploadPreview可以让您在Web开发中快速实现一个图片上传前预览、多文件异步上传的功能。 UploadPreview提供了一些实用的方法及事件回调供开发者使用，当然UploadPreview也提供了很多的配置参数供开发者去配置以达到插件与实际项目需求紧密结合、灵活使用的效果！
非常感谢百度fex-team团队给我们提供了这么优秀的WebUploader文件上传插件！
## 兼容性
经测试UploadPreview在Chrome、Firefox、360、IE8及IE8以上版本的浏览器中都能很好的运行；在ios自带浏览器、ios微信、ios UC、Android 自带浏览器、Android 微信、Android UC中也可以如pc端正常运行。由于本次封装并未针对移动端做处理，如果代码拿到移动端用可能会出现某些bug！
## UploadPreview与WebUploader的区别
首页UploadPreview依赖于WebUploader，没有了WebUploader,UploadPreview完全不可用。
其次WebUploader是对上传、分块等底层功能的封装，而UploadPreview仅仅是对上传文件前的一个预览及控制上传进行了封装，如果直接拿WebUploader到项目中使用当然也是可以的，但你可能要写一大堆的代码，你要写很多的配置，你要找相应的事件，然后你还要手动生成预览框，生成预览框后还要生成"删除"按钮，然后给按钮绑定事件。。。最后预览问题终于搞定了，接下来你还要有"开始上传"、"暂停上传"、"继续上传"等操作，这些操作搞定后就开始测试上传了，测试时你会发现：上传失败了没提示，上传成功了没提示，上传失败了还能不能继续上传？上传失败后能不能删除指定的图片？然后你又开始着手去解决这些问题了。
UploadPreview其实就是解决了上面的这些问题！
## api文档地址
https://941477276.github.io/UploadPreview/doc/index.html