#!/usr/bin/env bash
set -e

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "Packing tarball..."
npm pack --pack-destination "$TMPDIR" > /dev/null

TARBALL=$(ls "$TMPDIR"/*.tgz)
echo "Installing $TARBALL into $TMPDIR..."
INSTALL_DIR="$TMPDIR/install"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
npm install --ignore-scripts "$TARBALL" > /dev/null 2>&1

echo "Running binary smoke test..."
# Run the installed binary with empty stdin (user will interrupt immediately)
# A working binary will start successfully before being interrupted
OUTPUT=$(./node_modules/.bin/notadev < /dev/null 2>&1 || true)
CODE=$?

# Check for specific error messages that indicate bundling/loading failures
if echo "$OUTPUT" | grep -qi "dynamic require\|ERR_MODULE_NOT_FOUND\|cannot find module\|Error: \(.*\) is not defined"; then
  echo "FAIL: binary crashed during load"
  echo "---"
  echo "$OUTPUT" | head -20
  exit 1
fi

echo "OK: binary loaded successfully"
