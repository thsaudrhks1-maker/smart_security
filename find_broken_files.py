
import os

def check_encoding_issues(directory):
    bad_files = []
    # 깨진 한글의 전형적인 패턴들 (mojibake)
    suspicious_patterns = [
        '\ufffd', # 
        '痍⑥냼', '諛곗젙', '濡쒕뵫', '肄섑뀗痢', '?', '?'
    ]
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if any(pattern in content for pattern in suspicious_patterns):
                            bad_files.append(path)
                except:
                    # 인코딩 에러가 나는 파일은 무조건 수리가 필요한 파일임
                    bad_files.append(path)
    return bad_files

if __name__ == "__main__":
    target_dir = r'c:\github\smart_security\front\src'
    broken = check_encoding_issues(target_dir)
    print("---BROKEN_FILES_START---")
    for b in broken:
        print(b)
    print("---BROKEN_FILES_END---")
