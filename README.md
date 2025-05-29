# Local filehost server
Pure `node js` based server for locally shared files


##  Download and start server
- Download the source code on Windows:
  - `git clone https://github.com/DeTosis/nodejs-local-file-host-server.git`
  - Or using link: [master](https://github.com/DeTosis/nodejs-local-file-host-server/archive/refs/heads/master.zip)
-  Navigate to `/server-core`
-  Using `cmd.exe` run command `node .` in `server-core` directory

## Usage
Server has its own folder called `../shared`. This folder contains all files that you are upload

After starting up server you can navigate to `http://localhost:7900` to access web ui

Or by using ipv4 `http://<IpV4Adress>:7900` to connect from local network

## Web UI
![serverPrev](https://github.com/user-attachments/assets/cc891119-f240-4282-8739-c4a28ce35faf)

## TIP
> Add Port `7900` to the firewall inbound rulle to allow connections
> 
> For `Oracle Virtual Box` users:
> 
> - In the `Network` tab of your VM set `Attached to:` property to `Bridged Adapter` to be able to connect with host's `ipV4`

## Misc
- Port that server is operating on are currently pre-defined
  - You can can change port in `./server-core/index.js` `line: 6` 
