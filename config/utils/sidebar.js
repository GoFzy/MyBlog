const siderbar = {
  genSidebar: function (router, children = ['']) {
    return [
      router,
      {
        title: '',
        collapsable: false,
        sidebarDepth: 1,
        children
      }
    ]
  }
};

module.exports = siderbar;