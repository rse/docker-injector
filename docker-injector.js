#!/usr/bin/env node
/*!
**  Docker-Injector -- Injecting Docker Reverse Proxy
**  Copyright (c) 2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  own package information  */
const my          = require("./package.json")

/*  internal requirements  */
const process     = require("process")
const net         = require("net")

/*  external requirements  */
const yargs       = require("yargs")
const chalk       = require("chalk")
const moment      = require("moment")
const shortid     = require("shortid")

/*  establish asynchronous context  */
;(async () => {
    /*  command-line option parsing  */
    const argv = yargs()
        /* eslint indent: off */
        .parserConfiguration({
            "duplicate-arguments-array": true,
            "set-placeholder-key":       true,
            "flatten-duplicate-arrays":  true,
            "camel-case-expansion":      true,
            "strip-aliased":             false,
            "dot-notation":              false,
            "halt-at-non-option":        true
        })
        .usage("Usage: docker-proxy " +
            "[-h|--help] " +
            "[-V|--version] " +
            "[-v|--verbose <level>] " +
            "[-L|--label <key>=<value>] " +
            "[-E|--environment <key>=<value>] " +
            "[-B|--bind <local-dir>:<remote-dir>[:<options>]] " +
            "[-l|--local <local-address>:<local-port>|<unix-socket-path>] " +
            "[-r|--remote <remote-address>:<remote-port>|<unix-socket-path>]"
        )
        .option("h", {
            describe: "show program help information",
            alias:    "help", type: "boolean", default: false
        })
        .option("V", {
            describe: "show program version information",
            alias:    "version", type: "boolean", default: false
        })
        .option("v", {
            describe: "show verbose messages",
            alias:    "verbose", type: "number", default: 1
        })
        .option("L", {
            describe: "label to inject into created containers",
            alias:    "label", type: "string", nargs: 1, default: []
        })
        .option("E", {
            describe: "environment variable to inject into created containers",
            alias:    "environment", type: "string", nargs: 1, default: []
        })
        .option("B", {
            describe: "bind volumes to inject into created containers",
            alias:    "bind", type: "string", nargs: 1, default: []
        })
        .option("l", {
            describe: "local socket to listen to",
            alias:    "local", type: "string", nargs: 1, default: "127.0.0.1:12375"
        })
        .option("r", {
            describe: "remote Docker daemon socket to connect to",
            alias:    "remote", type: "string", nargs: 1, default: "127.0.0.1:2375"
        })
        .version(false)
        .strict(true)
        .showHelpOnFail(true)
        .demand(0)
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" command-line option  */
    if (argv.version) {
        process.stderr.write(`${my.name} ${my.version} <${my.homepage}>\n`)
        process.stderr.write(`${my.description}\n`)
        process.stderr.write(`Copyright (c) 2020 ${my.author.name} <${my.author.url}>\n`)
        process.stderr.write(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>\n`)
        process.exit(0)
    }

    /*  fix array option handling of yargs  */
    if (typeof argv.label === "string")
        argv.label = [ argv.label ]
    if (typeof argv.environment === "string")
        argv.environment = [ argv.environment ]
    if (typeof argv.bind === "string")
        argv.bind = [ argv.bind ]

    /*  sanity check command-line arguments  */
    if (argv._.length !== 0)
        throw new Error("invalid number of arguments")

    /*  parse option values  */
    const parseAddrPort = (spec) => {
        let m
        if ((m = spec.match(/^(\S+):(\d+)$/)) !== null)
            return { host: m[1], port: m[2] }
        else if ((m = spec.match(/^(?:unix:(?:\/\/)?)?(\/\S+)$/)) !== null)
            return { path: m[1] }
        else
            throw new Error(`invalid address/port specification "${spec}"`)
    }
    const addrLocal  = argv.local
    const addrRemote = argv.remote
    argv.local  = parseAddrPort(argv.local)
    argv.remote = parseAddrPort(argv.remote)

    /*  dump a piece of data as a string  */
    const dump = (data) => {
        return data.toString().replace(/[^\x20-\x7E]+/g, (chars) => {
            return chars
                .replace(/(.)/g, (char) =>
                    `\\x${char.charCodeAt(0).toString(16).replace(/^(.)$/, "0$1").toUpperCase()}`)
                .replace(/\r/g, "\\r")
                .replace(/\n/g, "\\n")
        })
    }

    /*  log verbose message  */
    const levels = [
        { name: "ERROR",   style: chalk.red.bold },
        { name: "WARNING", style: chalk.yellow.bold },
        { name: "INFO",    style: chalk.blue },
        { name: "DEBUG",   style: chalk.green }
    ]
    if (argv.verbose >= levels.length)
        throw new Error("invalid maximum verbose level")
    const log = (level, msg) => {
        if (level <= argv.verbose) {
            const timestamp = moment().format("YYYY-MM-DD hh:mm:ss.SSS")
            process.stderr.write(`[${timestamp}]: ${levels[level].style("[" + levels[level].name + "]")}: ${msg}\n`)
        }
    }

    /*  process a HTTP request  */
    const processRequest = (id, data) => {
        /*  try to recognized an HTTP request for a container creation...  */
        const str = data.toString()
        const m = str.match(/^(\S+\s+)(\S+)(\s+HTTP\/\d+\.\d+\r?\n)((?:[^\r\n]+\r?\n)*)?(\r?\n)((?:.|\r?\n)*)$/)
        if (m !== null) {
            let [ , verb, url, proto, headers, seperator, body ] = m
            if (url.match(/^\/v\d+\.\d+\/containers\/create$/)) {
                const header = {}
                headers.replace(/([^\r\n]+?)(:\s*)([^\r\n]*)(\r?\n)/g, (_, name, sep, value, eol) => {
                    header[name.toLowerCase()] = { name, sep, value, eol }
                })
                if (header["content-type"].value === "application/json") {
                    let content
                    try {
                        content = JSON.parse(body)
                    }
                    catch (err) {
                        content = undefined
                    }
                    if (content !== undefined) {
                        /*  we recognized an HTTP request for a container creation!  */
                        log(2, `<${id}>: data: proxy(${addrLocal}) << client(${addrRemote}): inject information`)

                        /*  inject label information into request  */
                        if (content.Labels === undefined || content.Labels === null)
                            content.Labels = {}
                        argv.label.forEach((label) => {
                            const m = label.match(/^(.+?)=(.+)$/)
                            if (m === null)
                                throw new Error("invalid label specification")
                            content.Labels[m[1]] = m[2]
                        })

                        /*  inject environment information into request  */
                        if (content.Env === undefined || content.Env === null)
                            content.Env = []
                        argv.environment.forEach((env) => {
                            content.Env.push(env)
                        })

                        /*  inject bind information into request  */
                        if (content.HostConfig === undefined)
                            content.HostConfig = {}
                        if (content.HostConfig.Binds === undefined || content.HostConfig.Binds === null)
                            content.HostConfig.Binds = []
                        argv.bind.forEach((bind) => {
                            content.HostConfig.Binds.push(bind)
                        })

                        /*  reassemble the HTTP request again  */
                        body = JSON.stringify(content)
                        if (header["content-length"] === undefined)
                            header["content-length"] = { name: "Content-Length", sep: ": ", value: "0", eol: "\r\n" }
                        header["content-length"].value = body.length.toString()
                        headers = Object.keys(header).map((id) => {
                            return header[id].name + header[id].sep + header[id].value + header[id].eol
                        }).join("")
                        data = verb + url + proto + headers + seperator + body
                    }
                }
            }
        }
        return data
    }

    /*  create proxy listening socket  */
    const server = net.createServer((clientSocket) => {
        /*  got a client connection...  */
        const addrClient = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`
        const id = shortid.generate()
        log(2, `<${id}>: connect: proxy(${addrLocal}) << client(${addrClient})`)

        /*  create a server connecting socket  */
        const serverSocket = new net.Socket()

        /*  store data in a buffer until we are finally connected  */
        const buffer = {
            connected: false,
            data: [],
            flush: () => {
                if (buffer.connected) {
                    let data
                    while ((data = buffer.data.shift()) !== undefined) {
                        log(3, `<${id}>: data: proxy(${addrLocal}) >> server(${addrRemote}): "${dump(data)}"`)
                        serverSocket.write(data)
                    }
                }
            }
        }

        /*  connect to the server  */
        serverSocket.connect(Object.assign({}, argv.remote), () => {
            /*  got a server connection...  */
            log(2, `<${id}>: connect: proxy(${addrLocal}) >> server(${addrRemote})`)
            buffer.connected = true
            buffer.flush()
        })

        /*  react on events on server connection  */
        serverSocket.on("data", (data) => {
            /*  received data from server  */
            log(3, `<${id}>: data: proxy(${addrLocal}) << server(${addrRemote}): "${dump(data)}"`)
            clientSocket.write(data)
        })
        serverSocket.on("close", (hadError) => {
            /*  server closed connection  */
            log(2, `<${id}>: close: proxy(${addrLocal}) << server(${addrRemote}): hadError=${hadError}`)
            buffer.connected = false
            if (hadError) {
                if (!clientSocket.destroyed)
                    clientSocket.destroy()
            }
            else
                clientSocket.end()
        })
        serverSocket.on("error", (error) => {
            /*  received an error on server connection  */
            log(1, `<${id}>: error: proxy(${addrLocal}) << server(${addrRemote}): error=${error}`)
            buffer.connected = false
        })

        /*  react on events on client connection  */
        clientSocket.on("data", (data) => {
            /*  received data from client  */
            log(3, `<${id}>: data: proxy(${addrLocal}) << client(${addrRemote}): "${dump(data)}"`)
            data = processRequest(id, data)
            buffer.data.push(data)
            buffer.flush()
        })
        clientSocket.on("close", (hadError) => {
            /*  client closed connection  */
            log(2, `<${id}>: close: proxy(${addrLocal}) << client(${addrRemote}): hadError=${hadError}`)
            if (hadError) {
                if (!serverSocket.destroyed)
                    serverSocket.destroy()
            }
            else {
                buffer.flush()
                serverSocket.end()
            }
        })
        clientSocket.on("error", (error) => {
            /*  received an error on client connection  */
            log(1, `<${id}>: error: proxy(${addrLocal}) << client(${addrRemote}): error=${error}`)
        })
    })
    log(2, `listen: proxy(${addrLocal})`)
    server.listen(Object.assign({}, argv.local))
})().catch((err) => {
    /*  handle fatal error  */
    process.stderr.write(`docker-proxy: ${chalk.red("ERROR:")} ${err}\n`)
    process.exit(1)
})

