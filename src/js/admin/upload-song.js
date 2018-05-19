{
  let view = {
    el: ".page > aside > .uploadArea",
    find(seletor) {
      return $(this.el).find(seletor)[0];
    }
  };
  let model = {};
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.initQiniu();
    },
    initQiniu() {
      var uploader = Qiniu.uploader({
        runtimes: "html5", // 上传模式，依次退化
        browse_button: this.view.find("#uploadButton"), // 上传选择的点选按钮，必需
        // 在初始化时，uptoken，uptoken_url，uptoken_func三个参数中必须有一个被设置
        // 切如果提供了多个，其优先级为uptoken > uptoken_url > uptoken_func
        // 其中uptoken是直接提供上传凭证，uptoken_url是提供了获取上传凭证的地址，如果需要定制获取uptoken的过程则可以设置uptoken_func
        // uptoken : '<Your upload token>', // uptoken是上传凭证，由其他程序生成
        uptoken_url: "http://localhost:8888/xxx", // Ajax请求uptoken的Url，强烈建议设置（服务端提供）
        // uptoken_func: function(){    // 在需要获取uptoken时，该方法会被调用
        //    // do something
        //    return uptoken;
        // },
        get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的uptoken
        // downtoken_url: '/downtoken',
        // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
        // unique_names: true,              // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
        // save_key: true,                  // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
        domain: "http://p89b1qmfv.bkt.clouddn.com", // bucket域名，下载资源时用到，必需
        container: this.view.find("#uploadContainer"), // 上传区域DOM ID，默认是browser_button的父元素
        max_file_size: "20mb", // 最大文件体积限制
        flash_swf_url: "path/of/plupload/Moxie.swf", //引入flash，相对路径
        dragdrop: true, // 开启可拖曳上传
        drop_element: this.view.find("#uploadContainer"), // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
        chunk_size: "4mb", // 分块上传时，每块的体积
        auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
        //x_vars : {
        //    查看自定义变量
        //    'time' : function(up,file) {
        //        var time = (new Date()).getTime();
        // do something with 'time'
        //        return time;
        //    },
        //    'size' : function(up,file) {
        //        var size = file.size;
        // do something with 'size'
        //        return size;
        //    }
        //},
        init: {
          FilesAdded: function(up, files) {
            plupload.each(files, function(file) {
              // 文件添加进队列后，处理相关的事情
            });
          },
          BeforeUpload: function(up, file) {
            // 每个文件上传前，处理相关的事情
            window.eventHub.emit('beforeUpload')
          },
          UploadProgress: function(up, file) {
            // 每个文件上传时，处理相关的事情
          },
          FileUploaded: function(up, file, info) {
            window.eventHub.emit('afterUpload')
            var domain = up.getOption("domain");
            var res = JSON.parse(info.response);
            var sourceLink = domain + "/" + encodeURIComponent(res.key);
            let data={
                url: sourceLink,
                name: res.key
            }
            window.eventHub.emit('new',data)
          },
          Error: function(up, err, errTip) {
            //上传出错时，处理相关的事情
          },
          UploadComplete: function() {
            //队列文件处理完毕后，处理相关的事情
          },
          Key: function(up, file) {
            // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
            // 该配置必须要在unique_names: false，save_key: false时才生效
            var key = file.name;
            // do something with key here
            return key;
          }
        }
      });
    }
  };
  controller.init(view, model);
}
