#!/bin/bash
# +----------------+
# | npm preinstall |
# +----------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh

# Go back to module root
cd ..

echo
# check version in package.json file
Installer_version="$(grep -Eo '\"version\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

# Let's start !
Installer_info "Welcome to $Installer_module v$Installer_version"

echo

# Check not run as root
Installer_info "No root checking..."
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 255
fi
Installer_chk "$(pwd)/" "$Installer_module"
Installer_chk "$(pwd)/../../" "MagicMirror"
echo

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "Automatic installation is not included"
  echo
  exit 255
else
  if  [ "$os_name" == "raspbian" ] && [ "$os_version" -lt 10 ]; then
    Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
    Installer_error "Unfortunately, this module is not compatible with your OS"
    Installer_error "Try to update your OS to the lasted version of raspbian"
    echo
    exit 255
  else
    Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  fi
fi

dependencies=(python3 python-is-python3 python3-pip)
Installer_info "Checking all dependencies..."
Installer_update_dependencies
Installer_success "All Dependencies needed are installed !"

echo
Installer_info "Cloning spotify-canvas-downloader"
rm -rf server
git clone https://github.com/bugsounet/spotify-canvas-downloader server

echo
Installer_info "Installing requirements.txt..."
cd server
pip install --no-cache-dir --upgrade -r requirements.txt
