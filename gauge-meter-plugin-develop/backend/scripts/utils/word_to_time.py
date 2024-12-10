import calendar
import logging
from datetime import datetime, timedelta
import re

import pendulum
import pytz
from dateutil.relativedelta import relativedelta
from word2number import w2n

from scripts.core.constants.time_formats import AppTimeFormats, TimeDelta

time_defaults = TimeDelta()


def get_relative_func_map(compare=False):
    if not compare:
        return {
            AppTimeFormats.DAYS: __relative_days__,
            AppTimeFormats.HOURS: __relative_hours__,
            AppTimeFormats.MINUTES: __relative_minutes__,
            AppTimeFormats.SECONDS: __relative_seconds__,
            AppTimeFormats.YEARS: __relative_years__,
            AppTimeFormats.MONTHS: __relative_months__,
            AppTimeFormats.WEEKS: __relative_weeks__,
        }
    return {
        AppTimeFormats.DAYS: previous_days,
        AppTimeFormats.HOURS: __last_hours_previous__,
        AppTimeFormats.MINUTES: __last_minutes_previous__,
        AppTimeFormats.SECONDS: previous_seconds,
        AppTimeFormats.YEARS: __last_years_previous__,
        AppTimeFormats.MONTHS: __last_months_previous__,
        AppTimeFormats.WEEKS: __last_weeks_previous__,
    }


def get_definitive_mapping(compare=False):
    if not compare:
        return {
            "today": __relative_today__,
            "today_so_far": __relative_today_so_far__,
            "this_week": __relative_this_week__,
            "this_week_so_far": __relative_this_week_so_far__,
            "this_month": __relative_this_month__,
            "this_month_so_far": __relative_this_month_so_far__,
            "this_year": __relative_this_year__,
            "this_year_so_far": __relative_this_year_so_far__,
            "yesterday": __relative_yesterday__,
            "day_before_yesterday": __relative_day_before_yesterday__,
            "this_day_last_week": __relative_this_day_last_week__,
            "this_day_last_week_so_far": __relative_last_week_so_far_previous__,
            "previous_week": __relative_week_previous__,
            "previous_week_so_far": __relative_week_so_far_previous__,
            "previous_month": __relative_month_previous__,
            "previous_month_so_far": __relative_month_so_far_previous__,
            "previous_year": __relative_year_previous__,
            "dec30_to_mar23": __relative_Q1_months__,
            "mar24_to_jun15": __relative_Q2_months__,
            "jun16_to_sep07": __relative_Q3_months__,
            "sep08_to_dec28": __relative_Q4_months__,
        }
    return {
        "today": __today_previous__,
        "today_so_far": __today_so_far_previous__,
        "this_week": __this_week_previous__,
        "this_week_so_far": __this_week_previous_so_far__,
        "this_month": __this_month_previous__,
        "this_month_so_far": __this_month_so_far_previous__,
        "this_year": __this_year_previous__,
        "this_year_so_far": __this_year_so_far_previous__,
        "yesterday": __day_yesterday_previous__,
        "day_before_yesterday": __day_before_yesterday_previous__,
        "this_day_last_week": __this_day_last_week_previous__,
        "this_day_last_week_so_far": __this_day_last_week_so_far_previous__,
        "previous_week_previous": __previous_week_previous__,
        "previous_week_so_far_previous": __previous_week_so_far_previous__,
        "previous_month_previous": __previous_month_previous__,
        "previous_month_so_far_previous": __previous_month_so_far_previous__,
        "previous_year_previous": __previous_year_previous__,
    }


