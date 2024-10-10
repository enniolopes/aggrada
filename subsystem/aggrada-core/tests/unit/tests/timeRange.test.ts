import { createTimeRange } from 'src/processors';

describe('createTimeRange', () => {
  describe('Valid Inputs', () => {
    test.each([
      {
        date: '2023',
        timezone: 'America/Sao_Paulo',
        expected: {
          rawDate: '2023',
          rawTimezone: 'America/Sao_Paulo',
          start: '2023-01-01 00:00:00',
          end: '2023-12-31 23:59:59',
          startTz: '2023-01-01T00:00:00.000-03:00',
          endTz: '2023-12-31T23:59:59.999-03:00',
        },
      },
      {
        date: '2023-04',
        timezone: 'America/New_York',
        expected: {
          rawDate: '2023-04',
          rawTimezone: 'America/New_York',
          start: '2023-04-01 00:00:00',
          end: '2023-04-30 23:59:59',
          startTz: '2023-04-01T00:00:00.000-04:00',
          endTz: '2023-04-30T23:59:59.999-04:00',
        },
      },
      {
        date: 'Q1 2023',
        timezone: 'UTC',
        expected: {
          rawDate: 'Q1 2023',
          rawTimezone: 'UTC',
          start: '2023-01-01 00:00:00',
          end: '2023-03-31 23:59:59',
          startTz: '2023-01-01T00:00:00.000Z',
          endTz: '2023-03-31T23:59:59.999Z',
        },
      },
      {
        date: '2023-04-15',
        timezone: 'America/Los_Angeles',
        expected: {
          rawDate: '2023-04-15',
          rawTimezone: 'America/Los_Angeles',
          start: '2023-04-15 00:00:00',
          end: '2023-04-15 23:59:59',
          startTz: '2023-04-15T00:00:00.000-07:00',
          endTz: '2023-04-15T23:59:59.999-07:00',
        },
      },
    ])(
      'should correctly parse input "$date" with timezone "$timezone"',
      ({ date, timezone, expected }) => {
        const result = createTimeRange({ date, timezone });

        expect(result.rawDate).toBe(expected.rawDate);
        expect(result.rawTimezone).toBe(expected.rawTimezone);
        expect(result.start).toBe(expected.start);
        expect(result.end).toBe(expected.end);
        expect(result.startTz).toBe(expected.startTz);
        expect(result.endTz).toBe(expected.endTz);
      }
    );
  });

  test.each([
    { date: 'Invalid Input', timezone: 'UTC' },
    { date: 'Q5 2023', timezone: 'UTC' }, // Invalid quarter
    { date: 'April 31, 2023', timezone: 'UTC' }, // Invalid day
    { date: '2023-', timezone: 'UTC' }, // Incomplete year
    { date: '2023 Semester 1', timezone: 'UTC' }, // Mixed invalid format
    { date: '2023', timezone: 'Invalid/Timezone' }, // Invalid timezone
  ])(
    'should throw error for invalid input "$date" with timezone "$timezone"',
    ({ date, timezone }) => {
      expect(() => {
        return createTimeRange({ date, timezone });
      }).toThrow();
    }
  );
});
