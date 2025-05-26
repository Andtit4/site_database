module.exports = {
    apps: [{
        name: 'site-info-backend',
        script: 'dist/main.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        env: {
            NODE_ENV: 'production',
            DATABASE_HOST: '193.203.166.156',
            DATABASE_PORT: '3306',
            DATABASE_USERNAME: 'u527740812_site_info_dbus',
            DATABASE_PASSWORD: 'Motdep@sse/2022',
            DATABASE_NAME: 'u527740812_site_info_db',
            API_PORT: 5001,
            API_PREFIX: 'api',
            JWT_SECRET: 'u3jkh54sdp98sd38suh38fyhs38fhs9fd',
            ADMIN_SETUP_KEY: 'GhsZkdIzm8JSt7F9Q3EpL6vNwRx2Ay5U'
        }
    }]
};