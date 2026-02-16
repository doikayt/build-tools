import { buildMermaid } from '../src/core/buildMermaid';

describe('buildMermaid()', () => {

    test('renders empty targets', () => {
        const output = buildMermaid({ targets: {} });

        expect(output).toBe(
            `graph TD

`
        );
    });

    test('renders single target without description', () => {
        const output = buildMermaid({
            targets: {
                build: {}
            }
        });

        expect(output).toBe(
            `graph TD

  build

`
        );
    });

    test('renders single target with description', () => {
        const output = buildMermaid({
            targets: {
                build: {
                    description: 'Compile source'
                }
            }
        });

        expect(output).toBe(
            `graph TD

  build["build<br/>Compile source"]

`
        );
    });

    test('sorts targets alphabetically', () => {
        const output = buildMermaid({
            targets: {
                zeta: {},
                alpha: {}
            }
        });

        expect(output).toBe(
            `graph TD

  alpha
  zeta

`
        );
    });

    test('renders dependency edge', () => {
        const output = buildMermaid({
            targets: {
                build: {
                    dependsOn: ['lint']
                },
                lint: {}
            }
        });

        expect(output).toBe(
            `graph TD

  build
  lint

  build --> lint
`
        );
    });

    test('sorts dependencies alphabetically', () => {
        const output = buildMermaid({
            targets: {
                build: {
                    dependsOn: ['zeta', 'alpha']
                },
                alpha: {},
                zeta: {}
            }
        });

        expect(output).toBe(
            `graph TD

  alpha
  build
  zeta

  build --> alpha
  build --> zeta
`
        );
    });

    test('ignores dependencies that do not exist in targets', () => {
        const output = buildMermaid({
            targets: {
                build: {
                    dependsOn: ['missing']
                }
            }
        });

        expect(output).toBe(
            `graph TD

  build

`
        );
    });

    test('escapes HTML characters in description', () => {
        const output = buildMermaid({
            targets: {
                build: {
                    description: 'Compile <src> & "dist"'
                }
            }
        });

        expect(output).toBe(
            `graph TD

  build["build<br/>Compile &lt;src&gt; &amp; &quot;dist&quot;"]

`
        );
    });

    test('deterministic output across repeated calls', () => {
        const input = {
            targets: {
                b: { dependsOn: ['a'] },
                a: {}
            }
        };

        const first = buildMermaid(input);
        const second = buildMermaid(input);

        expect(first).toBe(second);
    });

});
