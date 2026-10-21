import pytest
from Utilities.ReadProperties import ReadConfig


@pytest.mark.incremental
class TestSequential:
    baseURL = ReadConfig.getURL()
    email = ReadConfig.getEmail()
    password = ReadConfig.getPassword()

    def test_first(self):
        # Import inside the test so pytest does not collect the browser
        # suites just because this file references them.
        from TestCases.test_loginPage import Test_01_LoginPage

        self.tc1 = Test_01_LoginPage
        print("first test case")
        assert 1 == 1

    def test_second(self):
        from TestCases.test_internalUsers import Test_02_InternalUsers

        self.tc2 = Test_02_InternalUsers
        print("second test case")
        assert 2 == 2

