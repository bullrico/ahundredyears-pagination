ahundredyears-pagination
========================

https://github.com/angular/builtwith.angularjs.org


Install http-server:

  npm install http-server -g

In the root dir:

  http-server [path] [options]

Path is optional, defaulting to ./public if it exists, otherwise ./.

Options are [defaults]:

-p The port number to listen on [8080]
-a The host address to bind to [localhost]
-i Display directory index pages [True]
-s or --silent Silent mode won't log to the console
-h or --help Displays help message and exits
So to serve the current directory on port 8000, type:

  http-server -p 8000