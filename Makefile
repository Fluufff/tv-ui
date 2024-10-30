SHELL:=/bin/bash
.DEFAULT_GOAL := build

.PHONY: build
build: build/index.html build/index.js build/index.css

build/index.html: src/html/index.html
	mkdir -p $$(dirname $@)
	npx html-minifier \
		--case-sensitive \
		--collapse-boolean-attributes \
		--collapse-inline-tag-whitespace \
		--collapse-whitespace \
		--decode-entities \
		--minify-css true \
		--minify-js true \
		--remove-attribute-quotes \
		--remove-comments \
		--remove-redundant-attributes \
		--remove-script-type-attributes \
		--remove-style-link-type-attributes \
		--sort-attributes \
		--sort-class-name \
		--use-short-doctype \
		$? > $@

build/index.js: $(shell find src/js -name '*.ts' -type f)
	mkdir -p cache/js cache/rollup cache/babel
	npx tsc
	npx rollup --config=.config/rollup.mjs cache/js/index.js --file cache/rollup/index.js
	npx babel --config-file=./.config/babel.json cache/rollup/index.js > cache/babel/index.js
	npx uglifyjs cache/babel/index.js > $@

build/index.css: $(shell find src/css -name '*.scss' -type f)
	mkdir -p $$(dirname $@) cache/css
	npx sass --no-source-map src/css/main.scss cache/css/index.css
	npx postcss --config=.config --no-map cache/css/index.css -o $@

.PHONY: clean
clean:
	rm -rf build cache
