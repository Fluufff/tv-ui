# Fennec UI

A minimal web UI skeleton that aims to avoid the bi-annual rewrite of your whole web app build pipeline.

## Quick-start

You can build the web ui in the following fashion.
```shell
$ make
```

You can then use the built files for example like this.
```shell
$ python3 -m http.server -b 0.0.0.0 -d build
```

Hint for during development:
```shell
$ watch make
```