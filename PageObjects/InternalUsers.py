from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


class InternalUsers:
    internalUser_menu_button_xpath = "/html/body/div[1]/aside/nav/ul/li[3]/ul/li[3]"
    addNewInternalUser_button_xpath = "/html/body/div[1]/div[1]/main/div/section/header/div[2]/div"
    name_field_xpath = "/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[1]/div/div/div[2]/div/div/input"
    email_field_xpath = "/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[2]/div/div/div[2]/div/div/input"
    password_field_xpath = "/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[3]/div/div/div[2]/div/div[1]/input"
    addGroup_button_xpath = "/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[2]/section/div/div/div/div/div/div/div/div/ul/li"

    def __init__(self, driver):
        self.driver = driver

    def clickOnInternalUserMenuButton(self):
        internalUser_element = WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((By.XPATH, self.internalUser_menu_button_xpath))
        )
        internalUser_element.click()

    def clickOnAddNewInternalUserMenuButton(self):
        addNewInternalUser_element = WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((By.XPATH, self.addNewInternalUser_button_xpath))
        )
        addNewInternalUser_element.click()

    def addName(self, name):
        self.name = name
        name_element = WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((By.XPATH, self.name_field_xpath))
        )
        if name_element.is_enabled():  # Check if the element is enabled
            name_element.clear()
            name_element.send_keys(self.name)
            
    def addEmail(self, email):
        self.email = email
        email_element = WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((By.XPATH, self.email_field_xpath))
        )
        if email_element.is_enabled():  # Check if the element is enabled
            email_element.clear()
            email_element.send_keys(self.email)
            
    def addPassword(self, password):
        self.password = password
        password_element = WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((By.XPATH, self.password_field_xpath))
        )
        if password_element.is_enabled():  # Check if the element is enabled
            password_element.clear()
            password_element.send_keys(self.password)
            
    def clickOnAddGroupButton(self):
        addGroup_element = WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((By.XPATH, self.addGroup_button_xpath))
        )
        addGroup_element.click()
