import logging
from typing import Dict, List, Optional

from pymongo.cursor import Cursor

from scripts.utils.db_name_util import get_db_name


class MongoCollectionBaseClass:
    def __init__(self, mongo_client, database, collection, project_id):
        self.client = mongo_client
        self.database = database
        self.collection = collection
        if project_id:
            self.database = get_db_name(project_id=project_id, database=self.database)

    def __repr__(self):
        return f"{self.__class__.__name__}(database={self.database}" + f", collections={self.collection})"

    def create_collection(self, collection_name):
        try:
            db = self.client[self.database]
            # Check if the collection exists
            if collection_name not in db.list_collection_names():
                # Create the collection
                collection = db[collection_name]
                logging.info(f"Collection {collection_name}' created.")
            else:
                logging.info("Collection 'users' already exists.")
        except Exception as e:
            logging.exception(str(e))

    def insert_one(self, data: Dict):
        """
        The function is used to inserting a
        document to a collections in a Mongo Database.
        param static: Data to be inserted
        return: Insert ID
        """
        try:

            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.insert_one(data)
            return response.inserted_id
        except Exception as e:
            logging.exception(e)
            raise

    def insert_many(self, data: List):
        """
        The function is used to inserting documents to a
        collections in a Mongo Database.
        param static: List of Data to be inserted
        :return: Insert IDs
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.insert_many(data)
            return response.inserted_ids
        except Exception as e:
            logging.exception(e)
            raise

    def find(
            self,
            query: Dict,
            filter_dict: Optional[Dict] = None,
            sort: Optional[list] =None,
            skip: Optional[int] = 0,
            limit: Optional[int] = None,
    ) -> Cursor:
        """
        The function is used to query documents
        from a given collections in a Mongo Database
        :param query: Query Dictionary
        :param filter_dict: Filter Dictionary
        :param sort: List of tuple with key and direction. [(key, -1), ...]
        :param skip: Skip Number
        :param limit: Limit Number
        :return: List of Documents
        """
        if sort is None:
            sort = []
        if filter_dict is None:
            filter_dict = {"_id": 0}
        database_name = self.database
        collection_name = self.collection
        try:
            db = self.client[database_name]
            collection = db[collection_name]
            if len(sort) > 0:
                cursor = (
                    collection.find(
                        query,
                        filter_dict,
                    )
                    .sort(sort)
                    .skip(skip)
                )
            else:
                cursor = collection.find(
                    query,
                    filter_dict,
                ).skip(skip)
            if limit:
                cursor = cursor.limit(limit)
            return cursor
        except Exception as e:
            logging.exception(e)
            raise

    def find_one(self, query: Dict, filter_dict: Optional[Dict] = None):
        try:
            database_name = self.database
            collection_name = self.collection
            if filter_dict is None:
                filter_dict = {"_id": 0}
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.find_one(query, filter_dict)
            return response
        except Exception as e:
            logging.exception(e)
            raise

    def update_one(
            self,
            query: Dict,
            data: Dict,
            upsert: bool = False,
            strategy: str = "$set",
    ):
        """

        :param strategy:
        :param upsert:
        :param query:
        :param data:
        :return:
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.update_one(query, {strategy: data}, upsert=upsert)
            return response.modified_count
        except Exception as e:
            logging.exception(e)
            raise

    def update_many(self, query: Dict, data: Dict, upsert: bool = False):
        """

        :param upsert:
        :param query:
        :param data:
        :return:
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.update_many(query, {"$set": data}, upsert=upsert)
            return response.modified_count
        except Exception as e:
            logging.exception(e)
            raise

    def delete_many(self, query: Dict):
        """
        :param query:
        :return:
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.delete_many(query)
            return response.deleted_count
        except Exception as e:
            logging.exception(e)
            raise

    def delete_one(self, query: Dict):
        """
        :param query:
        :return:
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.delete_one(query)
            return response.deleted_count
        except Exception as e:
            logging.exception(e)
            raise

    def distinct(self, query_key: str, filter_json: Optional[Dict] = None):
        """
        :param query_key:
        :param filter_json:
        :return:
        """
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.distinct(query_key, filter_json)
            return response
        except Exception as e:
            logging.exception(e)
            raise

    def aggregate(
            self,
            pipelines: List,
    ):
        try:
            database_name = self.database
            collection_name = self.collection
            db = self.client[database_name]
            collection = db[collection_name]
            response = collection.aggregate(pipelines)
            return response
        except Exception as e:
            logging.exception(e)
            raise
