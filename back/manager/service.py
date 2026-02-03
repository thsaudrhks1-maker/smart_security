from datetime import date
from back.manager.repository import ManagerRepository

class ManagerService:
    
    @staticmethod
    async def get_manager_dashboard(user_id: int):
        # 1. 내 프로젝트 정보 조회
        project = await ManagerRepository.get_my_project_info(user_id)
        
        if not project:
            # 프로젝트 없음 (빈 객체 반환)
            return {
                "manager_info": {"role": "관리자"},
                "project_info": None, 
                "stats": {"total_workers": 0, "today_attendance": 0}
            }
            
        pid = project["project_id"]
        today = str(date.today())
        
        # 2. 통계 조회
        stats = await ManagerRepository.get_project_stats(pid, today)
        
        return {
            "manager_info": {
                "role": project["my_role"]
            },
            "project_info": {
                "id": project["project_id"],
                "name": project["project_name"],
                "location": project["location_name"],
                "period": f"{project['start_date']} ~ {project['end_date']}"
            },
            "stats": stats
        }

    @staticmethod
    async def get_my_companies(user_id: int):
        project = await ManagerRepository.get_my_project_info(user_id)
        if not project: return []
        return await ManagerRepository.get_project_companies(project["project_id"])

    @staticmethod
    async def get_my_workers(user_id: int):
        project = await ManagerRepository.get_my_project_info(user_id)
        if not project: return []
        return await ManagerRepository.get_project_workers(project["project_id"])