def word_to_time(
        time_range_label: str, tz: str, compare: bool = False, future_days: int = None, project_info: dict = None
):
    """Returns a tuple of (End time, Start time)"""
    print(time_range_label, future_days)
    now = datetime.now(tz=pytz.timezone(tz)).replace(microsecond=0)
    time_range_label_list = []
    use_time_range_label_list = False
    if "last" in time_range_label and "this" not in time_range_label:
        time_range_label_list = time_range_label.split("_")
        if len(time_range_label_list) == 4 and (
                "twenty" in time_range_label_list or "thirty" in time_range_label_list or "forty" in time_range_label_list
        ):
            time_range_label_list = [
                time_range_label_list[0],
                f"{time_range_label_list[1]} {time_range_label_list[2]}",
                time_range_label_list[3],
            ]
        use_time_range_label_list = True

    if use_time_range_label_list:
        relative_func_map = get_relative_func_map(compare=compare)
        relative_func = relative_func_map.get(time_range_label_list[2])
        if not relative_func:
            raise NotImplementedError("get_relative_func_map:Illegal Last Relative")
        end_time, start_time = relative_func(project_info, now, time_range_label_list)
    else:
        pepsico_list = ['p1', 'p2', 'p3', 'p4']
        if time_range_label.split("_")[0] in pepsico_list:
            year = time_range_label.split("_")[1]
            definitive_func_map = get_definitive_mapping(compare=compare)
            if time_range_label.split("_")[0] == "p1":
                time_range_label = "dec30_to_mar23"
            elif time_range_label.split("_")[0] == "p2":
                time_range_label = "mar24_to_jun15"
            elif time_range_label.split("_")[0] == "p3":
                time_range_label = "jun16_to_sep07"
            elif time_range_label.split("_")[0] == "p4":
                time_range_label = "sep08_to_dec28"
            definitive_func = definitive_func_map.get(re.sub("\u200b", "", time_range_label))
            if not definitive_func:
                raise NotImplementedError("get_definitive_mapping:Illegal Last Relative")
            end_time, start_time = definitive_func(project_info, int(year))
        else:
            definitive_func_map = get_definitive_mapping(compare=compare)
            definitive_func = definitive_func_map.get(re.sub("\u200b", "", time_range_label))
            if not definitive_func:
                raise NotImplementedError("get_definitive_mapping:Illegal Last Relative")
            end_time, start_time = definitive_func(project_info, now)
    end_time = end_time + timedelta(days=int(future_days)) if future_days else end_time
    logging.debug(f"Date Range: {start_time}--> {end_time}")
    print(f"Date Range: {start_time}--> {end_time}")
    updated_end_time = return_timestamp(end_time, tz)
    updated_start_time = return_timestamp(start_time, tz)
    return updated_end_time, updated_start_time


def return_timestamp(start_time, tz):
    timezone = pendulum.timezone(tz)
    # Set the timezone for the provided datetime object
    replace_timezone = start_time.replace(tzinfo=timezone)
    datetime_with_tz = replace_timezone.timestamp()
    # Convert the provided datetime to epoch timestamp
    epoch_time = int(datetime_with_tz * 1000)
    return epoch_time


def previous_seconds(project_info, now, time_range_list):
    return (
        (now + relativedelta(seconds=-(1 * w2n.word_to_num(time_range_list[1])))),
        (now + relativedelta(seconds=-(2 * w2n.word_to_num(time_range_list[1])))),
    )


def previous_minutes(project_info, now, time_range_list):
    return (
        (now + relativedelta(minutes=-(1 * w2n.word_to_num(time_range_list[1])))),
        (now + relativedelta(minutes=-(2 * w2n.word_to_num(time_range_list[1])))),
    )


def previous_hours(project_info, now, time_range_list):
    return (
        (now + relativedelta(hours=-(1 * w2n.word_to_num(time_range_list[1])))),
        (now + relativedelta(hours=-(2 * w2n.word_to_num(time_range_list[1])))),
    )


def previous_days(project_info, now, time_range_list):
    return (
        (now + relativedelta(days=-(1 * w2n.word_to_num(time_range_list[1])))),
        (now + relativedelta(days=-(2 * w2n.word_to_num(time_range_list[1])))),
    )


def __relative_years__(project_info, now, time_range_list):
    return now, now + relativedelta(years=-w2n.word_to_num(time_range_list[1]))


def __relative_months__(project_info, now, time_range_list):
    return now, now + relativedelta(months=-w2n.word_to_num(time_range_list[1]))


def __relative_weeks__(project_info, now, time_range_list):
    return now, now + relativedelta(weeks=-w2n.word_to_num(time_range_list[1]))


