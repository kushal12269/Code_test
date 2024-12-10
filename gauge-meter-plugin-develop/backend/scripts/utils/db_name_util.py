import logging
from functools import lru_cache

import ujson as json
# from scripts.db.redis_connections import project_details_db

local_cache = {}


@lru_cache()
def get_db_name(project_id: str, database: str, delimiter="__"):
    prefix_condition, val = check_prefix_condition(project_id)
    if prefix_condition:
        # Get the prefix name from mongo or default to project_id
        prefix_name = val.get("source_meta", {}).get("prefix") or project_id
        return f"{prefix_name}{delimiter}{database}"
    return database


def check_prefix_condition(project_id: str):
    if not project_id:
        logging.warning("Project ID is None! Cannot check for prefix!")
        return False, None
    val = project_details_db.get(project_id)
    if val is None:
        raise ValueError(f"Unknown Project, Project ID: {project_id} Not Found!!!")
    val = json.loads(val)
    if not val:
        return False, None

    # Get the prefix flag to apply project_id prefix to any db
    prefix_condition = bool(val.get("source_meta", {}).get("add_prefix_to_database"))
    return prefix_condition, val


def get_prefixed_tags(project_id, tag_list):
    # Get prefixed tags
    tag_prefix = ""
    project_prefix, _ = check_prefix_condition(project_id)
    if project_prefix:
        tag_prefix = f"{project_id}__"
    return {x: tag_prefix + x for x in tag_list}
