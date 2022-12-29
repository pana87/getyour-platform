# getyour official platform

Build with express. Hosted with netcup.

## Fields

Fields are areas (divs) in the design which are named with a class name. 

```html
<body>
  <div class="my-class-name"></div>

  <script>
    import { TextField } from "js/TextField.js"

    new TextField("div[class*=my-class-name]").withPlaceholder("44600637")
  </script>
</body>
```

## Start the server

```bash
npm run server
```
