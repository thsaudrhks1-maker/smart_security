---
name: dependency-manager
description: Python 및 Node.js 프로젝트의 종속성(Library/Module) 추가 및 설치 절차를 표준화하여 관리하는 스킬.
---

# Dependency Manager Skill

## 1. 기본 원칙 (Core Principles)
- **직접 설치 금지**: 에이전트는 절대로 `pip install <package>` 또는 `npm install <package>` 명령어를 단독으로 제안해서는 안 된다.
- **기록 우선 (Record First)**: 모든 의존성은 반드시 설정 파일(`requirements.txt` 또는 `package.json`)에 먼저 기록되어야 한다.
- **일괄 설치 안내**: 파일 수정 후, 사용자가 설정 파일을 기반으로 한 번에 설치할 수 있도록 명령어를 제공한다.

## 0. ⭐ 절대 금지 사항 (CRITICAL RULES)
- **파일 덮어쓰기 금지 (NO Overwrite):** `requirements.txt`나 `package.json`을 수정할 때, **절대로 `Overwrite: true`로 전체 내용을 덮어쓰지 않는다.** 
- **반드시 읽고 추가 (Read & Append):** 반드시 기존 내용을 `view_file`로 먼저 확인한 뒤, `replace_file_content` 등을 사용하여 **기존 내용을 유지하면서 새로운 항목만 추가**한다.
- **실수 방지**: 만약 전체를 다시 써야 한다면, 기존 내용을 **완벽하게 포함**하고 있는지 3번 확인한다.

이 스킬은 사용자가 새로운 라이브러리나 모듈 설치를 요청하거나, 코드 실행을 위해 새로운 의존성이 필요할 때 **반드시** 따라야 하는 절차를 정의합니다.

## 2. Python 프로젝트 절차 (Python Workflow)
1. **`requirements.txt` 확인 및 수정**:
   - 해당 파일이 없으면 생성한다.
   - 요청된 패키지가 파일에 이미 존재하는지 확인한다.
   - 없으면 `requirements.txt`에 패키지명을 추가한다. (버전 명시는 상황에 따라 판단)

2. **설치 명령어 제안**:
   - 가상환경(venv) 사용을 가정하여 경로를 포함한 명령어를 제공한다.
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\pip install -r requirements.txt
     ```
   - **Mac/Linux**:
     ```bash
     ./venv/bin/pip install -r requirements.txt
     ```

## 3. Node.js 프로젝트 절차 (Node.js Workflow)
1. **`package.json` 확인**:
   - `package.json`이 존재하는지 확인한다.

2. **설치 명령어 제안**:
   - npm 사용 시: `npm install --save <package>` (이 명령어는 devDependencies 구분 등을 위해 예외적으로 허용되나, 가능하면 `package.json` 수정 후 `npm install`을 권장)
   - 하지만 사용자의 Global Rule에 따라 `npm install`을 통해 lock 파일을 갱신하는 것이 정석이다.

## 4. 예외 상황 (Exceptions)
- 일회성 도구 설치나 글로벌 설치가 명백히 필요한 경우(예: `npm install -g create-react-app`)는 예외로 하되, 이유를 명시한다.
