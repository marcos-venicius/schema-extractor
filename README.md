# Schema Extractor

Extract the schema of a json file.


This script expects a json file, an array or an object.

- When the json file is an object, the output will be the schema of this object.
- When the json file is an array, the output will be the schema among the array objects.


For example, if you run `node . package.json`, the output will be something like:

```json
{
  "name": {
    "<string>": {}
  },
  "version": {
    "<string>": {}
  },
  "type": {
    "<string>": {}
  },
  "main": {
    "<string>": {}
  },
  "scripts": {
    "<object>": {}
  },
  "keywords": {
    "<array>": {
      "<empty>": {}
    }
  },
  "author": {
    "<string>": {}
  },
  "license": {
    "<string>": {}
  },
  "description": {
    "<string>": {}
  }
}
```

> Json examples from [json.org](https://json.org/example.html)
