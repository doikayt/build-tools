import { buildMermaid } from '../src/core/buildMermaid';

describe('project.json structural validation', () => {

    test('throws if targets key is missing', () => {
        expect(() =>
            buildMermaid({} as any)
        ).toThrow('project.json must contain a "targets" object');
    });

    test('throws if targets is not an object', () => {
        expect(() =>
            buildMermaid({
                targets: 'not-an-object'
            } as any)
        ).toThrow('project.json must contain a "targets" object');
    });

});

