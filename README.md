[![Build Status](https://secure.travis-ci.org/naholyr/node-ftp-server.png)](http://travis-ci.org/naholyr/node-ftp-server)

# FTP Server -- Simple featureless FTP server

This is a very simple FTP server. At first it's aimed to simply provide a full-Node implementation of FTP server.

## News

 * Add support windows ftp client: Total Commander, FileZilla FTP Client
 * Add support for rename commands
 * Better implementation of `LIST` and `NLST` to be cross-platform


## Install

from source:

```bash
# Install from sources...
git clone git://github.com/sandbil/node-ftp-server.git ftp-server
cd ftp-server

## Usage

Example: Simply serve a given directory:

```javascript
var ftpd = require('ftp-server')
// Path to your FTP root
ftpd.fsOptions.root = '/path/to/ftp-root'
// Start listening on port 21 (you need to be root for ports < 1024)
ftpd.listen(21)
```

## Extend server

Just look at the code. I'll fully document the ways to extend the server with additional features when it's at least more stable.

## Paternity

Note that the original implementation I based my work on was [@billywhizz 's from GitHub](https://github.com/billywhizz/nodeftpd).

## Roadmap
 * Add support for `REST` command (restart an interrupted download)
 * Maybe wrap all this stuff in a class or at least a function with options (like what FS we'll use)
 * Add better documentation on how to extend server (add "features") or new FS wrappers
 * Implement MemoryFS
 * Support authentication from config or even from database
 * Implement all the RFCs from FTP protocol

## License: MIT

```
Copyright (C) 2012 Nicolas Chambrier

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
