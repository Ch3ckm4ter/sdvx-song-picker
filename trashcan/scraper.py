from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import time
import re

# 타겟 URL
TARGET_URL = "https://sdvx.vsfe.me/6/songs"

def scrape_sdvx_songs():
    # 1. 브라우저 설정
    chrome_options = Options()
    # [중요] 로그인을 직접 해야 하므로 Headless 모드는 반드시 꺼야 합니다.
    # chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080") 

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        driver.get(TARGET_URL)
        print(f"[{TARGET_URL}] 접속 시도 중...")
        time.sleep(3) # 리다이렉트 대기

        # ==========================================
        # [추가됨] 로그인 감지 및 수동 로그인 대기 로직
        # ==========================================
        current_url = driver.current_url
        if "login" in current_url or "signin" in current_url:
            print("\n" + "="*50)
            print("🚨 로그인 페이지가 감지되었습니다!")
            print("1. 열린 브라우저 창에서 직접 로그인을 진행해주세요.")
            print("2. 로그인이 완료되어 '곡 리스트'가 화면에 보이면...")
            print("3. 이 터미널로 돌아와서 [Enter] 키를 눌러주세요.")
            print("="*50 + "\n")
            
            # 사용자가 Enter를 누를 때까지 코드 실행을 멈춤
            input("로그인 완료 후 엔터(Enter)를 누르세요 >> ")
            
            print("크롤링을 재개합니다...")
            
            # 혹시 사용자가 다른 페이지에 있을 수 있으니 타겟 URL로 다시 이동 확인
            if driver.current_url != TARGET_URL:
                driver.get(TARGET_URL)
                time.sleep(3)
        # ==========================================

        # 2. 로딩 대기 (곡 리스트 컨테이너)
        print("데이터 로딩을 기다리는 중...")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "space-y-4"))
        )
        print("초기 로딩 완료. 스크롤을 시작합니다...")

        # 3. 무한 스크롤 (모든 이미지와 데이터 로딩)
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1.5) 
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                print("스크롤 완료! 더 이상 로딩할 데이터가 없습니다.")
                break
            last_height = new_height
            
        # 4. HTML 파싱
        print("데이터 추출을 시작합니다...")
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        songs_data = []
        container = soup.select_one("div.space-y-4")
        
        if container:
            cards = container.find_all("div", recursive=False)
        else:
            cards = soup.select("div.bg-darker.rounded-lg")

        for index, card in enumerate(cards):
            try:
                # 데스크탑 뷰 영역 찾기 (class에 'md:flex'가 포함된 div)
                desktop_view = card.find("div", class_=lambda x: x and 'md:flex' in x)
                target_area = desktop_view if desktop_view else card

                # 제목
                title_el = target_area.find("h3")
                title = title_el.text.strip() if title_el else "Unknown Title"

                # 아티스트
                artist = "Unknown Artist"
                if title_el:
                    artist_el = title_el.find_next_sibling("p")
                    if artist_el:
                        artist = artist_el.text.strip()

                # 자켓
                jacket_url = ""
                img_el = target_area.find("img")
                if img_el:
                    src = img_el.get("src")
                    if src.startswith("http"):
                        jacket_url = src
                    else:
                        jacket_url = "https://sdvx.vsfe.me" + src

                # 수록일
                date = "Unknown Date"
                text_content = target_area.get_text()
                date_match = re.search(r'20\d{2}-\d{2}-\d{2}', text_content)
                if date_match:
                    date = date_match.group(0)

                songs_data.append({
                    "id": index + 1,
                    "title": title,
                    "artist": artist,
                    "date": date,
                    "jacket": jacket_url
                })
                
                if (index + 1) % 100 == 0:
                    print(f"{index + 1}개 파싱 완료...")

            except Exception as e:
                continue

        # 5. JSON 파일 저장
        output_path = "./backend/data.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(songs_data, f, ensure_ascii=False, indent=2)

        print(f"\n[성공] 총 {len(songs_data)}곡을 '{output_path}'에 저장했습니다.")

    except Exception as e:
        print(f"오류 발생: {e}")
    
    finally:
        # 확인을 위해 바로 끄지 않고 잠시 대기하고 싶다면 아래 주석 해제
        # time.sleep(5) 
        driver.quit()

if __name__ == "__main__":
    scrape_sdvx_songs()