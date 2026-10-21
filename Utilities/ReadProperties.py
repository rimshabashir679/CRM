import configparser
from pathlib import Path

config = configparser.RawConfigParser()
config.read(Path(__file__).resolve().parent.parent / "Configurations" / "config.ini")

class ReadConfig():
    @staticmethod
    def getURL():
        url = config.get('common info', 'baseURL')
        return url

    @staticmethod
    def getEmail():
        email = config.get('common info', 'email')
        return email

    @staticmethod
    def getPassword():
        password = config.get('common info', 'password')
        return password