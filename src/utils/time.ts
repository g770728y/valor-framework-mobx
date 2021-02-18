import dayjs from 'dayjs';

export const formatDate = (t: any): string => dayjs(t).format('YYYY-MM-DD');

/**
 * 将2001-01-01 转为 ms
 */
export const getTime = (t: any): number | null =>
  !t
    ? null
    : dayjs(t)
        .toDate()
        .getTime();

/**
 * 用途: 将2001-01-01 00:00:00 - 2001-01-03 00:00:00
 *      转为: 2001-01-01 00:00:00 - 2001-01-03 23:59:59
 */
export const getDateRange = (daterange: any[] | null) => {
  if (!daterange) return [null, null];
  const a = daterange[0]
    ? dayjs(daterange[0])
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate()
    : null;
  const b = daterange[1]
    ? dayjs(daterange[1])
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .set('millisecond', 59)
        .toDate()
    : null;

  return [a, b];
};
