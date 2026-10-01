// Startup file for Node hosting panels (cPanel / LiteSpeed / Passenger), which require() this file instead of running it directly.
require('./server/index.js').start()
