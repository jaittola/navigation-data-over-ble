#!/bin/bash

exec rsync -av --exclude '*~' --exclude node_modules/ --exclude '.git*' . pi@bleke.local:navi-ble-server/
