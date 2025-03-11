# import os
# import time
# import requests
# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from webdriver_manager.chrome import ChromeDriverManager

# # 🔹 Function to set up Chrome WebDriver
# def setup_driver():
#     options = webdriver.ChromeOptions()
#     # options.add_argument("--headless")  # Run Chrome in headless mode
#     options.add_argument("--disable-gpu")
#     options.add_argument("--window-size=1920x1080")
#     options.add_argument("--no-sandbox")
#     options.add_argument("--disable-dev-shm-usage")
#     options.add_argument("--incognito")  # Use incognito mode to bypass tracking

#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
#     return driver

# # 🔹 Function to scroll and load more images
# def scroll_and_load(driver, max_scrolls=50):
#     last_height = driver.execute_script("return document.body.scrollHeight")
#     scroll_count = 0
    
#     while scroll_count < max_scrolls:
#         driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
#         time.sleep(2)  # Wait for images to load
#         new_height = driver.execute_script("return document.body.scrollHeight")
        
#         if new_height == last_height:
#             break  # Stop if no new images load
        
#         last_height = new_height
#         scroll_count += 1

# # 🔹 Function to download images
# def download_images(query, num_images=500, use_google=True):
#     driver = setup_driver()
    
#     # ✅ Use Google or Bing
#     if use_google:
#         driver.get(f"https://www.google.com/search?tbm=isch&q={query}")
#     else:
#         driver.get(f"https://www.bing.com/images/search?q={query}")

#     # Wait for images to load
#     try:
#         WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "img")))
#     except:
#         print("❌ Error: Images not loaded. Try using a VPN or waiting longer.")
#         driver.quit()
#         return
    
#     # Scroll down to load more images
#     print("🔄 Scrolling to load images...")
#     scroll_and_load(driver)

#     # Get image elements
#     image_elements = driver.find_elements(By.CSS_SELECTOR, "img")
#     print(f"✅ Found {len(image_elements)} images.")

#     # Create a folder to save images
#     folder_name = query.replace(" ", "_")
#     os.makedirs(folder_name, exist_ok=True)

#     count = 0
#     for img in image_elements:
#         if count >= num_images:
#             break
#         try:
#             img_url = img.get_attribute("src")
#             if not img_url or "http" not in img_url:
#                 img_url = img.get_attribute("data-src")  # Try loading lazy-loaded images
            
#             if img_url and "http" in img_url:
#                 response = requests.get(img_url, stream=True)
#                 with open(f"{folder_name}/{count+1}.jpg", "wb") as file:
#                     for chunk in response.iter_content(1024):
#                         file.write(chunk)
#                 print(f"✅ Downloaded {count+1}.jpg")
#                 count += 1
#         except Exception as e:
#             print(f"⚠️ Error downloading image {count+1}: {e}")

#     driver.quit()
#     print("🎉 Download complete!")

# # 🔹 Run the scraper
# download_images("empty and clean indian streets", num_images=1500, use_google=True)
import os
import time
import random
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920x1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--incognito")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def scroll_and_load(driver, max_scrolls=200):
    last_height = driver.execute_script("return document.body.scrollHeight")
    scroll_count = 0

    while scroll_count < max_scrolls:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(random.uniform(2, 5))  # Random sleep to avoid detection
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
        scroll_count += 1

def download_images(query, num_images=500, use_google=True):
    driver = setup_driver()

    if use_google:
        driver.get(f"https://www.google.com/search?tbm=isch&q={query}")
    else:
        driver.get(f"https://www.bing.com/images/search?q={query}")

    try:
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, "img")))
    except:
        print("❌ Error: Images not loaded. Try using a VPN or waiting longer.")
        driver.quit()
        return

    print("🔄 Scrolling to load images...")
    scroll_and_load(driver)

    image_elements = driver.find_elements(By.CSS_SELECTOR, "img")
    print(f"✅ Found {len(image_elements)} images.")

    folder_name = query.replace(" ", "_")
    os.makedirs(folder_name, exist_ok=True)

    count = 0
    for img in image_elements:
        if count >= num_images:
            break
        try:
            img_url = img.get_attribute("src") or img.get_attribute("data-src")
            if img_url and "http" in img_url:
                response = requests.get(img_url, stream=True, timeout=10)
                with open(f"{folder_name}/{count+1}.jpg", "wb") as file:
                    for chunk in response.iter_content(1024):
                        file.write(chunk)
                print(f"✅ Downloaded {count+1}.jpg")
                count += 1
                time.sleep(random.uniform(1, 3))  # Random delay to avoid rate-limiting
        except Exception as e:
            print(f"⚠️ Error downloading image {count+1}: {e}")

    driver.quit()
    print("🎉 Download complete!")

# Run the scraper
download_images("clean indian roads", num_images=10, use_google=True)
