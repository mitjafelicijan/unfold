# Unfold - Deployment utility for DigitalOcean

**Elastic Beanstalk like deployments for DigitalOcean**

**Still in development phase. USE AT YOUR OWN DISCRETION!**

[Ideas, bugs, features can be submitted here »](https://github.com/mitjafelicijan/unfold/issues/new)

## Tutorial

[![asciicast](https://asciinema.org/a/tXryPoUnxK1LtowNusVXimNE6.svg)](https://asciinema.org/a/tXryPoUnxK1LtowNusVXimNE6)

## Prerequisites

1. [Add SSH key to your account](https://cloud.digitalocean.com/account/security)
2. [Generate new personal access token](https://cloud.digitalocean.com/account/api/tokens)
3. Install unfold tool `[sudo] npm i -g @mitjafelicijan/unfold`
4. If first time use, execute `unfold --auth`
5. Go to your projects's folder and execute `unfold --init`
6. Create `deployment.yml` by executing `unfold --create`
7. Deploy your code with `unfold --deploy`

Check also `unfold --help` for additional information.

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
