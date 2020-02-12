# Unfold - Deployment utility for DigitalOcean

**Elastic Beanstalk like deployments for DigitalOcean**

## Deployment file

```yaml
deployment:
  name: my-new-application
  tag: my-app-tag
  region: nyc3
  sshKeys:
    - 1111111
    - 2222222

application:
  buildpack: ubuntu-18-04-x64_nginx
  size: s-1vcpu-1gb
  replicas: 2

services:
  - kind: loadbalancer
    healthcheck: /
    rules:
      - protocol: http
        port: 80
        targetPort: 3000
      - protocol: https
        port: 443
        targetPort: 3000
```

### Available buildpacks

- [ubuntu-18-04-x64_nginx](https://github.com/mitjafelicijan/unfold/blob/master/bin/buildpacks/ubuntu-18-04-x64_nginx.sh)
- [ubuntu-18-04-x64_nodejs.12](https://github.com/mitjafelicijan/unfold/blob/master/bin/buildpacks/ubuntu-18-04-x64_nodejs.12.sh)

If you would want to contribute additional buildpacks please create a pull request.

### Available regions

- nyc1
- ams1
- sfo1
- nyc2
- ams2
- sgp1
- lon1
- nyc3
- ams3
- nyc3

### Available size of Droplets

- s-1vcpu-1gb
- s-1vcpu-2gb
- s-1vcpu-3gb
- s-2vcpu-2gb
- s-3vcpu-1gb
- s-2vcpu-4gb
- s-4vcpu-8gb
- s-8vcpu-32gb
- s-12vcpu-48gb
- s-16vcpu-64gb
- s-20vcpu-96gb
- s-24vcpu-128gb
- s-32vcpu-192gb