def __relative_days__(project_info, now, time_range_list):
    updated_time = now
    updated_time = updated_time.replace(hour=23, minute=59, second=59, microsecond=0)
    updated_time = updated_time + relativedelta(days=-1)
    day_start = time_defaults.custom_day_start(project_info, now)
    return updated_time, day_start + relativedelta(days=-w2n.word_to_num(time_range_list[1]))


def __relative_hours__(project_info, now, time_range_list):
    return now, now + relativedelta(hours=-w2n.word_to_num(time_range_list[1]))


def __relative_minutes__(project_info, now, time_range_list):
    return now, now + relativedelta(minutes=-w2n.word_to_num(time_range_list[1]))


def __relative_seconds__(project_info, now, time_range_list):
    return now, now + relativedelta(seconds=-w2n.word_to_num(time_range_list[1]))


def __relative_today__(project_info, now):
    end_date = time_defaults.custom_day_end(project_info, now)
    start_date = time_defaults.custom_day_start(project_info, now)
    return end_date, start_date


def __relative_today_so_far__(project_info, now):
    start_date = time_defaults.custom_day_start(project_info, now)
    return now, start_date


def __relative_this_week__(project_info, now):
    today_date = now
    week_start_date = time_defaults.custom_day_start(project_info, today_date + timedelta(days=-(now.weekday())))
    week_end_date = time_defaults.custom_day_end(project_info, week_start_date + timedelta(days=6))
    return week_end_date, week_start_date


def __relative_this_week_so_far__(project_info, now):
    today_date = now
    week_start_date = time_defaults.custom_day_start(project_info, today_date + timedelta(days=-(now.weekday())))
    return now, week_start_date


def __relative_this_month__(project_info, now):
    now = now.replace()
    start_date = time_defaults.get_month_start(project_info, now)
    last_date = calendar.monthrange(now.year, now.month)[1]
    end_date = time_defaults.dflt_month_end(project_info, (now + timedelta(days=0)), last_date)
    return end_date, start_date.replace()


def __relative_this_month_so_far__(project_info, now):
    now = now.replace()
    start_date = time_defaults.get_month_start(project_info, now)
    end_date = now
    return end_date, start_date.replace()


def __relative_this_year__(project_info, now):
    now = now.replace()
    return time_defaults.get_year_end(project_info, now), time_defaults.get_year_start(project_info, now)


def __relative_this_year_so_far__(project_info, now):
    return now, time_defaults.get_year_start(project_info, now)


def __relative_yesterday__(project_info, now):
    now = now.replace()
    start_date = time_defaults.custom_day_start(project_info, (now + timedelta(days=-1)))
    end_date = time_defaults.custom_day_end(project_info, (now + timedelta(days=-1)))
    return end_date, start_date


def __relative_day_before_yesterday__(project_info, now):
    now = now.replace()
    start_date = time_defaults.custom_day_start(project_info, (now + timedelta(days=-2)))
    end_date = time_defaults.custom_day_end(project_info, (now + timedelta(days=-2)))
    return end_date, start_date


def __relative_this_day_last_week__(project_info, now):
    now = now.replace()
    start_date = time_defaults.custom_day_start(project_info, (now + timedelta(days=-7)))
    end_date = time_defaults.custom_day_end(project_info, (now + timedelta(days=-7)))
    return end_date, start_date


def __relative_last_week_so_far_previous__(project_info, now):
    now = now.replace()
    start_date = time_defaults.custom_day_start(project_info, (datetime.today() + timedelta(days=-7)))
    return now, start_date


def __relative_week_previous__(project_info, now):
    date_last_week = now + timedelta(days=-7)
    start_time = date_last_week + timedelta(days=-(now.weekday()))
    end_time = start_time + timedelta(days=6)

    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)

    return end_date, start_date


def __relative_week_so_far_previous__(project_info, now):
    date_last_week = now + timedelta(days=-7)
    start_time = date_last_week
    end_time = start_time + timedelta(days=7)
    start_date = time_defaults.custom_day_start(project_info, start_time)
    return end_time, start_date


def __relative_month_previous__(project_info, now):
    start_time = now + relativedelta(months=-1)
    month_end_date = calendar.monthrange(now.year, start_time.month)[1]
    end_time = start_time
    end_date = time_defaults.dflt_month_end(project_info, end_time, month_end_date)
    return end_date, time_defaults.get_month_start(project_info, start_time)


