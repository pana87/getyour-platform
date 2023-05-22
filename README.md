# getyour official platform

Build with experience. Hosted with getyour. [Release Notes](https://www.get-your.de/docs/release-notes/)

When it comes to software development, it's important to keep in mind that the source code is protected by copyright law. This means that the code belongs to the creator and cannot be used, copied, or distributed without their permission. Copyright is tracked with Github.

Additionally, the use of the code is subject to [specific usage agreements](https://www.get-your.de/pana/getyour/nutzervereinbarung/) that outline how the code can be used and distributed. These agreements may restrict the usage of the code to certain individuals or organizations, or require certain conditions to be met before the code can be used.

# Standards

## Icons and logos

Only svg.

## Data

Only add or multiply. Never substract, delete or divide.


## Functions

Try the green path else lead to error.

```js
function myFunction() {
  try {
    if (something) throw new Error(message)
    // green path
  } catch (error) {
    console.error(error)
  }
}
```

## Documents

Documents are HTML documents.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta/>
    <style></style>
    <script></script>
  </head>
  <body>
    <style></style>
    <script></script>
  </body>
</html>
```

## Fields

Fields are `div` elements (placeholder elements) in the document with a class name. Under the hood, the constructor will query the document using the [querySelectorAll method](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) and append a text input for each field found in the document.

```html
<head>
  <script src="https://get-your.de/js/TextField.js"></script>
</head>
<body>
  <div class="my-class-name"></div>
  <script>
    const myTextField = new TextField("my-class-name")
    .withType(input => {
      input.placeholder = "My new text field"
    })
  </script>
</body>
```

## Start the developement environment

```bash
npm run dev
```
