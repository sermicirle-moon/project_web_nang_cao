import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ĐÃ THÊM useLocation
import api from "../../api"; 

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation(); // Bật ăng-ten hứng dữ liệu
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isProcessing, setIsProcessing] = useState(false);

  // ==========================================
  // XỬ LÝ DỮ LIỆU TỪ TRANG PRICING TRUYỀN SANG
  // ==========================================
  // Nếu có dữ liệu thì lấy, nếu khách truy cập thẳng link /checkout thì set mặc định
  const planName = location.state?.planName || "Pro";
  const isYearly = location.state?.isYearly || false;
  const basePrice = location.state?.price || 49000; 

  // Tính thuế VAT (10%) và Tổng tiền
  const vat = basePrice * 0.1;
  const totalPrice = basePrice + vat;

  // Hàm giúp format tiền cho đẹp (Tự nhận diện tiền USD hay VND)
  const formatMoney = (amount) => {
    if (amount > 1000) {
      // Nếu là số lớn (VD: 49000) thì hiển thị kiểu VN: 49.000đ
      return amount.toLocaleString('vi-VN') + 'đ';
    } else {
      // Nếu là số nhỏ (VD: 9.99) thì hiển thị kiểu Mỹ: $9.99
      return '$' + amount.toFixed(2);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('/user/upgrade');
      localStorage.setItem('token', response.data.token);
      alert("Thanh toán thành công! Chào mừng bạn đến với gói Premium.");
      navigate('/settings'); 
    } catch (error) {
      if (error.response?.status === 400) {
        alert("Bạn đã là thành viên Premium rồi!");
        navigate('/settings');
      } else {
        alert("Có lỗi xảy ra trong quá trình thanh toán.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-500">Hoàn tất đơn hàng của bạn với sự chuẩn xác và tinh tế.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN (Giữ nguyên như cũ) */}
          <div className="flex-1 space-y-6">
            <div className="bg-[#f0f4f3] rounded-[32px] p-8">
              <h2 className="text-xl font-bold text-[#004d40] mb-6">Phương thức thanh toán</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div onClick={() => setPaymentMethod("credit")} className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'credit' ? 'bg-white border-[#006054] shadow-sm' : 'border-transparent bg-gray-50 hover:bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'credit' ? 'bg-[#006054] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Thẻ tín dụng</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit' ? 'border-[#006054]' : 'border-gray-300'}`}>
                    {paymentMethod === 'credit' && <div className="w-2.5 h-2.5 bg-[#006054] rounded-full"></div>}
                  </div>
                </div>

                <div onClick={() => setPaymentMethod("ewallet")} className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'ewallet' ? 'bg-white border-[#006054] shadow-sm' : 'border-transparent bg-gray-50 hover:bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'ewallet' ? 'bg-[#006054] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Ví điện tử</p>
                      <p className="text-xs text-gray-500">Momo, ZaloPay, ShopeePay</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ewallet' ? 'border-[#006054]' : 'border-gray-300'}`}>
                    {paymentMethod === 'ewallet' && <div className="w-2.5 h-2.5 bg-[#006054] rounded-full"></div>}
                  </div>
                </div>
              </div>

              {paymentMethod === "credit" && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên trên thẻ</label>
                    <input type="text" placeholder="NGUYEN VAN A" className="w-full bg-white border-none rounded-xl p-4 text-gray-800 outline-none shadow-sm font-medium focus:ring-2 focus:ring-[#006054]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số thẻ</label>
                    <div className="relative">
                      <input type="text" placeholder="**** **** **** 1234" className="w-full bg-white border-none rounded-xl p-4 text-gray-800 outline-none shadow-sm font-medium focus:ring-2 focus:ring-[#006054]" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center italic">VISA</div>
                        <div className="w-8 h-5 bg-orange-500 rounded flex items-center justify-center"><div className="w-3 h-3 bg-red-500 rounded-full mix-blend-multiply"></div><div className="w-3 h-3 bg-yellow-400 rounded-full mix-blend-multiply -ml-1"></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ngày hết hạn</label>
                      <input type="text" placeholder="MM / YY" className="w-full bg-white border-none rounded-xl p-4 text-gray-800 outline-none shadow-sm font-medium focus:ring-2 focus:ring-[#006054]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                      <input type="password" placeholder="***" className="w-full bg-white border-none rounded-xl p-4 text-gray-800 outline-none shadow-sm font-medium focus:ring-2 focus:ring-[#006054]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#f0f4f3] rounded-[32px] p-8 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#004d40] mb-4">Chi tiết thanh toán</h2>
                <div className="bg-white rounded-2xl p-5 border-l-4 border-[#ccff90] shadow-sm">
                  <p className="font-bold text-gray-900 mb-1">Tài khoản Zentask của bạn</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Gói cước sẽ được kích hoạt ngay lập tức cho tài khoản đang đăng nhập.<br/>
                    Hóa đơn điện tử sẽ được gửi qua Email đăng ký.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (ĐÃ CẬP NHẬT ĐỂ ĐỌC DỮ LIỆU ĐỘNG) */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-6 mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#006054] to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-md">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      {/* Hiển thị Tên Gói động */}
                      <p className="font-bold text-gray-900">Zentask {planName}</p>
                      {/* Hiển thị Thời hạn động */}
                      <p className="text-xs text-gray-500">Gói {isYearly ? "1 Năm" : "1 Tháng"}</p>
                    </div>
                  </div>
                  {/* Hiển thị Giá động */}
                  <p className="font-bold text-[#006054]">{formatMoney(basePrice)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-gray-500">
                  <p>Tạm tính</p>
                  <p className="font-medium text-gray-800">{formatMoney(basePrice)}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  <p>VAT (10%)</p>
                  <p className="font-medium text-gray-800">{formatMoney(vat)}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  <p>Phí thiết lập</p>
                  <p className="font-bold text-emerald-500">Miễn phí</p>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <p className="font-bold text-gray-900 text-lg">Tổng cộng</p>
                {/* Hiển thị Tổng Tiền động */}
                <p className="text-3xl font-extrabold text-[#006054]">{formatMoney(totalPrice)}</p>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#81c784] to-[#aed581] hover:from-[#66bb6a] hover:to-[#9ccc65] text-[#004d40] font-bold py-4 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 mb-6 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"} 
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <p className="text-[10px] text-center text-gray-400 leading-relaxed px-4">
                Bằng việc nhấn xác nhận, bạn đồng ý với các Điều khoản & Chính sách của Zentask.
              </p>

              <div className="flex justify-center gap-6 mt-8 text-gray-400">
                <span className="material-symbols-outlined">verified_user</span>
                <span className="material-symbols-outlined">lock</span>
                <span className="material-symbols-outlined">support_agent</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}