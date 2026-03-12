const CONFIG = {
    // 1. Твой ник на GitHub
    githubUsername: "loyslow-dev", 

    // 2. Обо мне
    aboutMe: `
        Web Developer & UI Designer. <br>
        Создаю современные интерфейсы и удобные приложения.
        Увлекаюсь космосом и нейросетями.
    `, // <--- ЗАПЯТАЯ ВАЖНА

    // 3. Соцсети
    socials: {
        telegram: "https://t.me/durov", 
        discord: "https://discord.com"
    }, // <--- ЗАПЯТАЯ ВАЖНА

    // 4. Технологии
    useIcons: true, // true = иконки FontAwesome, false = твои SVG файлы
    
    technologies: [
        "fa-brands fa-html5",
        "fa-brands fa-css3-alt",
        "fa-brands fa-js",
        "fa-brands fa-react",
        "fa-brands fa-node",
        "fa-brands fa-python",
        "fa-brands fa-docker",
        "fa-brands fa-git-alt"
    ], // <--- ВОТ ЗДЕСЬ ОБЫЧНО ЗАБЫВАЮТ ЗАПЯТУЮ!

    // 5. Проекты
    projects: [
        {
            name: "Space Bot",
            role: "Backend",
            description: "Discord бот для модерации и музыки.",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
            link: "#"
        }, // <--- Запятая между проектами
        {
            name: "My Portfolio",
            role: "Frontend",
            description: "Сайт портфолио в стиле Bento.",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
            link: "#"
        }
    ], // <--- ЗАПЯТАЯ ВАЖНА

    // 6. Плейлист
    playlist: [
        // Файлы должны лежать в папке songs/
        // { filename: "track1.mp3", title: "Track Title", artist: "Artist" },
    ]
};