
# docker-injector(1) -- Injecting Docker Reverse Proxy

## SYNOPSIS

`docker-injector`
\[`-C` *directory*\]

## DESCRIPTION

`docker-injector`(1) is a small utility ...

## OPTIONS

The following command-line options and arguments exist:

- \[`-C` *directory*\]
  Change the current working *directory* before executing the *program*.

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
```

## HISTORY

The `docker-injector`(1) utility was developed in March 2020 to
automatically and seamlessly inject SSL/TLS information into every
created Docker container in case one cannot directly control the
container creation (as it is the case, for instance, when Drone CI runs
its Docker containers).

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

