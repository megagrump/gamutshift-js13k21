.PHONY: test clean bundle install

default: test

install:
	npm install webpack terser-webpack-plugin

test:
	firefox --new-window http://localhost:8000

clean:
	rm -rf dist

bundle: clean
	npx webpack --mode production
	sed -e '/@MAIN@/ r dist/main.js' -e //d src/index.html.dist >dist/index.html
	zip -qj dist/bundle.zip dist/index.html && advzip -qz4 dist/bundle.zip
