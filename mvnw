#!/bin/sh
# Apache Maven Wrapper startup script for POSIX compliant shells
set -e

BASEDIR="$(cd "$(dirname "$0")"; pwd -P)"
MAVEN_PROJECTBASEDIR="$BASEDIR"
WRAPPER_JAR="$BASEDIR/.mvn/wrapper/maven-wrapper.jar"
PROPS_FILE="$BASEDIR/.mvn/wrapper/maven-wrapper.properties"

if [ ! -f "$WRAPPER_JAR" ]; then
  if [ -f "$PROPS_FILE" ]; then
    WRAPPER_URL=$(grep -E '^wrapperUrl=' "$PROPS_FILE" | cut -d'=' -f2-)
  fi
  if [ -z "$WRAPPER_URL" ]; then
    WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
  fi
  mkdir -p "$(dirname "$WRAPPER_JAR")"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$WRAPPER_JAR" "$WRAPPER_URL"
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$WRAPPER_JAR" "$WRAPPER_URL"
  else
    echo "Error: need curl or wget to download maven-wrapper.jar" >&2
    exit 1
  fi
fi

JAVA_EXE="java"
if [ -n "$JAVA_HOME" ]; then
  JAVA_EXE="$JAVA_HOME/bin/java"
fi

exec "$JAVA_EXE" $MAVEN_OPTS -Dmaven.multiModuleProjectDirectory="$MAVEN_PROJECTBASEDIR" -cp "$WRAPPER_JAR" org.apache.maven.wrapper.MavenWrapperMain "$@"
