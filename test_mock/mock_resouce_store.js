/*
 * @license MIT License
 *
 * Copyright (c) 2014 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

const HEADER_CONTENT_TYPE = 'Content-Type';
const MIME_TEXT = 'text/plain';
const MIME_JSON = 'application/json';

const PATH_PREFIX = '/test/resource_store';

/*
 *  Test for ResourceStore:
 */
module.exports = function (app) {
    // get
    [200, 300, 400, 500, 403].forEach(function(n){
        let num = String(n);

        app.get(PATH_PREFIX + '/get_' + num + '/', function (req, res) {
            res.status(num).header(HEADER_CONTENT_TYPE, MIME_TEXT)
                .send('get-' + num + '-expected');
        });

        app.get(PATH_PREFIX + '/get_' + num + '_json/', function (req, res) {
            let val = JSON.stringify({
                value: 'get-' + num + '-json',
            });
            res.status(num).header(HEADER_CONTENT_TYPE, MIME_JSON)
                .send(val);
        });
    });

    app.get(PATH_PREFIX + '/get_200_broken_json/', function (req, res) {
        res.status(200).header(HEADER_CONTENT_TYPE, MIME_JSON)
            .send('{,,,,,}');
    });
    app.get(PATH_PREFIX + '/get_400_broken_json/', function (req, res) {
        res.status(400).header(HEADER_CONTENT_TYPE, MIME_JSON)
            .send('{,,,,,}');
    });
    app.get(PATH_PREFIX + '/get_403_broken_json/', function (req, res) {
        res.status(403).header(HEADER_CONTENT_TYPE, MIME_JSON)
            .send('{,,,,,}');
    });

    // post:
    [200, 300, 400, 500, 403].forEach(function(n){
        let num = String(n);

        app.post(PATH_PREFIX + '/post_' + num + '/', function (req, res) {
            if (!req.is(MIME_JSON)) {
                res.status(400)
                    .header(HEADER_CONTENT_TYPE, MIME_JSON)
                    .json({
                        isValid: false,
                        reason: 'invalid content type',
                    });
                return;
            }

            if (!req.accepts(MIME_JSON)) {
                res.status(400)
                    .header(HEADER_CONTENT_TYPE, MIME_JSON)
                    .json({
                        isValid: false,
                        reason: 'invalid accept type',
                    });
                return;
            }

            let payload = req.body;
            if (payload.val !== n) {
                let reason = 'invalid val: ' + String(payload.val) + ', expected: ' + String(num);
                res.status(400)
                    .header(HEADER_CONTENT_TYPE, MIME_JSON)
                    .json({
                        isValid: false,
                        val: payload.val,
                        reason: reason,
                    });
                return;
            }

            res.status(num)
                .header(HEADER_CONTENT_TYPE, MIME_JSON)
                .json({
                    isValid: true,
                });
        });
    });
};
