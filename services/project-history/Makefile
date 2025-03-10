# This file was auto-generated, do not edit it directly.
# Instead run bin/update_build_scripts from
# https://github.com/overleaf/internal/

BUILD_NUMBER ?= local
BRANCH_NAME ?= $(shell git rev-parse --abbrev-ref HEAD)
PROJECT_NAME = project-history
BUILD_DIR_NAME = $(shell pwd | xargs basename | tr -cd '[a-zA-Z0-9_.\-]')

DOCKER_COMPOSE_FLAGS ?= -f docker-compose.yml
DOCKER_COMPOSE := BUILD_NUMBER=$(BUILD_NUMBER) \
	BRANCH_NAME=$(BRANCH_NAME) \
	PROJECT_NAME=$(PROJECT_NAME) \
	MOCHA_GREP=${MOCHA_GREP} \
	docker-compose ${DOCKER_COMPOSE_FLAGS}

DOCKER_COMPOSE_TEST_ACCEPTANCE = \
	COMPOSE_PROJECT_NAME=test_acceptance_$(BUILD_DIR_NAME) $(DOCKER_COMPOSE)

DOCKER_COMPOSE_TEST_UNIT = \
	COMPOSE_PROJECT_NAME=test_unit_$(BUILD_DIR_NAME) $(DOCKER_COMPOSE)

clean:
	-docker rmi ci/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	-docker rmi gcr.io/overleaf-ops/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	-docker rmi us-east1-docker.pkg.dev/overleaf-ops/ol-docker/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	-$(DOCKER_COMPOSE_TEST_UNIT) down --rmi local
	-$(DOCKER_COMPOSE_TEST_ACCEPTANCE) down --rmi local

HERE=$(shell pwd)
MONOREPO=$(shell cd ../../ && pwd)
# Run the linting commands in the scope of the monorepo.
# Eslint and prettier (plus some configs) are on the root.
RUN_LINTING = docker run --rm -v $(MONOREPO):$(MONOREPO) -w $(HERE) node:18.18.2 npm run --silent

format:
	$(RUN_LINTING) format

format_fix:
	$(RUN_LINTING) format:fix

lint:
	$(RUN_LINTING) lint

lint_fix:
	$(RUN_LINTING) lint:fix

test: format lint test_unit test_acceptance

test_unit:
ifneq (,$(wildcard test/unit))
	$(DOCKER_COMPOSE_TEST_UNIT) run --rm test_unit
	$(MAKE) test_unit_clean
endif

test_clean: test_unit_clean
test_unit_clean:
ifneq (,$(wildcard test/unit))
	$(DOCKER_COMPOSE_TEST_UNIT) down -v -t 0
endif

test_acceptance: test_acceptance_clean test_acceptance_pre_run test_acceptance_run
	$(MAKE) test_acceptance_clean

test_acceptance_debug: test_acceptance_clean test_acceptance_pre_run test_acceptance_run_debug
	$(MAKE) test_acceptance_clean

test_acceptance_run:
ifneq (,$(wildcard test/acceptance))
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) run --rm test_acceptance
endif

test_acceptance_run_debug:
ifneq (,$(wildcard test/acceptance))
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) run -p 127.0.0.9:19999:19999 --rm test_acceptance npm run test:acceptance -- --inspect=0.0.0.0:19999 --inspect-brk
endif

test_clean: test_acceptance_clean
test_acceptance_clean:
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) down -v -t 0

test_acceptance_pre_run:
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) up -d mongo
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) exec -T mongo sh -c ' \
		while ! mongo --eval "db.version()" > /dev/null; do \
			echo "Waiting for Mongo..."; \
			sleep 1; \
		done; \
		mongo --eval "rs.initiate({ _id: \"overleaf\", members: [ { _id: 0, host: \"mongo:27017\" } ] })"'
ifneq (,$(wildcard test/acceptance/js/scripts/pre-run))
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) run --rm test_acceptance test/acceptance/js/scripts/pre-run
endif

benchmarks:
	$(DOCKER_COMPOSE_TEST_ACCEPTANCE) run --rm test_acceptance npm run benchmarks

build:
	docker build --pull --tag ci/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER) \
		--tag gcr.io/overleaf-ops/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER) \
		--tag us-east1-docker.pkg.dev/overleaf-ops/ol-docker/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER) \
		--file Dockerfile \
		../..

tar:
	$(DOCKER_COMPOSE) up tar

publish:

	docker push $(DOCKER_REPO)/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)


.PHONY: clean test test_unit test_acceptance test_clean benchmarks build publish
