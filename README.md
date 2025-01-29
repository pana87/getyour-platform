# getyour official platform

Build with experience. Hosted with getyour. [Release Notes](https://www.get-your.de/docs/release-notes/)

When it comes to software development, it's important to keep in mind that the source code is protected by copyright law. This means that the code belongs to the creator and cannot be used, copied, or distributed without their permission. Copyright is tracked with Github.

Additionally, the use of the code is subject to [specific usage agreements](https://www.get-your.de/nutzervereinbarung/) that outline how the code can be used and distributed. These agreements may restrict the usage of the code to certain individuals or organizations, or require certain conditions to be met before the code can be used.


## CouchDB

You need a [couch db instance](https://docs.couchdb.org/en/stable/install/index.html) for the backend.

.env
```bash
COUCHDB_LOCATION=http://user:password@localhost:5984/

JWT_SECRET=my-jwt-secret

DROID_EMAIL_HOST=my-email-host
DROID_EMAIL_ADDRESS=my-email
DROID_EMAIL_PASSWORD=my-email-password

ADMINS=first.email@my-domain.de, .. ,n.email@my-domain.de

```

# Database Migration

If you have problems log in to your local platform you propably have the old datastructure. For that you need to trigger the migration process on this api endpoint: '/db/migration'. Then try to login again. [If this does not solve your problem please contact us.](mailto:datenschutz@get-your.de)

```js
fetch('http://localhost:9999/db/migration/')
```

## Start

Start the developement environment
```bash
npm run dev
```

## Dependencies

[package.json](https://github.com/pana87/getyour-platform/blob/main/package.json)
