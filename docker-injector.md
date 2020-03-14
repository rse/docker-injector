
# docker-injector(8) -- Injecting Docker Reverse Proxy

## SYNOPSIS

`docker-injector`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-v`|`--verbose` *level*\]
\[`-L`|`--label` *key*`=`*value*\]
\[`-E`|`--environment` *key*`=`*value*\]
\[`-B`|`--bind` *local-dir*`:`*remote-dir*\[`:`*options*\]\]
\[`-l`|`--local` *local-address*:*local-port*|*unix-socket-path*\]
\[`-r`|`--remote` *remote-address*:*remote-port*|*unix-socket-path*\]

## DESCRIPTION

`docker-injector`(8) is a small reverse proxy for the `dockerd`(8)
daemon socket (`/var/lib/docker.sock` or `127.0.0.1:2375`) which
allows you to transparently inject label, environment and bind mount
information for the creation of Docker containers into the HTTP/REST
requests received on the server-side by Docker clients like `docker`(1)
or `drone-runner-docker`(8). This effectively allows you to emulate the
`docker`(1) options `-l` (label), `-e` (environment) and `-v` (bind
mount) in case you cannot directly control the container creation on the
client-side.

## OPTIONS

The following command-line options and arguments exist:

- \[`-h`|`--help`\]:

- \[`-V`|`--version`\]:

- \[`-v`|`--verbose` *level*\]:

- \[`-L`|`--label` *key*`=`*value*\]:

- \[`-E`|`--environment` *key*`=`*value*\]:

- \[`-B`|`--bind` *local-dir*`:`*remote-dir*\[`:`*options*\]\]:

- \[`-l`|`--local` *local-address*:*local-port*|*unix-socket-path*\]:

- \[`-r`|`--remote` *remote-address*:*remote-port*|*unix-socket-path*\]:

## EXAMPLES

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

$ export DOCKER_HOST=tcp://127.0.0.1:12375

$ docker version
```

## HISTORY

The `docker-injector`(1) utility was developed in March 2020
to automatically and transparently inject SSL/TLS information
into every created Docker container in case one cannot directly
control the container creation -- as it is the case, for
instance, when `drone-server`(8) runs its Docker containers via
`drone-runner-docker`(8).

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

