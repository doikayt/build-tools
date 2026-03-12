import { buildMermaid } from '../src/core/buildMermaid.js';

test('throws on sanitized id collision', () => {
    expect(() =>
        buildMermaid({
            targets: {
                'animals-dog': {},
                'animals+dog': {}
            }
        })
    ).toThrow('Sanitized node id collision');
});
