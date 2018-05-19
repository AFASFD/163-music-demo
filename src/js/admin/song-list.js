{
  let view = {
    el: ".page > aside > #songList-container",
    template: `
        <ul class="songList">
        </ul>
        `,
    render(data) {
      let { songs,selected } = data;
      $(this.el).html(this.template);
      let liList = songs.map(song => {
        let li = document.createElement("li");
        li.textContent = song.name;
        li.setAttribute("data-id", song.id);
        if(song.id===selected){
          li.classList.add('active')
        }
        return li;
      });
      liList.map(li => {
        $(this.el)
          .find("ul")
          .append(li);
      });
    },
    clearActive() {
      $(this.el)
        .find(".active")
        .removeClass("active");
    },
    activeItem(item) {
      $(item)
        .addClass("active")
        .siblings(".active")
        .removeClass("active");
    }
  };
  let model = {
    data: {
      songs: [],
      selected: undefined
    },
    find() {
      var song = new AV.Query("Song");
      return song.find().then(
        songs => {
          // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
          songs.map(song => {
            this.data.songs.push({ id: song.id, ...song.attributes });
          });
        },
        function(error) {}
      );
    }
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.findAllSongs();
      this.bindEvents();
      this.bindEventHub();
    },
    bindEvents() {
      $(this.view.el).on("click", "li", e => {
        let id = e.currentTarget.getAttribute("data-id");
        this.model.data.selected=id;
        this.view.render(this.model.data)
        let song;
        for (let i = 0; i < this.model.data.songs.length; i++) {
          if (id === this.model.data.songs[i].id) {
            song = this.model.data.songs[i];
            break;
          }
        }
        window.eventHub.emit("selected", JSON.parse(JSON.stringify(song)));
      });
    },
    bindEventHub() {
      window.eventHub.on("creat", data => {
        this.model.data.songs.push(data);
        this.view.render(this.model.data);
      });
      window.eventHub.on("update", song => {
        let songs = this.model.data.songs;
        for (let i = 0; i < songs.length; i++) {
          if (songs[i].id === song.id) {
            Object.assign(songs[i], song);
            break;
          }
        }
        this.view.render(this.model.data);
      });
      window.eventHub.on("new", () => {
        this.view.clearActive();
      });
    },
    findAllSongs() {
      this.model.find().then(() => {
        this.view.render(this.model.data);
      });
    }
  };
  controller.init(view, model);
}
