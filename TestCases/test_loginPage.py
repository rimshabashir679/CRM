import time
from PageObjects.LoginPage import LoginPage
from Utilities.customLogger import LogGen
from Utilities.ReadProperties import ReadConfig
from Utilities.ExceptionHandling import handle_window_closed
from .conftest import setup

class Test_01_LoginPage:
    url = ReadConfig.getURL()
    email = ReadConfig.getEmail()
    password = ReadConfig.getPassword()

    logger = LogGen.loggen()
    
    
    @handle_window_closed
    def test_login(self):

        self.driver = setup()
        self.logger.info("********* TestCase_01_Login *********")
        self.lp = LoginPage(self.driver)
        self.lp.setEmail(self.email)
        self.lp.setPassword(self.password)
        self.lp.clickOnEyeIcon()
        self.lp.clickOnRememberMe()
        self.lp.clickOnSignInButton()
        self.logger.info("********* Verified Successful Login *********")
        self.driver.save_screenshot(".//Screenshots//" + "test_login.png")
        self.lp.clickOnSignOutButton()
        self.driver.close()