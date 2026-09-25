import { describe, it, expect } from 'vitest';
import { toIsoDuration } from './duration';

describe('toIsoDuration', () => {
    it.each([
        ['45 min', 'PT45M'],
        ['45min', 'PT45M'],
        ['1h 20min', 'PT1H20M'],
        ['1h', 'PT1H'],
        ['90 min', 'PT1H30M'],
        ['45:30', 'PT45M30S'],
        ['1:02:03', 'PT1H2M3S'],
        ['45', 'PT45M'],
    ])('%s -> %s', (input, expected) => {
        expect(toIsoDuration(input)).toBe(expected);
    });

    it.each([undefined, null, '', 'bientôt', '0 min'])('returns undefined for %s', (input) => {
        expect(toIsoDuration(input)).toBeUndefined();
    });
});
