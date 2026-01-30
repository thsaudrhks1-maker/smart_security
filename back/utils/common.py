import json
import os
import requests
import traceback
from contextlib import contextmanager
from functools import wraps
from fastapi import HTTPException

# ========================================================
#  File I/O Helpers
# ========================================================

def load_json_safe(file_path: str, default_data: dict = None) -> dict:
    """
    JSON 파일을 안전하게 읽어옵니다. (예외 발생 시 기본값 반환)
    """
    if default_data is None:
        default_data = {}
        
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass 
        
    return default_data

def save_json_safe(file_path: str, data: dict):
    """
    데이터를 JSON 파일로 안전하게 저장합니다. (디렉토리 자동 생성)
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def append_json_line(file_path: str, data: dict):
    """
    데이터를 JSONL 라인 단위로 파일에 추가합니다.
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'a', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
            f.write('\n')
    except Exception as e:
        print(f"Log append error: {e}")

# ========================================================
#  HTTP Request Helpers
# ========================================================

def safe_http_get(url: str, headers: dict = None) -> tuple[dict, str]:
    """
    HTTP GET 요청을 안전하게 수행합니다.
    :return: (성공시_JSON데이터, 실패시_에러메시지) 튜플 반환
    """
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json(), None
        else:
            return None, f"API 호출 실패: {response.status_code}, 상세: {response.text}"
    except Exception as e:
        return None, f"네트워크 오류: {str(e)}"

# ========================================================
#  Exception Handlers & Decorators
# ========================================================

@contextmanager
def safe_execute(error_msg="An error occurred"):
    """
    [Context Manager] 실행 중 예외가 발생해도 프로그램이 죽지 않도록 방어.
    Usage:
        with safe_execute("Description"):
            ... risky code ...
    """
    try:
        yield
    except Exception as e:
        print(f"⚠️ {error_msg}: {e}")

def handle_exceptions(default_message: str = "작업 실패"):
    """
    [비동기용] 예외 처리 데코레이터 (FastAPI Router용)
    - 예외 발생 시 로그 출력 및 HTTP 500 에러 반환
    - Frontend에서 response.data.detail로 에러 메시지 확인 가능
    
    사용법:
        @handle_exceptions(default_message="웹툰 생성 실패")
        async def generate_novel(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except HTTPException:
                raise  # FastAPI HTTPException은 그대로 전달 (이미 의도된 에러)
            except Exception as e:
                error_msg = f"{default_message}: {str(e)}"
                print(f"❌ {error_msg}")
                # 상세 트레이스백은 서버 로그에만 남김
                print(f"📍 Traceback:\n{traceback.format_exc()}")
                # 클라이언트에게는 500 에러와 함께 메시지 전달
                raise HTTPException(status_code=500, detail=error_msg)
        return wrapper
    return decorator


def handle_sync_exceptions(default_message: str = "작업 실패"):
    """
    [동기용] 예외 처리 데코레이터
    - 예외 발생 시 None 반환 (서버 중단 방지)
    
    사용법:
        @handle_sync_exceptions(default_message="이미지 처리 실패")
        def process_image(path):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_msg = f"{default_message}: {str(e)}"
                print(f"❌ {error_msg}")
                print(f"📍 Traceback:\n{traceback.format_exc()}")
                return None
        return wrapper
    return decorator
