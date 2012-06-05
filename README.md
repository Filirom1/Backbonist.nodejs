Backbonist.nodejs
=================

A nodejs boilerplate that use Backbonist stack

In devlopment

    $ node bin/server
    Force browsers to reload when the server detects file changes.
       info  - socket.io started
    Navigate in directories
    Static files served in  /home/romain/Backbonist.nodejs/public
    Push State Enabled in  /home/romain/Backbonist.nodejs/public
    Server listening on http://127.0.0.1:3000/

In production

    $ NODE_ENV=production node bin/server
    compile templates
    rm /home/romain/Backbonist.nodejs/build
    mkdir /home/romain/Backbonist.nodejs/build
    optimize /home/romain/Backbonist.nodejs/public into /home/romain/Backbonist.nodejs/build
    Push State Enabled in  /home/romain/Backbonist.nodejs/build
    Server listening on http://127.0.0.1:3000/