def __relative_month_so_far_previous__(project_info, now):
    start_time = now + relativedelta(months=-1)
    end_time = start_time + timedelta(days=0)
    return end_time, time_defaults.get_month_start(project_info, start_time)


def __relative_year_previous__(project_info, now):
    start_time = now + relativedelta(year=now.year - 1)
    end_time = start_time + timedelta(days=0)
    start_date = time_defaults.get_year_start(project_info, start_time)
    end_date = time_defaults.get_year_end(project_info, end_time)
    return end_date, start_date


def __relative_year_so_far_previous__(project_info, now):
    start_time = datetime.today() + relativedelta(year=now.year - 1)
    end_time = start_time + timedelta(days=0)

    start_date = time_defaults.get_year_start(project_info, start_time)
    return end_time, start_date


def __last_minutes_previous__(project_info, now, time_range_list):
    time_interval = w2n.word_to_num(time_range_list[1])
    end_time = now + relativedelta(minutes=-time_interval)
    start_time = now + relativedelta(minutes=-(time_interval + time_interval))
    return end_time, start_time


def __last_hours_previous__(project_info, now, time_range_list):
    time_interval = w2n.word_to_num(time_range_list[1])
    end_time = now + relativedelta(hours=-time_interval)
    start_time = now + relativedelta(hours=-(time_interval + time_interval))
    return end_time, start_time


def __last_weeks_previous__(project_info, now, time_range_list):
    time_interval = w2n.word_to_num(time_range_list[1])
    end_time = now + relativedelta(weeks=-time_interval)
    start_time = now + relativedelta(weeks=-(time_interval + time_interval))
    return end_time, start_time


def __last_months_previous__(project_info, now, time_range_list):
    time_interval = w2n.word_to_num(time_range_list[1])
    end_time = now + relativedelta(months=-time_interval)
    start_time = now + relativedelta(months=-(time_interval + time_interval))
    return end_time, start_time


def __last_years_previous__(project_info, now, time_range_list):
    time_interval = w2n.word_to_num(time_range_list[1])
    end_time = now + relativedelta(years=-time_interval)
    start_time = now + relativedelta(years=-(time_interval + time_interval))
    return end_time, start_time


def __today_previous__(project_info, now):
    start_date = time_defaults.custom_day_start(project_info, now)
    end_date = time_defaults.custom_day_end(project_info, now)

    end_time = end_date + timedelta(days=-1)
    start_time = start_date + timedelta(days=-1)
    return end_time, start_time


def __today_so_far_previous__(project_info, now):
    end_time = now + timedelta(days=-1)
    start_date = time_defaults.custom_day_start(project_info, now)
    start_time = start_date + timedelta(days=-1)
    return end_time, start_time


def __this_week_previous__(project_info, now):
    today_date = now
    start_time = today_date + timedelta(days=-(now.weekday() + 8))
    end_time = start_time + timedelta(days=6)
    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)
    return end_date, start_date


def __this_week_previous_so_far__(project_info, now):
    today_date = now
    start_time = today_date + timedelta(days=-(now.weekday() + 8))
    end_time = start_time + timedelta(days=6)
    start_date = time_defaults.custom_day_start(project_info, start_time)
    return end_time, start_date


def __this_month_previous__(project_info, now):
    start_time = now + relativedelta(months=-1)
    month_end_date = calendar.monthrange(now.year, start_time.month)[1]
    end_time = start_time + timedelta(days=0)
    end_date = time_defaults.dflt_month_end(project_info, end_time, month_end_date)
    return end_date, time_defaults.get_month_start(project_info, start_time)


def __this_month_so_far_previous__(project_info, now):
    start_time = now + relativedelta(months=-1)
    end_time = start_time + timedelta(days=0)
    return end_time, time_defaults.get_month_start(project_info, start_time)


def __this_year_previous__(project_info, now):
    start_time = now.replace(year=now.year - 1)
    end_time = start_time
    start_date = time_defaults.get_year_start(project_info, start_time)
    end_date = time_defaults.get_year_end(project_info, end_time)
    return end_date, start_date


