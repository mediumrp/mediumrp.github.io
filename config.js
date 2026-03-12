const CONFIG = {
    githubUsername: "loyslow-dev", 

    // Обо мне (HTML поддерживается)
    aboutMe: `
        Web Developer & UI Designer. <br>
        Создаю современные интерфейсы и удобные приложения.
        Увлекаюсь космосом и нейросетями.
    `,

    socials: {
        telegram: "https://t.me/durov", // Поставь свой линк
        discord: "https://discord.com"
    },

    // ТЕХНОЛОГИИ
    // useIcons: true -> используем FontAwesome (класс иконки)
    // useIcons: false -> ищем файлы .svg в папке assets/technologies/ (имя файла)
    useIcons: true, 
    
    technologies: [
        // Если useIcons: true, пиши классы FontAwesome:
        "fa-brands fa-html5",
        "fa-brands fa-css3-alt",
        "fa-brands fa-js",
        "fa-brands fa-react",
        "fa-brands fa-node",
        "fa-brands fa-python",
        "fa-brands fa-docker",
        "fa-brands fa-git-alt",
        // Если useIcons: false, пиши имена файлов (без .svg):
        // "html", "css", "js"
    ],

    projects: [
        {
            name: "Space Bot",
            role: "Backend",
            description: "Discord бот для модерации и музыки.",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png", // Пример картинки из инета
            link: "#"
        },
        {
            name: "My Portfolio",
            role: "Frontend",
            description: "Сайт портфолио в стиле Bento.",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
            link: "#"
        }
    ],

    // Музыка: файлы должны лежать в папке songs/
    playlist: [
        { filename: "song1.mp3", title: "Space Chill", artist: "Unknown" },
        // Закинь файлы и раскомментируй
        // { filename: "track2.mp3", title: "Cyber Vibe", artist: "LoFi" }
    ]
};