import React, { useState } from 'react';
import { createProject } from '../../api/projectApi';
import LocationPicker from '../../components/common/LocationPicker';
import './CreateProject.css';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    location_address: '',
    location_lat: null,
    location_lng: null,
    client_company: '',
    constructor_company: '',
    project_type: '',
    budget_amount: '',
    start_date: '',
    end_date: '',
    status: 'PLANNED',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 지도에서 위치 선택 시 자동으로 좌표 입력
  const handleLocationSelect = (lat, lng) => {
    setFormData({
      ...formData,
      location_lat: lat,
      location_lng: lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('프로젝트명은 필수입니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 숫자 필드 변환
      const payload = {
        ...formData,
        budget_amount: formData.budget_amount ? parseInt(formData.budget_amount) : null,
        location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
        location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
      };

      await createProject(payload);
      alert('프로젝트가 생성되었습니다!');
      window.location.href = '/projects'; // 목록으로 이동
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-container">
      <div className="create-header">
        <h1>새 프로젝트 생성</h1>
        <button className="btn-back" onClick={() => window.location.href = '/projects'}>
          ← 목록으로
        </button>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <section className="form-section">
          <h2>기본 정보</h2>
          
          <div className="form-group">
            <label>
              프로젝트명 <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: OO아파트 신축공사"
              required
            />
          </div>

          <div className="form-group">
            <label>공사 유형</label>
            <select name="project_type" value={formData.project_type} onChange={handleChange}>
              <option value="">선택하세요</option>
              <option value="신축">신축</option>
              <option value="리모델링">리모델링</option>
              <option value="토목">토목</option>
              <option value="설비">설비</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label>프로젝트 상태</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="PLANNED">계획 단계</option>
              <option value="ACTIVE">진행 중</option>
              <option value="DONE">완료</option>
            </select>
          </div>
        </section>

        {/* 위치 정보 */}
        <section className="form-section">
          <h2>위치 정보</h2>
          
          {/* 지도 위치 선택 */}
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLat={formData.location_lat}
            initialLng={formData.location_lng}
          />

          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              name="location_address"
              value={formData.location_address}
              onChange={handleChange}
              placeholder="예: 서울시 강남구 역삼동 123-45"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>위도 (Latitude)</label>
              <input
                type="number"
                step="0.000001"
                name="location_lat"
                value={formData.location_lat || ''}
                onChange={handleChange}
                placeholder="37.4979"
                readOnly
              />
              <small>지도에서 자동 입력됨</small>
            </div>

            <div className="form-group">
              <label>경도 (Longitude)</label>
              <input
                type="number"
                step="0.000001"
                name="location_lng"
                value={formData.location_lng || ''}
                onChange={handleChange}
                placeholder="127.0276"
                readOnly
              />
              <small>지도에서 자동 입력됨</small>
            </div>
          </div>
        </section>

        {/* 관계사 정보 */}
        <section className="form-section">
          <h2>관계사 정보</h2>
          
          <div className="form-group">
            <label>발주처</label>
            <input
              type="text"
              name="client_company"
              value={formData.client_company}
              onChange={handleChange}
              placeholder="예: OO건설"
            />
          </div>

          <div className="form-group">
            <label>시공사</label>
            <input
              type="text"
              name="constructor_company"
              value={formData.constructor_company}
              onChange={handleChange}
              placeholder="예: XX종합건설"
            />
          </div>
        </section>

        {/* 공사 상세 */}
        <section className="form-section">
          <h2>공사 상세</h2>
          
          <div className="form-group">
            <label>공사 금액 (원)</label>
            <input
              type="number"
              name="budget_amount"
              value={formData.budget_amount}
              onChange={handleChange}
              placeholder="500000000"
            />
            <small>예: 5억원 = 500000000</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>착공일</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>준공 예정일</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* 제출 버튼 */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => window.location.href = '/projects'}>
            취소
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '생성 중...' : '프로젝트 생성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
