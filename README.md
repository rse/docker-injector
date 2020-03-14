
Docker-Injector
===============

**Injecting Docker Reverse Proxy**

<p/>
<img src="https://nodei.co/npm/docker-injector.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/docker-injector.png" alt=""/>

Abstract
--------

`docker-injector`(1) is a small utility for...

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
$ docker-proxy \
  -v 9 \
  -e SSL_CERT_DIR=/etc/ssl/certs \
  -e SSL_CERT_FILE=/etc/ssl/certs.pem \
  -e SSL_CERT_JKS=/etc/ssl/certs.jks \
  -e JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=/etc/ssl/certs.jks \
  -e CURL_CA_PATH=/etc/ssl/certs \
  -e CURL_CA_BUNDLE=/etc/ssl/certs.pem \
  -m /etc/ssl:/etc/ssl:ro \
  -l 127.0.0.1:12375 \
  -r 127.0.0.1:2375
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

