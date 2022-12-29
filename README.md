# getyour official platform

Build with experience. Hosted with getyour.

## Standards

Try the green path else lead to error.

```js
function myFunction() {
  try {
    // green path
  } catch (error) {
    console.error(error)
  }
}
```

## Documents

Documents are HTML documents.

## Fields

Fields are `div` elements (placeholder elements) in the document with a class name. The syntax for the class name `'my-class-name'` is mandatory at the moment. Under the hood, the constructor will query the document using the [querySelectorAll method](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) and append a text input for each field found in the document.

```html
<body>
  <div class="my-class-name"></div>

  <script>
    import { TextField } from "client/js/TextField.js"

    new TextField("div[class*='my-class-name']").withPlaceholder("44600637")
  </script>
</body>
```

## Start the server

```bash
npm run server
```
