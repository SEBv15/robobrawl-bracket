# Robobrawl Bracket Frontend

This is the react source code for the wordpress robobrawl bracket plugin.

## Development

Because of CORS and me being too lazy to find an elegant solution, the fetch url in `App.js` needs to be switched to a mock server on localhost for development. Don't forget to switch it back for building tho!

Then run

```
yarn start
```

## Deploying

Just run 
```
yarn build
```
and copy the build folder to `/bracket-page/` in the plugin