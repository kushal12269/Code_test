import calendar
import logging as logger
import time
from calendar import timegm
from datetime import datetime

import pytz

from scripts.core.constants.defaults import DEFAULT_TIME_FORMAT, TIMEZONE
from scripts.utils import word_to_time


def get_time_range(
    custom_time,
    time_range=None,
    custom=False,
    optional_time_range=None,
    tz=TIMEZONE,
    future_days=None,
    month_filter=None,
    year_filter=None,
    project_info=None,
):
    try:
        compare = False
        if year_filter:
            from_date = datetime(year=year_filter, month=1, day=1, tzinfo=pytz.timezone(tz))
            now = datetime.now()
            to_date = datetime(
                year=year_filter,
                month=12,
                day=calendar.monthrange(now.year, 12)[1],
                hour=23,
                minute=59,
                second=59,
                tzinfo=pytz.timezone(tz),
            )
            return int(from_date.timestamp() * 1000), int(to_date.timestamp() * 1000)
        if month_filter:
            # Option selected: Month and Year
            _, last_day = calendar.monthrange(*list(reversed(month_filter)))
            from_date = datetime(year=month_filter[1], month=month_filter[0], day=1, tzinfo=pytz.timezone(tz))
            to_date = datetime(
                year=month_filter[1],
                month=month_filter[0],
                day=last_day,
                hour=23,
                minute=59,
                second=59,
                tzinfo=pytz.timezone(tz),
            )
            return int(from_date.timestamp() * 1000), int(to_date.timestamp() * 1000)
        if time_range in ["previous_period"]:
            time_range = optional_time_range
            compare = True
        if not custom and time_range:
            to_time, from_time = word_to_time.word_to_time(
                time_range, tz, compare=compare, project_info=project_info, future_days=future_days
            )
        else:
            from_time = custom_time.get("from")
            to_time = custom_time.get("to")
            if not all([from_time, to_time]):
                return None, None
            if not isinstance(from_time, int):
                utc_time = time.strptime(from_time, DEFAULT_TIME_FORMAT)
                from_time = timegm(utc_time) * 1000
            if not isinstance(to_time, int):
                utc_time = time.strptime(to_time, DEFAULT_TIME_FORMAT)
                to_time = timegm(utc_time) * 1000
            """ returning the exact from time and to time as it was mentioned in our requirement """
            return from_time, to_time

        """
        you might be wondering why there is -1, future developer...
        it's because of regression in latest version of Kairos,
        which considers boundaries as inclusive.
        """
        return from_time, to_time
    except Exception as e:
        logger.exception(f"Exception in getting time range: {e}")
        raise


def get_custom_time(enable_custom, custom_time):
    try:
        if not enable_custom:
            return None, None
        from_time = custom_time.get("from")
        to_time = custom_time.get("to")
        if not isinstance(from_time, int):
            utc_time = time.strptime(from_time, DEFAULT_TIME_FORMAT)
            from_time = timegm(utc_time) * 1000
        if not isinstance(to_time, int):
            utc_time = time.strptime(to_time, DEFAULT_TIME_FORMAT)
            to_time = timegm(utc_time) * 1000
        return from_time, to_time
    except Exception as e:
        logger.exception(f"Exception in getting custom time range: {e}")
        raise e