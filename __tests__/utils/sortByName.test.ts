import { sortByName } from '../../src/utils/sortByName';

describe('sortByName', () => {
  it('sorts items alphabetically by name', () => {
    const input = [
      { name: 'Tigers', _id: '1' },
      { name: 'ATA', _id: '2' },
      { name: 'Tai Chi', _id: '3' },
    ];
    const result = sortByName(input);
    expect(result.map(i => i.name)).toEqual(['ATA', 'Tai Chi', 'Tigers']);
  });

  it('is case-insensitive', () => {
    const input = [
      { name: 'beta', _id: '1' },
      { name: 'Alpha', _id: '2' },
      { name: 'gamma', _id: '3' },
    ];
    const result = sortByName(input);
    expect(result.map(i => i.name)).toEqual(['Alpha', 'beta', 'gamma']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { name: 'B', _id: '1' },
      { name: 'A', _id: '2' },
    ];
    const inputCopy = [...input];
    sortByName(input);
    expect(input).toEqual(inputCopy);
  });

  it('returns an empty array unchanged', () => {
    expect(sortByName([])).toEqual([]);
  });

  it('handles a single-item array', () => {
    const input = [{ name: 'Only', _id: '1' }];
    expect(sortByName(input)).toEqual(input);
  });
});
