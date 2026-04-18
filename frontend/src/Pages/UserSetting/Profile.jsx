import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. ĐÃ THÊM: Import công cụ chuyển trang
import api from "../../api/api";

export default function Profile() {
  const navigate = useNavigate(); // 2. ĐÃ THÊM: Khởi tạo vô lăng điều hướng

  // ==========================================
  // 1. STATE & LẤY DỮ LIỆU TỪ BACKEND (GET)
  // ==========================================
  const [profileData, setProfileData] = useState({
    name: "Đang tải...",
    email: "Đang tải...",
    phoneNumber: "Đang tải...",
    role: "...",
    bio: "...",
    avatarUrl: null
  });

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        setProfileData({
          name: response.data.name || "Chưa cập nhật",
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || "Chưa cập nhật",
          bio: response.data.bio || "Hãy thêm vài dòng giới thiệu về bản thân bạn...", 
          role: response.data.role,
          avatarUrl: response.data.avatarUrl || null
        });
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================
  // 2. CÁC HÀM XỬ LÝ CHỈNH SỬA & LƯU LÊN BACKEND (PUT)
  // ==========================================
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleSave = async () => {
    const updatedData = { ...profileData, [editingField]: editValue };
    setProfileData(updatedData);
    setEditingField(null);

    try {
      await api.put('/user/profile', {
        name: updatedData.name,
        phoneNumber: updatedData.phoneNumber,
        bio: updatedData.bio 
      });
    } catch (error) {
      alert("Lỗi không thể lưu lên Server. Vui lòng thử lại!");
    }
  };

  // ==========================================
  // 3. COMPONENT CON: Ô NHẬP LIỆU THÔNG MINH
  // ==========================================
  const EditableField = ({ label, fieldKey, value, icon, isTextArea = false }) => {
    const isEditing = editingField === fieldKey;

    return (
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 animate-fade-in">
            {isTextArea ? (
              <textarea 
                autoFocus rows="3"
                className="w-full bg-white border-2 border-emerald-400 rounded-xl p-3 text-gray-800 outline-none shadow-sm resize-none"
                value={editValue} onChange={(e) => setEditValue(e.target.value)}
              />
            ) : (
              <input 
                autoFocus
                className="w-full bg-white border-2 border-emerald-400 rounded-xl p-3 text-gray-800 outline-none shadow-sm"
                value={editValue} onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            )}
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={handleCancel} className="px-4 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors">Lưu</button>
            </div>
          </div>
        ) : (
          <div className="relative group w-full bg-[#e3fbfa] bg-opacity-50 border border-transparent rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-[#cbf5eb]">
            <span className="material-symbols-outlined text-emerald-500 mt-0.5">{icon}</span>
            <div className="flex-1 text-gray-800 font-medium leading-relaxed">
              {value || <span className="text-gray-400 italic">Chưa cập nhật</span>}
            </div>
            <button 
              onClick={() => startEditing(fieldKey, value)}
              className="absolute right-2 top-2 text-emerald-600 opacity-0 group-hover:opacity-100 bg-white shadow-sm p-1.5 rounded-lg transition-all hover:bg-emerald-50"
              title="Chỉnh sửa"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // 4. GIAO DIỆN CHÍNH
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Cài đặt tài khoản</p>
          <h1 className="text-3xl font-extrabold text-[#004d40] flex items-center gap-2">
            Chỉnh sửa Hồ sơ <span className="material-symbols-outlined text-[#004d40]">edit_square</span>
          </h1>
        </div>
        <span className="bg-[#bdf3e8] text-[#006054] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt động
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        {/* CỘT TRÁI: AVATAR & THÔNG TIN CHUNG */}
        <div className="md:col-span-1 bg-white rounded-[32px] p-8 shadow-sm flex flex-col items-center text-center h-fit border border-gray-50">
          <div className="relative mb-6 group">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-400 p-1">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-5xl font-bold text-emerald-600">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-9 h-9 bg-[#006054] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-emerald-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{profileData.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{profileData.email}</p>

          <div className={`mb-8 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider border ${profileData.role === 'Premium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            Role: {profileData.role}
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <EditableField label="Tên hiển thị" fieldKey="name" value={profileData.name} icon="badge" />
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email (Tài khoản)</label>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-3 cursor-not-allowed">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">mail</span>
                  <div className="flex-1 text-gray-500 font-medium">{profileData.email}</div>
                  <span className="material-symbols-outlined text-gray-300">lock</span>
                </div>
              </div>
            </div>

            <EditableField label="Số điện thoại" fieldKey="phoneNumber" value={profileData.phoneNumber} icon="call" />
            <EditableField label="Mô tả bản thân" fieldKey="bio" value={profileData.bio} icon="description" isTextArea={true} />
          </div>

          {/* 3. ĐÃ SỬA: CHỈ HIỂN THỊ BANNER NÀY NẾU ROLE KHÁC "Premium" */}
          {profileData.role !== 'Premium' && (
            <div className="bg-gradient-to-r from-[#cbf5eb] to-[#a0f0fa] rounded-[32px] p-6 flex justify-between items-center shadow-sm">
               <div>
                  <h3 className="font-bold text-[#006054] text-lg">Nâng cấp trải nghiệm?</h3>
                  <p className="text-sm text-[#006054] opacity-80">Mở khóa bảng điều khiển không giới hạn.</p>
               </div>
               <button 
                  onClick={() => navigate('/pricing')} // ĐÃ THÊM: Dẫn tới trang Pricing
                  className="bg-white text-[#006054] px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors"
               >
                  Xem gói Pro
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}