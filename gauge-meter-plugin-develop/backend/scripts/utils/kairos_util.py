import requests
import json
from requests.auth import HTTPBasicAuth


class KairosDBUtility:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.auth = HTTPBasicAuth(username, password)

    def _send_request(self, endpoint, method, data=None):
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        response = requests.request(method, url, headers=headers, data=json.dumps(data) if data else None,
                                    auth=self.auth)

        if response.status_code in [200, 201]:
            return response.json()
        else:
            response.raise_for_status()

    def read(self, query_json):
        """
        Reads static from KairosDB.

        :param query_json: JSON object containing the query
        :return: JSON object with the static or status
        """
        endpoint = 'api/v1/datapoints/query'  # Adjust as necessary
        return self._send_request(endpoint, 'POST', query_json)

    def write(self, data_json):
        """
        Writes static to KairosDB.

        :param data_json: JSON object containing the static to be written
        :return: JSON object with the status or response
        """
        endpoint = 'api/v1/datapoints'  # Adjust as necessary
        return self._send_request(endpoint, 'POST', data_json)

    def delete(self, delete_json):
        """
        Deletes static from KairosDB.

        :param delete_json: JSON object containing the deletion criteria
        :return: JSON object with the status or response
        """
        endpoint = 'api/v1/datapoints/delete'  # Adjust if necessary
        return self._send_request(endpoint, 'POST', delete_json)

