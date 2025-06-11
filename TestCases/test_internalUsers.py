import time
from PageObjects.LoginPage import LoginPage
from PageObjects.InternalUsers import InternalUsers
from Utilities.customLogger import LogGen
from Utilities.ReadProperties import ReadConfig
from Utilities.ExceptionHandling import handle_window_closed

from .conftest import setup

class Test_02_InternalUsers:
    url = ReadConfig.getURL()
    email = ReadConfig.getEmail()
    password = ReadConfig.getPassword()

    logger = LogGen.loggen()

    # @handle_window_closed
    def test_login(self):

        self.driver = setup()
        self.logger.info("********* TestCase_01_Login *********")
        self.lp = LoginPage(self.driver)
        time.sleep(1)
        self.lp.setEmail(self.email)
        time.sleep(1)
        self.lp.setPassword(self.password)
        time.sleep(1)
        self.lp.clickOnEyeIcon()
        time.sleep(1)
        self.lp.clickOnRememberMe()
        time.sleep(1)
        self.lp.clickOnSignInButton()
        time.sleep(1)
        self.logger.info("********* Verified Successful Login *********")
        self.iu = InternalUsers(self.driver)
        time.sleep(1)
        self.iu.clickOnInternalUserMenuButton()
        self.logger.info("********* Internal Users *********")
        time.sleep(1)
        self.iu.clickOnAddNewInternalUserMenuButton()
        self.logger.info("********* Add New Internal User *********")
        time.sleep(1)
        self.iu.addName("Automated Test User")
        time.sleep(1)
        self.iu.addEmail("automatedtestuser@mailinator.com")
        time.sleep(1)
        self.iu.addPassword("Rimsha1122!")
        time.sleep(1)
        self.iu.clickOnAddGroupButton()
        time.sleep(2)
        self.driver.save_screenshot(".//Screenshots//" + "test_internalUser.png")
        self.driver.close()