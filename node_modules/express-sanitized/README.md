# express-sanitized

## Installation

```
npm install express-sanitized
```

## Usage

Place this directly after express.bodyParser() and before any request parameters are used, e.g.:


```javascript
var express = require('express'),
    expressSanitized = require('express-sanitized');

app.use(express.bodyParser());
app.use(expressSanitized()); // this line follows express.bodyParser()

```


## Output

The string 
```javascript
'<script>document.write('cookie monster')</script> download now'
```
will be sanitized to ' download now'.

## Limitations

This is a basic implementation of [Caja-HTML-Sanitizer](https://github.com/theSmaw/Caja-HTML-Sanitizer) with the specific purpose of mitigating against persistent XSS risks. 

## Caveats

This module trusts the dependencies to provide basic persistent XSS risk mitigation. A user of this package should review all packages and make their own decision on security and fitness for purpose. 

This module was inspired by [express-sanitizer](https://www.npmjs.org/package/express-sanitizer).
  The difference here is strict laziness.  This middleware automatically
  sanitizes post and query values whereas that module requires you to manually sanitize each
  parameter.

## Changelog

### v0.5.1
- Initial release

## Contributors

- Patrick Hogan <patrick@callinize.com> - Wrap the sanitizer in an npm package
- [Callinize](http://www.callinize.com)

## License

Copyright (c) 2014 Patrick Hogan <patrick@callinize.com>, MIT License

