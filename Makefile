test:
	npm test

.PHONY: test

lint:
	find lib test -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jslint --forin

.PHONY: lint
