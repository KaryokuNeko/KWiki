.PHONY: help build push clean version

# Read version from .VERSION file
VERSION := $(shell cat .VERSION)

# Docker image configuration
IMAGE_NAME := k-wiki-app
REGISTRY ?= registry.orb.local
IMAGE_TAG := $(REGISTRY)/$(IMAGE_NAME)

# Colors for output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m

version: ## Display current version
	@echo "$(COLOR_BOLD)Current version:$(COLOR_RESET) $(VERSION)"

build: ## Build Docker image with version tag and latest tag
	@echo "$(COLOR_YELLOW)Building Docker image...$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)Version:$(COLOR_RESET) $(VERSION)"
	@echo "$(COLOR_BOLD)Image:$(COLOR_RESET) $(IMAGE_TAG):$(VERSION)"
	@docker build -t $(IMAGE_TAG):$(VERSION) -t $(IMAGE_TAG):latest .
	@echo "$(COLOR_GREEN)Build completed successfully!$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)Tagged as:$(COLOR_RESET)"
	@echo "  - $(IMAGE_TAG):$(VERSION)"
	@echo "  - $(IMAGE_TAG):latest"

push: ## Push Docker image to registry (both version and latest tags)
	@echo "$(COLOR_YELLOW)Pushing Docker images to registry...$(COLOR_RESET)"
	@docker push $(IMAGE_TAG):$(VERSION)
	@docker push $(IMAGE_TAG):latest
	@echo "$(COLOR_GREEN)Push completed successfully!$(COLOR_RESET)"

build-push: build push ## Build and push Docker image
