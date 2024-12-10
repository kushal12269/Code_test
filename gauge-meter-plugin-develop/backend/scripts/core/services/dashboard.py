from fastapi import APIRouter, Depends

from scripts.api import EndPoints
from scripts.core.handlers.fetch_chart_data import Chart
from scripts.core.schemas.dashboard_schema import PreviewDashboard
from scripts.core.schemas.response_models import (DefaultFailureResponse, DefaultSuccessResponse)
from scripts.logging import logger as log
from scripts.utils.auth_util import MetaInfoCookie

router = APIRouter(prefix=EndPoints.widget, tags=["v1 | Widget"])
get_cookies = MetaInfoCookie()

@router.post(EndPoints.gauge)
def fetch_gauge_data(request_json: PreviewDashboard):
    try:
    #     data = Chart(project_id=request_json.project_id).fetch_gauge_data_logic(req_body=request_json)
    #     return DefaultSuccessResponse(message="Widgets Fetched Successfully", data=data)
        return {"chartDetails": [{"chartData": {"tag": None, "value": 56, "unit": None}, "sectors": []}]}
    except Exception as e:
        log.error(e)
        return DefaultFailureResponse(error=str(e))

