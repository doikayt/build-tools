import { injectBetweenMarkers } from '../../src/markdown/injectBetweenMarkers.js';

const START = '<!-- FOO:START -->';
const END = '<!-- FOO:END -->';

test('replaces content between markers', () => {
    const input = `before\n${START}\nOLD\n${END}\nafter`;
    const result = injectBetweenMarkers(input, 'NEW', START, END);
    expect(result).toContain('NEW');
    expect(result).not.toContain('OLD');
    expect(result).toContain('before');
    expect(result).toContain('after');
});

test('preserves start and end tags', () => {
    const input = `${START}\nOLD\n${END}`;
    const result = injectBetweenMarkers(input, 'NEW', START, END);
    expect(result).toContain(START);
    expect(result).toContain(END);
});

test('throws if start tag missing', () => {
    const input = `no markers\n${END}`;
    expect(() => injectBetweenMarkers(input, 'NEW', START, END))
        .toThrow(`Markers not found or invalid: ${START}`);
});

test('throws if end tag missing', () => {
    const input = `${START}\nno end tag`;
    expect(() => injectBetweenMarkers(input, 'NEW', START, END))
        .toThrow(`Markers not found or invalid: ${START}`);
});

test('throws if end tag precedes start tag', () => {
    const input = `${END}\n${START}`;
    expect(() => injectBetweenMarkers(input, 'NEW', START, END))
        .toThrow(`Markers not found or invalid: ${START}`);
});

test('is idempotent', () => {
    const input = `${START}\nOLD\n${END}`;
    const first = injectBetweenMarkers(input, 'CONTENT', START, END);
    const second = injectBetweenMarkers(first, 'CONTENT', START, END);
    expect(first).toBe(second);
});

test('works with different tag names', () => {
    const s = '<!-- NX_GRAPH:START -->';
    const e = '<!-- NX_GRAPH:END -->';
    const input = `${s}\nOLD\n${e}`;
    const result = injectBetweenMarkers(input, 'NEW', s, e);
    expect(result).toContain('NEW');
    expect(result).not.toContain('OLD');
});