def __this_year_so_far_previous__(project_info, now):
    start_time = now.replace(year=now.year - 1)
    start_date = time_defaults.get_year_start(project_info, start_time)
    return start_time, start_date


def __day_yesterday_previous__(project_info, now):
    start_time = now + timedelta(days=-2)
    end_time = now + timedelta(days=-2)
    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)
    return end_date, start_date


def __day_before_yesterday_previous__(project_info, now):
    start_time = now + timedelta(days=-3)
    end_time = now + timedelta(days=-3)
    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)
    return end_date, start_date


def __day_before_yesterday_so_far_previous__(project_info, now):
    start_time = now + timedelta(days=-3)
    end_time = now + timedelta(days=-3)
    start_date = time_defaults.custom_day_start(project_info, start_time)

    return end_time, start_date


def __this_day_last_week_previous__(project_info, now):
    start_time = now + timedelta(days=-14)
    end_time = now + timedelta(days=-14)

    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)
    return end_date, start_date


def __this_day_last_week_so_far_previous__(project_info, now):
    start_time = now + timedelta(days=-14)
    end_time = now + timedelta(days=-14)
    start_date = time_defaults.custom_day_start(project_info, start_time)

    return end_time, start_date


def __previous_week_previous__(project_info, now):
    date_last_week = now + timedelta(days=-21)
    start_time = date_last_week + timedelta(days=-(now.weekday() + 1))
    end_time = start_time + timedelta(days=6)

    start_date = time_defaults.custom_day_start(project_info, start_time)
    end_date = time_defaults.custom_day_end(project_info, end_time)
    return end_date, start_date


def __previous_week_so_far_previous__(project_info, now):
    date_last_week = now + timedelta(days=-21)
    start_time = date_last_week
    end_time = start_time + timedelta(days=6)
    start_date = time_defaults.custom_day_start(project_info, start_time)

    return end_time, start_date


def __previous_month_previous__(project_info, now):
    start_time = now + relativedelta(months=-2)
    month_end_date = calendar.monthrange(now.year, start_time.month)[1]
    end_time = start_time + timedelta(days=0)
    end_date = time_defaults.dflt_month_end(project_info, end_time, month_end_date)
    return end_date, time_defaults.get_month_start(project_info, start_time)


def __previous_month_so_far_previous__(project_info, now):
    start_time = now + relativedelta(months=-2)
    end_time = start_time + timedelta(days=0)
    return end_time, time_defaults.get_month_start(project_info, start_time)


def __previous_year_previous__(project_info, now):
    start_time = now + relativedelta(year=now.year - 2)
    end_time = start_time + timedelta(days=0)
    start_date = time_defaults.get_year_start(project_info, start_time)
    end_date = time_defaults.get_year_end(project_info, end_time)
    return end_date, start_date


def __previous_year_so_far_previous__(project_info, now):
    start_time = now + relativedelta(year=now.year - 2)
    end_time = start_time + timedelta(days=0)
    start_date = time_defaults.get_year_start(project_info, start_time)
    return end_time, start_date


def __relative_Q1_months__(project_info, now):
    # now = datetime.now()
    start_time = datetime(now - 1, 12, 30)
    # month_end_date = calendar.monthrange(now.year, 3)[1]
    end_time = datetime(now, 3, 23)
    end_date = time_defaults.dflt_month_end(project_info, end_time, 23)
    return end_date, time_defaults.custom_day_start(project_info, start_time)


def __relative_Q2_months__(project_info, now):
    start_time = datetime(now, 3, 24)
    end_time = datetime(now, 6, 15)
    end_date = time_defaults.dflt_month_end(project_info, end_time, 15)
    return end_date, time_defaults.custom_day_start(project_info, start_time)


def __relative_Q3_months__(project_info, now):
    start_time = datetime(now, 6, 16)
    end_time = datetime(now, 9, 7)
    end_date = time_defaults.dflt_month_end(project_info, end_time, 7)
    return end_date, time_defaults.custom_day_start(project_info, start_time)


def __relative_Q4_months__(project_info, now):
    start_time = datetime(now, 9, 8)
    end_time = datetime(now, 12, 28)
    end_date = time_defaults.dflt_month_end(project_info, end_time, 28)
    return end_date, time_defaults.custom_day_start(project_info, start_time)
