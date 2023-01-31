#!/bin/bash

# Update Greptimedb to latest released version
# Will download the latest release into ./greptime/

# Check if currently installed version is the latest
# Currently use tag name to check version

release_info=$(
    curl -s https://api.github.com/repos/GreptimeTeam/greptimedb/releases/latest
)

release_version=$(
    echo $release_info \
    | grep -o '"tag_name": "[^"]*'  \
    | grep -o '[^"]*$'
)

echo "Latest released version: $release_version"

if [ -f ./greptime/version.txt ]; then

    current_version=$(
        cat ./greptime/version.txt
    )

    echo "Current version: $current_version"

    if [ "$current_version" == "$release_version" ]; then
        echo "Greptimedb is already up to date"
        exit 0
    fi

fi

echo "Your Greptimedb is not up to date, updating..."

releases=$(
    echo "$release_info"                \
    | grep "browser_download_url.*tgz"  \
    | cut -d : -f 2,3                   \
    | tr -d \"                          
)

# echo "Available releases: $releases"

# Find the latest release by system and architecture

system=$(
    uname -s \
    | tr '[:upper:]' '[:lower:]'
)

arch=$(
    case $(uname -m) 
    in
        x86_64) echo "amd64" ;;
        aarch64) echo "arm64" ;;
        *) echo "unknown" ;;
    esac
)


for available_url in $releases; do

    if [[ "$available_url" == *"$system-$arch"* ]]; then
        url=$available_url
    fi

done

if [ -z "$url" ]; then
    echo "No release found for your system."
    exit 1
fi

# download the tarball into ./greptime/

echo "Downloading from $url"

mkdir -p ./greptime
curl -L $url -o ./greptime/greptimedb.tgz

if ! [ -f ./greptime/greptimedb.tgz ]; then
    echo "Download failed."
    exit 1
fi

# unzip then remove the tarball

# echo "Unzipping greptimedb.tgz"
tar -xzf ./greptime/greptimedb.tgz -C ./greptime
rm ./greptime/greptimedb.tgz

# update version.txt

echo "$release_version" > ./greptime/version.txt

echo "You have successfully updated Greptimedb to $release_version"
