from selenium.common.exceptions import NoSuchWindowException

def handle_window_closed(test_func):
    """
    A decorator to handle the case where the browser window is closed during a test.
    """
    def wrapper(*args, **kwargs):
        try:
            test_func(*args, **kwargs)
        except NoSuchWindowException:
            print("Browser window was closed. Skipping this test.")
    return wrapper