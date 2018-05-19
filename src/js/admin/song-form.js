{
  let view = {
    el: ".page > main",
    template: `
        <h1>新建歌曲</h1>
        <form class="form">
            <div class="row">
                <label>歌名:</label>
                <input name="name" type="text" value="__name__">
            </div>
            <div class="row">
                <label>歌手:</label>
                <input name="singer" type="text" value="__singer__">
            </div>
            <div class="row">
                <label>外链:</label>
                <input name="url" type="text" value="__url__">
            </div>
            <div class="row">
                <label>封面:</label>
                <input name="cover" type="text" value="__cover__">
            </div>
            <div class="row">
                <label>封面:</label>
                <textarea name="lyrics" cols="120" rows="30" style="resize: none; ">__lyrics__</textarea>
            </div>
            <div class="row">
                <input type="submit" value="保存">
            </div>
        </form>`,
    render(data) {
      if (data === undefined) {
        data = {};
      }
      let placeholders = ["name", "singer", "url", "cover", "lyrics"];
      let html = this.template;
      placeholders.map(string => {
        html = html.replace(`__${string}__`, data[string] || "");
      });
      if (data.id) {
        html = html.replace("新建", "编辑");
      }
      $(this.el).html(html);
    },
    reset() {
      this.render({});
    }
  };
  let model = {
    data: {
      name: "",
      singer: "",
      url: "",
      id: "",
      cover: "",
      lyrics: ""
    },
    creat(data) {
      var Song = AV.Object.extend("Song");
      var song = new Song();
      song.set("name", data.name);
      song.set("singer", data.singer);
      song.set("url", data.url);
      song.set("cover", data.cover);
      song.set("lyrics", data.lyrics);
      return song.save().then(
        newSong => {
          let id = newSong.id;
          let attributes = newSong.attributes;
          Object.assign(this.data, {
            id,
            ...attributes
          });
        },
        function(error) {
          console.error(
            "Failed to create new object, with error message: " + error.message
          );
        }
      );
    },
    update(data) {
      var song = AV.Object.createWithoutData("Song", this.data.id);
      // 修改属性
      song.set("name", data.name);
      song.set("singer", data.singer);
      song.set("url", data.url);
      song.set("cover", data.cover);
      song.set("lyrics", data.lyrics);

      // 保存到云端
      return song.save().then(res => {
        Object.assign(this.data, data);
        return res;
      });
    }
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.view.render(this.model.data);
      this.bindEvents();
      this.bindEventHub();
    },
    bindEvents() {
      $(this.view.el).on("submit", "form", e => {
        e.preventDefault();
        let needs = ["name", "singer", "url", "cover", "lyrics"];
        let data = {};
        needs.map(string => {
          data[string] = $(this.view.el)
            .find(`[name=${string}]`)
            .val();
        });
        if (this.model.data.id) {
          this.model.update(data).then(() => {
            window.eventHub.emit(
              "update",
              JSON.parse(JSON.stringify(this.model.data))
            );
          });
        } else {
          this.model.creat(data).then(() => {
            this.view.reset();
            let string = JSON.stringify(this.model.data);
            let data = JSON.parse(string);
            window.eventHub.emit("creat", data);
          });
        }
      });
    },
    bindEventHub() {
      window.eventHub.on("selected", data => {
        this.model.data = data;
        this.view.render(this.model.data);
      });
      window.eventHub.on("new", data => {
        data = data || {};
        if (this.model.data.id) {
          this.model.data = {};
        } else {
          Object.assign(this.model.data, data);
        }
        this.view.render(this.model.data);
      });
    }
  };
  controller.init(view, model);
}
