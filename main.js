import { JsonArrayReader } from './json-array-reader.js';

let schema = {}

const NULL = "<null>";
const UNDEFINED = "<undefined>";
const STRING = "<string>";
const NUMBER = "<number>";
const BOOLEAN = "<boolean>";
const OBJECT = "<object>";
const ARRAY = "<array>";
const MISSING = "<missing>";
const EMPTY = "<empty>";

function getObjectType(object) {
  if (object === null) return NULL;
  if (object === undefined) return UNDEFINED;

  switch (typeof (object)) {
    case "string": return STRING;
    case "number": return NUMBER;
    case "boolean": return BOOLEAN;
  }

  if (Array.isArray(object)) return ARRAY;

  return OBJECT;
}

function mountArraySchema(output, items) {
  if (items.length === 0) output[EMPTY] = {}

  for (const item of items) {
    const type = getObjectType(item);

    if (!(type in output)) output[type] = {}

    switch (type) {
      case OBJECT: mountObjectSchema(output[type], item); break;
      case ARRAY: mountArraySchema(output[type], item); break;
    }
  }
}

function mountObjectSchema(output, document) {
  for (const key in document) {
    const type = getObjectType(document[key]);

    if (!(key in output)) {
      output[key] = {
        [type]: {}
      }
    }

    if (!(type in output[key])) output[key][type] = {}

    switch (type) {
      case OBJECT: mountObjectSchema(output[key][type], document[key]); break;
      case ARRAY: mountArraySchema(output[key][type], document[key]); break;
    }
  }

  for (const key in output) {
    if (!(key in document)) {
      output[key][MISSING] = {};
    }
  }
}

const args = process.argv.slice(2);
let index = 0;

function shift() {
  if (index >= args.length) return null;

  return args[index++];
}

const targetJsonArray = shift();

if (targetJsonArray === null) {
  console.log('Missing json filename as argument. Please try again!');
  process.exit(1);
}

const reader = new JsonArrayReader(targetJsonArray);

await reader.read(mountObjectSchema.bind(this, schema));

console.log(JSON.stringify(schema, null, 2))
