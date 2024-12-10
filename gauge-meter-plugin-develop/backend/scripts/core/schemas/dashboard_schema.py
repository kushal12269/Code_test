from typing import Dict, Optional, List, Any, Union

from pydantic import BaseModel

from scripts.core.constants.defaults import TIMEZONE, DATABASE


class PreviewDashboard(BaseModel):
    widgetId: str
    project_id: str
    widget_filter: Optional[Dict] = {}
    database: str
    tz: Optional[str] = TIMEZONE
    language: str
    gaugeType: Optional[str]
    queryParam: Optional[Dict] = {}


