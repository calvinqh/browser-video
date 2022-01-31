# Proxy

Used for local development so that we would be able to serve the `webpack-dev server` web app and `signal-server`. 

## Requirments
* docker (use system package manager to install docker)
  * i.e `sudo apt install docker.io`
* envoyproxy docker image
  * `sudo docker pull envoyproxy/envoy:v1.19-latest`

## Quick Start
1. start the docker daemon

```
sudo dockerd &
```

2. run the container w/ the local config
```
./run.sh
```

If that doesn't work you can do it manually:
```
sudo docker run --rm -it --network="host" -p 9901:9901 -p 10000:10000 -v $(pwd)/local-envoy.yaml:/envoy-custom.yaml envoyproxy/envoy:v1.19-latest -c /envoy-custom.yaml
```

3. You can go to the App
```
localhost:10000/
```


## (Optional) Validate that the envoy image works

1. run the container w/ envoy's demo config
```
sudo docker run --rm -it -p 9901:9901 -p 10000:10000 envoyproxy/envoy:v1.19-latest
```


