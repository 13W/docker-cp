Docker Control Panel
====================

This is a web interface(control panel) for [Docker](http://docker.io) containers, 
implemented using [Angular.JS](http://angularjs.org) and [Twitter Bootstrap](http://getbootstrap.com/).

Before using interface, you should launch docker with additional arguments, eg:

```bash
 $ docker -d -H=0.0.0.0:4243 -api-enable-cors
```

Compiling and running using Node.JS
===================================

```bash
 $ npm install
 $ bower install
 $ grunt serve
```

[Demo](http://13W.github.io/docker-cp/)
=======================================

or with defining docker host address
http://13W.github.io/docker-cp/#!/set/host/http://localhost:4243

----

The MIT License (MIT)

Copyright (c) 2014 Vladimir Bulyga

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.