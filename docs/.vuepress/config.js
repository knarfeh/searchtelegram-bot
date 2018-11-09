module.exports = {
    ga: 'UA-75002639-7',
    serviceWorker: true,
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }]
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'Search Telegram',
            description: '',
        },
        // '/en/': {
        //     lang: 'en-US',
        //     title: 'Search Telegram',
        //     description: '',
        // },
    },
    themeConfig: {
        repo: 'knarfeh/searchtelegram-bot',
        editLinks: true,
        docsDir: 'docs',
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: 'Languages',
                label: '简体中文',
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次更新',
                serviceWorker: {
                    updatePopup: {
                        message: '发现新内容可用',
                        buttonText: '刷新',
                    },
                },
                nav: [
                    {
                        text: '使用',
                        link: '/',
                    },
                    {
                        text: '社区',
                        link: '/joinus/',
                    },
                    {
                        text: '赞助',
                        link: '/support/',
                    },
                ],
            },
            '/en/': {
                lang: 'en-US',
                selectText: 'Languages',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                serviceWorker: {
                    updatePopup: {
                        message: 'New content is available',
                        buttonText: 'Refresh',
                    },
                },
                nav: [
                    {
                        text: 'Usage',
                        link: '/en/',
                    },
                    {
                        text: 'Join us',
                        link: '/en/joinus/',
                    },
                    {
                        text: 'Support',
                        link: '/en/support/',
                    },
                ],
            },
        },
    },
};
