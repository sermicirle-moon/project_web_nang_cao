import Button from "../../Components/UI/button";

export default function StickyCTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Container chính: Thêm text-center để căn giữa mọi thứ bên trong */}
      <div className="relative bg-secondary-container rounded-xl p-10 md:p-20 overflow-hidden shadow-[0_30px_60px_rgba(0,106,52,0.15)] text-center">
        
        {/* Decor Blobs: Giữ nguyên để tạo chiều sâu */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        {/* Nội dung: Sử dụng flex-col xuyên suốt các kích thước màn hình */}
        <div className="relative z-10 flex flex-col items-center gap-12">
          
          {/* Phần chữ: Căn giữa hoàn toàn */}
          <div className="max-w-3xl">
            <h2 className="font-headline font-black text-4xl md:text-6xl text-on-surface mb-6 leading-tight">
              Bắt đầu hành trình <span className="text-secondary">vui vẻ</span> ngay hôm nay
            </h2>
            <p className="font-body text-on-surface-variant text-lg md:text-xl font-medium opacity-90 leading-relaxed">
              Không cần thẻ tín dụng, không ràng buộc. <br className="hidden md:block" /> 
              Chỉ mất 30 giây để thiết lập không gian làm việc mơ ước của bạn.
            </p>
          </div>

          {/* Phần nút bấm: Tăng kích thước nút để làm điểm nhấn chính */}
          <div className="flex flex-col items-center gap-6">
            <Button 
              className="px-14 py-6 text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-secondary text-white border-none rounded-2xl"
            >
              Bắt Đầu Miễn Phí
            </Button>
            
            <div className="flex items-center gap-2 text-secondary font-bold text-sm font-headline tracking-wide opacity-80">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              100% BẢO MẬT & RIÊNG TƯ
            </div>
          </div>
          
        </div>

        {/* Floating Icons: Chỉnh lại vị trí để không bị đè lên chữ khi ở chiều dọc */}
        <div className="absolute top-10 left-10 animate-bounce opacity-10 hidden lg:block">
          <span className="material-symbols-outlined text-6xl text-secondary">rocket_launch</span>
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse opacity-10 hidden lg:block">
          <span className="material-symbols-outlined text-6xl text-secondary">celebration</span>
        </div>
      </div>
    </section>
  );
}