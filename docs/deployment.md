# Deploy Memoriko

Run `./deploy-frontend.command` from this repository or its convenience link under
`/Users/tmikava/projects/memoriko`. It builds the local working tree, including
uncommitted changes, and uploads a versioned release using the SSH alias
`ubuntu-spaced-repetition`. No Git commit or push is required to deploy.

The frontend is served from `https://memoriko.com`, with a relative `/api` backend
URL. Nginx handles deep links and HTTPS, and forwards API routes without stripping
`/api`. Its configuration is recorded in `deployment/nginx.conf`.

Releases are retained under `/var/www/memoriko/releases`; `current` is switched
atomically. The release manifest records the Git revision and whether the working
tree was dirty. `artifact.sha256` records the uploaded archive's checksum.
Previous hashed assets remain available for sessions that loaded an older release.

To restore a frontend release:

```sh
./deploy-frontend.command --rollback RELEASE_ID
```

Deploy backend changes separately using `../spaced-repetition-api/deploy-backend.command`.
Deploy a compatible API before the frontend that requires it.

GitHub Pages now serves redirects, including legacy deep-link query encoding and
service-worker retirement. Build its redirect artifact with:

```sh
node scripts/build-legacy-redirect.cjs /tmp/memoriko-legacy-redirect
```

Publish that artifact only after memoriko.com has passed acceptance checks.
The canonical Vite config is `vite.config.ts`; generated JavaScript/declaration
config files must not be committed. Production API calls use `/api`.
