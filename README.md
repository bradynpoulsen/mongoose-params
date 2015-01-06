# mongoose-params

`mongoose-params` is designed to give you rails-like parameter helpers to secure your models.

## Installation

```
$ npm install --save mongoose-params
```

## Synopsis

```js
var params = require('mongoose-params');

var UserSchema = new Schema({
  name: String,
  email: String,
  ssn: String
});

UserSchema.plugin(params, {
  permitted: 'name email',
  overrideMethods: false
});

UserSchema.virtual('profile')
  .get(function(){
    return this.only('name', 'email');
  });

var bob = new User({
  name: 'Bob',
  email: 'bob@example.com',
  ssn: '123-45-6789'
});
```

## Methods

### #only(params)

Return only `params` properties for the document

```js
console.log(bob.profile); // {name: 'Bob', email: 'bob@example.com'}
```

### #except(params)

Return all properties except `params` for the document

```js
console.log(bob.except('ssn')); // {name: 'Bob', email: 'bob@example.com'}
```

### #safeUpdate(data, [override], [done])

Update the document using only [permitted] properties. Use `override` to set properties not in [permitted].

```js
bob.safeUpdate({
  email: 'bob@newEmail.com',
  ssn: '000-00-0000'
},{
  role: 'admin'
},function(err, updatedBob){
  console.log(updatedBob); // {name: 'Bob', email: 'bob@newEmail.com', ssn: '123-45-6789', role: 'admin'}
});
```

## Static Methods

### #only(object, [callback], [thisArg])

See [Lodash: \_.pick](https://lodash.com/docs#pick).

### #except(object, [callback], [thisArg])

See [Lodash: \_.omit](https://lodash.com/docs#omit).

### #safeCreate(data, [override], [done])

Create document(s) using only [permitted] properties. Use `override` to set properties not in [permitted].

```js
User.create({
  name: 'Bob',
  email: 'bob@example.com',
  ssn: '123-45-6789'
},{
  role: 'admin'
},function(err, bob){
  console.log(bob); // {name: 'Bob', email: 'bob@example.com', role: 'admin'}
});
```

## Configuration

### permitted: {String|Array&lt;String&gt;}

`String` or `Array<String>` that contains the permitted parameters

These both give the same result:

```js
ThingSchema.plugin(require('mongoose-params'),{
  permitted: 'title description details'
});

ThingSchema.plugin(require('mongoose-params'),{
  permitted: ['title', 'description', 'details']
});
```

### overrideMethods: {Boolean}

This option will set the mongoose `Model.create` and `Document.update` methods
to [#safeCreate](#safeCreate) and [#safeUpdate](#safeUpdate), respectively.

## License

The MIT License (MIT)

Copyright (c) 2015 Bradyn Poulsen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
