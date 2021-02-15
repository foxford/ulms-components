#!/bin/sh -e

# NOTE: rollup-plugin-postcss mix all the css data at one file while processing multiple packages
## that's why we run script separately for each package

UI_PACKAGES=$(find ./${UI_PACKAGES_DIR:-src/packages}/* -maxdepth 0 -type d | sed 's/^.*\/\([a-z-]*\)$/\1/')
UI_COMMANDS=()

for arg in ${UI_PACKAGES}; do
  UI_COMMANDS+=("npm run old_build/package -- WHITELIST=$arg")
done

npx concurrently --kill-others-on-fail "${UI_COMMANDS[@]}"
