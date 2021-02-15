#!/bin/bash -ex

if [[ ! -z $1 ]]; then
PACKAGE_NAME=${PACKAGE_NAME:-$1}
fi

if [[ ! ${PACKAGE_NAME} ]]; then echo "PACKAGE_NAME isn't specified" 1>&2; exit 1; fi

cp -a ./rollup.d/. ./packages/${PACKAGE_NAME}
