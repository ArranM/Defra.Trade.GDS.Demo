import { describe, expect, test } from 'vitest'
import { hello } from '../wwwroot/js/helloworld-min';

describe('Basic javascript test', () => {

    test('Minified hello world test', () => {
        var sut = hello();
        expect(sut).toEqual('Hello World!');
    });
});