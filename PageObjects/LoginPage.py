from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class LoginPage:
    textbox_email_xpath = "/html/body/div[1]/div/main/div/section/form/div[1]/div[1]/div/div/div[2]/div/div/input"
    textbox_password_xpath = "/html/body/div[1]/div/main/div/section/form/div[1]/div[2]/div/div/div[2]/div/div[1]/input"
    eye_icon_button = "/html/body/div[1]/div/main/div/section/form/div[1]/div[2]/div/div/div[2]/div/div[2]"
    rememberme_button = "/html/body/div[1]/div/main/div/section/form/div[1]/div[3]/div/div/div/label/input"
    signIn_Login_xpath = "/html/body/div[1]/div/main/div/section/form/div[2]/div/button"
    signOut_button = "/html/body/div[1]/div[1]/main/div/section/div/div/div/div[1]/section/div/div/div/form/button[2]"

    def __init__(self, driver):
        self.driver = driver

    def setEmail(self, email):
        email_element = WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((By.XPATH, self.textbox_email_xpath))
        )
        if email_element.is_enabled():  # Check if the element is enabled
            email_element.clear()
            email_element.send_keys(email)
        else:
            print("Email field is disabled or not interactable.")

    def setPassword(self, password):
        password_element = WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((By.XPATH, self.textbox_password_xpath))
        )
        if password_element.is_enabled():
            password_element.clear()
            password_element.send_keys(password)
        else:
            print("Password field is disabled or not interactable.")

    def clickOnEyeIcon(self):
        self.driver.find_element("xpath", self.eye_icon_button).click()

    def clickOnRememberMe(self):
        self.driver.find_element("xpath", self.rememberme_button).click()

    def clickOnSignInButton(self):
        login_button = WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((By.XPATH, self.signIn_Login_xpath))
        )
        login_button.click()

    def clickOnSignOutButton(self):
        signout_button = WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((By.XPATH, self.signOut_button))
        )
        signout_button.click()
