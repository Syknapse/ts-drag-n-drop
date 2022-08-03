# TS Drag'n'Drop project

A project to practice TypeScript

## Run

Install project with `npm install`

Run project with `npm run start` this will start a development server on localhost:3000

Start TypeScript compiler watch mode (this is no longer needed as webpack takes charge of compiling)
`npx tsc -w` or `npm run watch`

## Deploy

The project is published on GitHub Pages reading from the main branch, the index.html points at the webpack js bundle file in /dist.  
To publish new changes first build the project `npm run build`. This will create a new bundle.js file in /dist (and eliminate earlier version). Then commit and push to deploy to gh-pages.
