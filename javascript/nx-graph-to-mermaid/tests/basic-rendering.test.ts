import { buildMermaid } from '../src/core/buildMermaid.js';

describe('buildMermaid()', () => {

    test('renders empty targets', () => {
        const output = buildMermaid({ targets: {} });

        expect(output).toBe(
            `${'```mermaid'}
graph TD


${'```'}`
        );
    });

    test('renders single target without description', () => {
        const output = buildMermaid({
            targets: {
                build: {}
            }
        });

        expect(output).toBe(
            `${'```mermaid'}
graph TD

  build

${'```'}`
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
            `${'```mermaid'}
graph TD

  build["build<br/>Compile source"]

${'```'}`
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
            `${'```mermaid'}
graph TD

  alpha
  zeta

${'```'}`
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
            `${'```mermaid'}
graph TD

  build
  lint

  build --> lint
${'```'}`
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
            `${'```mermaid'}
graph TD

  alpha
  build
  zeta

  build --> alpha
  build --> zeta
${'```'}`
        );
    });

    test('throws if dependency does not exist in targets', () => {
        expect(() =>
            buildMermaid({
                targets: {
                    build: {
                        dependsOn: ['missing']
                    }
                }
            })
        ).toThrow('Target "build" depends on missing target "missing"');
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
            `${'```mermaid'}
graph TD

  build["build<br/>Compile &lt;src&gt; &amp; &quot;dist&quot;"]

${'```'}`
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

test('renders cyclic dependencies', () => {
    const output = buildMermaid({
        targets: {
            a: { dependsOn: ['b'] },
            b: { dependsOn: ['a'] }
        }
    });

    expect(output).toBe(
        `${'```mermaid'}
graph TD

  a
  b

  a --> b
  b --> a
${'```'}`
    );
});

test('sanitizes target names starting with number', () => {
    const output = buildMermaid({
        targets: {
            '123-build': {}
        }
    });

    expect(output).toBe(
        `${'```mermaid'}
graph TD

  _123_build

${'```'}`
    );
});
