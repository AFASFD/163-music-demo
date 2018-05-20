{
  let view = {
    el: ".songList",
    template: `
    <li>
        <a href="./song?id=__id__">
            <div class="song-information">
                <p class="song-name">__name__</p>
                <p class="singer">__singer__</p>
            </div>
            <div class="play">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-play"></use>
                </svg>
            </div>
        </a>
    </li>
    `,
    render(data) {
      let { songs } = data; //let songs=data.songs
      songs.map(song => {
        let $li = $(
          this.template
            .replace("__name__", song.name || "")
            .replace("__singer__", song.singer || "")
            .replace("__id__", song.id || "")
        );
        $(this.el).append($li);
      });
    }
  };
  let model = {
    data: {
      songs: []
    },
    find() {
      var song = new AV.Query("Song");
      return song.find().then(
        songs => {
          // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
          songs.map(song => {
            this.data.songs.push({
              id: song.id,
              name: song.attributes.name,
              singer: song.attributes.singer,
              url: song.attributes.url
            });
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
      this.model.find().then(() => {
        this.view.render(this.model.data);
      });
    }
  };
  controller.init(view, model);
}
