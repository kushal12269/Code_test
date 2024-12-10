
from fastapi import APIRouter
from scripts.api import  EndPoints
from scripts.core.handlers.defaults import DefaultHandler

router = APIRouter(prefix="/widget")
handler = DefaultHandler


@router.get(EndPoints.load_styles)
async def load_styles():
    """
    Default: Loads required endpoints to get filenames in the build
    Do not edit this
    """
    return handler.load_styles()


@router.get(EndPoints.load_file)
def download_resource(filename: str):
    """Default: Request Build Files to redner widget configurations on the frontend
    Do not edit this
    """
    return handler.download_resources(filename)


# TODO: Add preview logic. Do not change the API endpoint



@router.get(EndPoints.load_configuration)
async def load_configuration():
    """
    Default: Load widget configuration JSON for listing plugins while creating widgets
    Do not edit this
    """
    return handler.load_configuration()