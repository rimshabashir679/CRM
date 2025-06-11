import pytest
from Utilities.ReadProperties import ReadConfig
from TestCases.test_loginPage import Test_01_LoginPage
from TestCases.test_internalUsers import Test_02_InternalUsers


@pytest.mark.incremental
class TestSequential:
    baseURL = ReadConfig.getURL()
    email = ReadConfig.getEmail()
    password = ReadConfig.getPassword()

    def test_first(self):
        self.tc1 = Test_01_LoginPage
        print('first test case')
        assert 1 == 1
    
    def test_second(self):
        self.tc2 = Test_02_InternalUsers
        print('second test case')
        assert 2 == 2

