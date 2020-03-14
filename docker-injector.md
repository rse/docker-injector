
# docker-injector(8) -- Injecting Docker Reverse Proxy

## SYNOPSIS

`docker-injector`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-d`|`--daemon`\]
\[`-p`|`--pid-file` *pid-file*\]
\[`-l`|`--log-file` *log-file*\]
\[`-v`|`--log-level` *log-level*\]
\[`-L`|`--label` *key*`=`*value*\]
\[`-E`|`--environment` *key*`=`*value*\]
\[`-B`|`--bind` *local-dir*`:`*remote-dir*\[`:`*options*\]\]
\[`-a`|`--accept ` *local-address*:*local-port*|*unix-socket-path*\]
\[`-c`|`--connect` *remote-address*:*remote-port*|*unix-socket-path*\]

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

-   \[`-h`|`--help`\]:
    Show program usage information only.

-   \[`-V`|`--version`\]:
    Show program version information only.

-   \[`-d`|`--daemon`\]:
    Detach from terminal into a daemon process. This usually should be
    combined with option `-l`|--log-file`.

-   \[`-p`|`--pid-file` *pid-file*\]:
    Write process id (PID) to *pid-file*.

-   \[`-l`|`--log-file` *log-file*\]:
    Write process log messages to *log-file*.
    If *log-file* is `-` (the default), it logs to `stdout`.

-   \[`-v`|`--log-level` *log-level*\]:
    Set the verbosity/log-level of the log messages. The *log-level* can
    be `0` (only error messages), `1` (error and warning messages, and
    the default), `2` (error, warning and informational messages) or `3`
    (error, warning, informational and debug messages).

-   \[`-L`|`--label` *key*`=`*value*\]:
    Inject a Docker label into the created containers.
    This emulates the `docker`(1) command-line option `-l`.

-   \[`-E`|`--environment` *key*`=`*value*\]:
    Inject a Docker environment variable into the created containers.
    This emulates the `docker`(1) command-line option `-e`.

-   \[`-B`|`--bind` *local-dir*`:`*remote-dir*\[`:`*options*\]\]:
    Inject a Docker bind-mount into the created containers.
    This emulates the `docker`(1) command-line option `-v`.

-   \[`-a`|`--accept` *local-address*:*local-port*|*unix-socket-path*\]:
    Accept new client connections on either the TCP socket
    *local-address*:*local-port* or the Unix domain socket
    *unix-socket-path*. The default is `127.0.0.1:12375`.

-   \[`-c`|`--connect` *remote-address*:*remote-port*|*unix-socket-path*\]:
    Connect to the Docker daemon, either via the TCP socket
    *remote-address*:*remote-port* or the Unix domain socket
    *unix-socket-path*. The default is `127.0.0.1:2375`.

## EXAMPLES

The following inject SSL/TLS information of the Docker host into
all created containers:

```
$ docker-injector \
  -p docker-injector.pid -d \
  -l docker-injector.log -v 3 \
  -e SSL_CERT_DIR=/etc/ssl/certs \
  -e SSL_CERT_FILE=/etc/ssl/certs.pem \
  -e SSL_CERT_JKS=/etc/ssl/certs.jks \
  -e JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=/etc/ssl/certs.jks \
  -e CURL_CA_PATH=/etc/ssl/certs \
  -e CURL_CA_BUNDLE=/etc/ssl/certs.pem \
  -m /etc/ssl:/etc/ssl:ro \
  -a 127.0.0.1:12375 -c 127.0.0.1:2375

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

