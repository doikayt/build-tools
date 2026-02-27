import { stableSortStrings } from '../src/index';

test('stableSortStrings sorts deterministically', () => {
  expect(stableSortStrings(['z', 'a', 'm'])).toEqual(['a', 'm', 'z']);
});
