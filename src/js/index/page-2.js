{
  let view = {
    el: ".page-2",
    show() {
      $(this.el).addClass("active");
    },
    hidden() {
      $(this.el).removeClass("active");
    }
  };
  let model = {};
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEventHub();
    },
    bindEventHub() {
      window.eventHub.on("select", page => {
        if (page === 'page-2') {
          this.view.show();
        } else {
          this.view.hidden();
        }
      });
    }
  };
  controller.init(view, model);
}
