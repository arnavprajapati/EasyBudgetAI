module.exports = {
    apps: [
        {
            name: "smartkhata-backend",
            script: "index.js",
            cwd: "./backend",
            env: {
                APP_MODE: "backend"
            },
            autorestart: true,
            watch: false
        },
        {
            name: "smartkhata-telegram-bot",
            script: "index.js",
            cwd: "./backend",
            env: {
                APP_MODE: "telegram-bot"
            },
            autorestart: true,
            watch: false
        }
    ]
};
