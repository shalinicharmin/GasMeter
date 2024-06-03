import dayjs from 'dayjs';

// Add any plugins you want to use with Day.js
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(quarterOfYear);
dayjs.extend(localizedFormat);
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(updateLocale);

export default dayjs;
