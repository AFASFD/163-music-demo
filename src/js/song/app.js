{
  let view = {
    el: "#app",
    render(data) {
      let { song } = data;
      $(this.el)
        .find(".cover")
        .attr("src", song.cover || "");
      $(this.el)
        .find(".mosaicBackground")
        .css("background-image", `url(${song.cover || ""})`);
      $(this.el)
        .find("audio")
        .attr("src", song.url)
        .on("ended", () => {
          window.eventHub.emit("end");
          this.pause();
        })
        .on("timeupdate", time => {
          this.showLyric(time.currentTarget.currentTime);
        });
      $(this.el)
        .find(".name")
        .text(song.name);
      $(this.el)
        .find(".singer")
        .text(song.singer);
      let array = song.lyrics.split("\n");
      array.map(string => {
        let p = document.createElement("p");
        let regex = /\[([\d:.]+)\](.+)/;
        let matches = string.match(regex);
        if (matches) {
          p.textContent = matches[2];
          let time = matches[1];
          let parts = time.split(":");
          let minutes = parseInt(parts[0]) * 60;
          let seconds = parseFloat(parts[1]);
          let newTime = minutes + seconds;
          p.setAttribute("data-time", newTime);
        } else {
          p.textContent = string;
        }
        $(this.el)
          .find(".lyric > .lines-wrap > .lines")
          .append(p);
      });
    },
    play() {
      $(this.el).addClass("active");
      $(this.el)
        .find("audio")[0]
        .play();
    },
    pause() {
      $(this.el).removeClass("active");
      $(this.el)
        .find("audio")[0]
        .pause();
    },
    showLyric(time) {
      let allP = $(this.el).find(".lines-wrap > .lines > p");
      let lines = $(this.el).find(".lines-wrap > .lines")[0];
      let p;
      for (let i = 0; i < allP.length; i++) {
        if (i === allP.length - 1) {
          p = allP[i];
          break;
        } else {
          let currentTime = allP[i].getAttribute("data-time");
          let nextTime = allP[i + 1].getAttribute("data-time");
          if (currentTime < time && time < nextTime) {
            p = allP[i];
            break;
          }
        }
      }
      $(p)
        .addClass("active")
        .siblings()
        .removeClass("active");
      let pHeight = p.getBoundingClientRect().top;
      let linesHeight = lines.getBoundingClientRect().top;
      let height = pHeight - linesHeight;
      $(this.el)
        .find(".lines-wrap > .lines")
        .css("transform", `translateY(${-height}px)`);
    }
  };
  let model = {
    data: {
      song: {
        name: "",
        singer: "",
        url: "",
        id: "",
        lyrics: "",
        cover: ""
      },
      select: false
    },
    find(id) {
      var song = AV.Object.createWithoutData("Song", id);
      return song.fetch().then(
        song => {
          Object.assign(this.data.song, {
            id: id,
            name: song.attributes.name,
            singer: song.attributes.singer,
            url: song.attributes.url,
            cover: song.attributes.cover,
            lyrics: song.attributes.lyrics
          });
        },
        function(error) {
          // 异常处理
        }
      );
    }
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.model.find(this.searchSongId()).then(() => {
        this.view.render(this.model.data);
      });
      this.bindEvents();
      this.bindEventHub();
    },
    searchSongId() {
      let search = window.location.search;
      let id = "";
      if (search.indexOf("?") === 0) {
        search = search.substring(1);
      }
      let array = search.split("&").filter(v => v);
      for (let i = 0; i < array.length; i++) {
        let kv = array[i].split("=");
        let key = kv[0];
        let value = kv[1];
        if (key === "id") {
          id = value;
          break;
        }
      }
      return id;
    },
    bindEvents() {
      $(this.view.el).on("click", ".disc-wrap", () => {
        this.model.data.select = !this.model.data.select;
        if (this.model.data.select) {
          this.view.play();
        } else {
          this.view.pause();
        }
      });
    },
    bindEventHub() {
      window.eventHub.on("end", () => {
        this.model.data.select = false;
      });
    }
  };
  controller.init(view, model);
}
