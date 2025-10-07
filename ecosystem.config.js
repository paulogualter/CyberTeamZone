module.exports = {
  apps: [{
    name: 'cyberteam-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/cyberteam/htdocs/cyberteam.zone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
