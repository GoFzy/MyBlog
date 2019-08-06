const siderbar = {
    genSidebar: function (router, title, children = [''], collapsable = true, sidebarDepth = 1) {
        return [
            router,
            {
                title,
                collapsable,
                sidebarDepth,
                children
            }
        ]
    }
};

module.exports = siderbar;