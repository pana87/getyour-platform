# getyour official platform

Build with express. Hosted with netcup.

## Fields

Fields are areas (divs) in the design which are named with a class name. 

```js
new TextField("div[class*=my-class-name]").withPlaceholder("44600637").withSHSDefault()
```

## Start the server

```bash
npm run getyour
```

## Fetch static component and make it dynamic in javascript class.

```js
async connectedCallback() {
  // GET THE PATH TO STATIC ASSETS
  const path = `${window.__URL__}/felix/shs/technician/checklist-item/`
  const styleguide = `${path}styleguide.css`

  // FETCH STATIC FROM ENDPOINT
  const response = await fetch(path)
  const data = await response.text()

  // ADD LINK FOR EXTERNAL STATIC ASSETS (LINKS SHOULD BE IN LIGHT AND SHADOW DOM)
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = styleguide

  // ADD PARSED HTML TO SHADOW DOM AND LINK TO LIGHT DOM
  this.shadowRoot.innerHTML = data
  this.append(link)
}
```

## Set a path in `server.js` to be requested by user.

```js
// THIS PATH SHOULD BE IN GERMAN (OUTSIDE)
app.get('/toolbox/funnel/ansicht/:funnelName/', (request, response) => {
  // THE PATHS SHOULD NOT BE EQUAL

  // THIS PATH SHOULD BE IN ENGLISH (INSIDE)
  const result = _parseAssets("/toolbox/funnel/view/")
  response.send(result)
})
```

## Map the paths to fetch the parsed html.

```js
app.get("/felix/shs/technician/checklist-item/", (request, response) => {
  const result = _parseAssets("/felix/shs/technician/checklist-item/")
  response.send(result)
})
```
