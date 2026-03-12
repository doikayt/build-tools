import { buildMermaid } from '../src/core/buildMermaid.js';

describe('node id collision detection', () => {

    test('throws when two targets sanitize to same id', () => {
        expect(() =>
            buildMermaid({
                targets: {
                    'animals-dog': {},
                    'animals+dog': {}
                }
            })
        ).toThrow('Sanitized node id collision detected: animals_dog');
    });

});

