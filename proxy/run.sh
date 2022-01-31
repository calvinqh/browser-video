sudo docker run --rm -it --network="host" -v $(pwd)/local-envoy.yaml:/envoy-custom.yaml envoyproxy/envoy:v1.19-latest -c /envoy-custom.yaml
