
Docker-Injector
===============

**Injecting Docker Reverse Proxy**

<p/>
<img src="https://nodei.co/npm/docker-injector.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/docker-injector.png" alt=""/>

Abstract
--------

`docker-injector`(8) is a small reverse proxy for the `dockerd`(8)
daemon socket (`/var/lib/docker.sock` or `127.0.0.1:2375`) which
allows you to transparently inject label, environment and bind mount
information for the creation of Docker containers into the HTTP/REST
requests received on the server-side by Docker clients like `docker`(1)
or `drone-runner-docker`(8). This effectively allows you to emulate the
`docker`(1) options `-l` (label), `-e` (environment) and `-v` (bind
mount) in case you cannot directly control the container creation on the
client-side.

Installation
------------

```
$ npm install -g docker-injector
```

Usage
-----

The [Unix manual page](https://github.com/rse/docker-injector/blob/master/docker-injector.md) contains
detailed usage information.

Examples
--------

```
# start docker-injector(8)
$ docker-injector \
  -p docker-injector.pid -d \
  -l docker-injector.log -v 3 \
  -L docker.stack.status=injected \
  -B /etc/ssl:/etc/ssl:ro \
  -E SSL_CERT_DIR=/etc/ssl/certs \
  -E SSL_CERT_FILE=/etc/ssl/certs.pem \
  -E SSL_CERT_JKS=/etc/ssl/certs.jks \
  -E JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=/etc/ssl/certs.jks \
  -E CURL_CA_PATH=/etc/ssl/certs \
  -E CURL_CA_BUNDLE=/etc/ssl/certs.pem \
  -a 127.0.0.1:12375 -c 127.0.0.1:2375

# redirect docker(1) to docker-injector(8)
$ export DOCKER_HOST=tcp://127.0.0.1:12375

# test-driven docker-injector(8)
$ docker run --rm -it alpine sh
/ # mount |grep /etc/ssl
/dev/sda1 on /etc/ssl type ext4 (ro,relatime,errors=remount-ro,stripe=32)
/ # env | grep /etc/ssl | sort
CURL_CA_BUNDLE=/etc/ssl/certs.pem
CURL_CA_PATH=/etc/ssl/certs
JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=/etc/ssl/certs.jks
SSL_CERT_DIR=/etc/ssl/certs
SSL_CERT_FILE=/etc/ssl/certs.pem
SSL_CERT_JKS=/etc/ssl/certs.jks
/ # exit
```

License
-------

Copyright &copy; 2020 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

