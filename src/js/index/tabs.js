{
  let view = {
    el: "section.tabs",
    activeItem(item) {
      item
        .addClass("active")
        .siblings()
        .removeClass("active");
    }
  };
  let model = {};
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents();
    },
    bindEvents() {
      $(this.view.el).on("click", "li", e => {
        let $li = $(e.currentTarget);
        this.view.activeItem($li);
        window.eventHub.emit("select", $li.attr("data-tab-name"));
      });
    }
  };
  controller.init(view, model);
}
