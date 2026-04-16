require("dotenv").config({ path: "./src/config/config.env" });

module.exports = {
  apps: [
    {
      name: `api-${process.env.NODE_ENV}`,
      script: "dist/app.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      cron_restart: "0 0 * * *",

      // Process Management
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 10000,

      // Memory Management
      max_memory_restart: "6G",
      node_args: "--max-old-space-size=4096",

      // Windows-specific settings
      windowsHide: true,

      // Logging Configuration
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      output: "./logs/out-%DATE%.log",
      error: "./logs/error-%DATE%.log",
      merge_logs: true,
      log_type: "json",
      max_logs: "14d",

      // Performance & Stability
      min_uptime: "120s",
      exp_backoff_restart_delay: 100,
      source_map_support: true,

      // Graceful Shutdown
      shutdown_with_message: true,
      stop_exit_codes: [0],

      // Development/Debug (disabled in production)
      profile: false,
      trace: false,
    },
  ],
};
