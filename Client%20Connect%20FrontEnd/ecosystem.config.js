require("dotenv").config({ path: "./.env" });
module.exports = {
  apps: [
    {
      name: `app-${process.env.NEXT_PUBLIC_NODE_ENV}`,
      script: "node",
      args: [
        "node_modules/next/dist/bin/next",
        "start",
        "-p",
        process.env.NEXT_PUBLIC_NODE_PORT,
      ],
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_OPTIONS: "--use-system-ca",
      },
      wait_ready: true,

      // Windows-specific settings
      windowsHide: true, // Hide the Windows console window
      max_restarts: 10, // Maximum number of restarts on crash
      restart_delay: 4000, // Longer delay for Windows systems

      // Enhanced Logging for Windows
      output: "./pm2-logs/out.log",
      error: "./pm2-logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      combine_logs: true,
      merge_logs: true,
      log_type: "json", // Structured logging for better parsing
      max_logs: "30d", // Keep logs for 30 days

      // Advanced Process Management
      max_memory_restart: "6G",
      node_args: "--max-old-space-size=4096",
      min_uptime: "120s",
      stop_exit_codes: [0], // Array of exit codes that trigger stop instead of restart
      exp_backoff_restart_delay: 100, // Exponential backoff on restart

      // Graceful Shutdown Configuration
      shutdown_with_message: true,
      autorestart: true,

      // Source Map Support for Better Error Tracking
      source_map_support: true,

      // Disable watch mode in production
      watch: false,

      // CPU/Memory Profiling Options
      profile: false, // Enable only temporarily when needed

      // Add these new configurations
      listen_timeout: 10000, // Time to wait for app to be ready
      kill_timeout: 10000, // Time to wait before forcing process kill
      trace: false, // Enables stack trace collection
      cron_restart: "0 0 * * *", // Daily restart at midnight

      // Development/Debug options
      trace: false, // Disable trace in production
    },
  ],
};
