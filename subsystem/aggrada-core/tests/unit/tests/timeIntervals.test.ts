import { transformer } from '../../../src';

describe('generateTimeIntervals', () => {
  describe('Valid Inputs', () => {
    test.each([
      /**
       * Years
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2021, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 11, 31, 23, 59, 59, 999)),
        },
        granularity: 'yearly',
        expected: [
          {
            start: new Date('2021-01-01T00:00:00.000Z'),
            end: new Date('2021-12-31T23:59:59.999Z'),
            label: '2021'
          },
          {
            start: new Date('2022-01-01T00:00:00.000Z'),
            end: new Date('2022-12-31T23:59:59.999Z'),
            label: '2022'
          },
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-12-31T23:59:59.999Z'),
            label: '2023'
          },
        ],
      },
      /**
       * Quarterly
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2021, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 11, 31, 23, 59, 59, 999)),
        },
        granularity: 'quarterly',
        expected: [
          {
            start: new Date('2021-01-01T00:00:00.000Z'),
            end: new Date('2021-03-31T23:59:59.999Z'),
            label: 'Q1 2021'
          },
          {
            start: new Date('2021-04-01T00:00:00.000Z'),
            end: new Date('2021-06-30T23:59:59.999Z'),
            label: 'Q2 2021'
          },
          {
            start: new Date('2021-07-01T00:00:00.000Z'),
            end: new Date('2021-09-30T23:59:59.999Z'),
            label: 'Q3 2021'
          },
          {
            start: new Date('2021-10-01T00:00:00.000Z'),
            end: new Date('2021-12-31T23:59:59.999Z'),
            label: 'Q4 2021'
          },
          {
            start: new Date('2022-01-01T00:00:00.000Z'),
            end: new Date('2022-03-31T23:59:59.999Z'),
            label: 'Q1 2022'
          },
          {
            start: new Date('2022-04-01T00:00:00.000Z'),
            end: new Date('2022-06-30T23:59:59.999Z'),
            label: 'Q2 2022'
          },
          {
            start: new Date('2022-07-01T00:00:00.000Z'),
            end: new Date('2022-09-30T23:59:59.999Z'),
            label: 'Q3 2022'
          },
          {
            start: new Date('2022-10-01T00:00:00.000Z'),
            end: new Date('2022-12-31T23:59:59.999Z'),
            label: 'Q4 2022'
          },
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-03-31T23:59:59.999Z'),
            label: 'Q1 2023'
          },
          {
            start: new Date('2023-04-01T00:00:00.000Z'),
            end: new Date('2023-06-30T23:59:59.999Z'),
            label: 'Q2 2023'
          },
          {
            start: new Date('2023-07-01T00:00:00.000Z'),
            end: new Date('2023-09-30T23:59:59.999Z'),
            label: 'Q3 2023'
          },
          {
            start: new Date('2023-10-01T00:00:00.000Z'),
            end: new Date('2023-12-31T23:59:59.999Z'),
            label: 'Q4 2023'
          },
        ],
      },
      /**
       * Monthly
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2021, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2021, 5, 31, 23, 59, 59, 999)),
        },
        granularity: 'monthly',
        expected: [
          {
            start: new Date('2021-01-01T00:00:00.000Z'),
            end: new Date('2021-01-31T23:59:59.999Z'),
            label: '2021-01'
          },
          {
            start: new Date('2021-02-01T00:00:00.000Z'),
            end: new Date('2021-02-28T23:59:59.999Z'),
            label: '2021-02'
          },
          {
            start: new Date('2021-03-01T00:00:00.000Z'),
            end: new Date('2021-03-31T23:59:59.999Z'),
            label: '2021-03'
          },
          {
            start: new Date('2021-04-01T00:00:00.000Z'),
            end: new Date('2021-04-30T23:59:59.999Z'),
            label: '2021-04'
          },
          {
            start: new Date('2021-05-01T00:00:00.000Z'),
            end: new Date('2021-05-31T23:59:59.999Z'),
            label: '2021-05'
          },
          {
            start: new Date('2021-06-01T00:00:00.000Z'),
            end: new Date('2021-06-30T23:59:59.999Z'),
            label: '2021-06'
          },
        ],
      },
      /**
       * 1 Year
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 11, 31, 23, 59, 59, 999)),
        },
        granularity: 'yearly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-12-31T23:59:59.999Z'),
            label: '2023'
          },
        ],
      },
      /**
       * 1 Quarter
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 2, 31, 23, 59, 59, 999)),
        },
        granularity: 'quarterly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-03-31T23:59:59.999Z'),
            label: 'Q1 2023'
          },
        ],
      },
      /**
       * 1 Month
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 0, 31, 23, 59, 59, 999)),
        },
        granularity: 'monthly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-01-31T23:59:59.999Z'),
            label: '2023-01'
          },
        ],
      },
      /**
       * Incomplete Year
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 3, 15, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 5, 23, 23, 59, 59, 999)),
        },
        granularity: 'yearly',
        expected: null
      },
      /**
       * Incomplete Quarter
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 15, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 0, 23, 23, 59, 59, 999)),
        },
        granularity: 'quarterly',
        expected: null
      },
      /**
       * Incomplete Month
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 15, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 0, 23, 23, 59, 59, 999)),
        },
        granularity: 'monthly',
        expected: null
      },


      /**
       * Sucess with incomplete year
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2024, 5, 23, 23, 59, 59, 999)),
        },
        granularity: 'yearly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-12-31T23:59:59.999Z'),
            label: '2023'
          },
        ],
      },
      /**
       * Sucess with incomplete quarter
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 7, 23, 23, 59, 59, 999)),
        },
        granularity: 'quarterly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-03-31T23:59:59.999Z'),
            label: 'Q1 2023',
          },
          {
            start: new Date('2023-04-01T00:00:00.000Z'),
            end: new Date('2023-06-30T23:59:59.999Z'),
            label: 'Q2 2023',
          },
        ],
      },
      /**
       * Sucess with incomplete Month
       */
      {
        timeRange: {
          start: new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)),
          end: new Date(Date.UTC(2023, 3, 23, 23, 59, 59, 999)),
        },
        granularity: 'monthly',
        expected: [
          {
            start: new Date('2023-01-01T00:00:00.000Z'),
            end: new Date('2023-01-31T23:59:59.999Z'),
            label: '2023-01'
          },
          {
            start: new Date('2023-02-01T00:00:00.000Z'),
            end: new Date('2023-02-28T23:59:59.999Z'),
            label: '2023-02'
          },
          {
            start: new Date('2023-03-01T00:00:00.000Z'),
            end: new Date('2023-03-31T23:59:59.999Z'),
            label: '2023-03'
          },
        ],
      },
    ])(
      'should generate time intervals with given granularity',
      ({ timeRange, granularity, expected }) => {

        const result = transformer.generateTimeIntervals({
          timeRange,
          granularity,
        });

        // console.log('evaluate: ', {
        //   input: {
        //     timeRange,
        //     granularity: granularityValue,
        //   },
        //   result,
        //   expected,
        // });

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
