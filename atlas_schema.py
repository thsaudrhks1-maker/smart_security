import sys
import os
import io

# Windows 환경에서 한글 출력이 깨지지 않도록 UTF-8 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 프로젝트 루트를 경로에 추가
sys.path.append(os.getcwd())

from back.database import Base
from atlas_provider_sqlalchemy.ddl import print_ddl

# SQLAlchemy 모델의 메타데이터를 Atlas가 읽을 수 있는 DDL로 출력
# vector 확장이 필요한 경우 맨 처음에 출력해줘야 Atlas dev DB가 인식함
# Extensions는 DB에서 수동으로 관리하거나 Atlas config로 처리
# print_ddl(dialect, [model_or_metadata_holder])
print_ddl("postgresql", [Base])
