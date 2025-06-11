from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pytest
import time

# @pytest.fixture()

def setup():
    # google_email = "rimsha.bashir@dubizzlelabs.com"
    # google_password = "Rimsha1122!"

    # Set Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")

    # Initialize ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Inject headers via CDP
    headers = {
        "CF-Access-Client-Id": "42f24e5a1aa5dd4011f8223e3a366fc3.access",
        "CF-Access-Client-Secret": "51c68482765060cd76d50a5595534a0bf221a6afe4b4eb6262f5859485ac425a"
    }

    # Enable the network domain in CDP and set headers
    driver.execute_cdp_cmd("Network.enable", {})
    driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {"headers": headers})
    
    
    driver.get("https://neo.staging.profolio.ae/sales-companion")
    return driver
    
    
    


# def setup():
#     google_email = 'rimsha.bashir@dubizzlelabs.com'
#     google_password = 'Rimsha1122!'

#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
#     chrome_options = Options()

#     service = Service(ChromeDriverManager().install())
#     driver = webdriver.Chrome(service=service, options=chrome_options)

#     driver.get("https://neo.staging.profolio.ae/sales-companion")
#     driver.maximize_window()

#     email_input = WebDriverWait(driver, 20).until(
#         EC.presence_of_element_located((By.ID, "identifierId"))
#     )
#     time.sleep(1)
#     email_input.send_keys(google_email)
#     email_input.send_keys("\n")  # Simulates pressing ENTER

#     # Explicit wait for password input field
#     password_input = WebDriverWait(driver, 20).until(
#         EC.presence_of_element_located((By.NAME, "Passwd"))
#     )
#     time.sleep(1)
#     password_input.send_keys(google_password)
#     password_input.send_keys("\n")  # Simulates pressing ENTER

#     # Explicit wait for URL to ensure successful navigation
#     WebDriverWait(driver, 30).until(
#         EC.url_contains("https://neo.staging.profolio.ae/sales-companion")
#     )
#     print("Login successful")
#     return driver