module.exports = {
  apps: [{
    name: 'ghana-cargo',
    script: 'server/index.ts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/ghana-cargo-error.log',
    out_file: '/var/log/pm2/ghana-cargo-out.log',
    log_file: '/var/log/pm2/ghana-cargo-combined.log',
    time: true
  }]
};