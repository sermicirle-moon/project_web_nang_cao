import Button from "../../Components/UI/button";
import person from "../../assets/img/person.png";

export default function HeroSection() {
  return (
    // Thêm lớp nền cơ bản là 'surface' để tạo độ tương phản với các Card
    <section className="relative px-6 pt-16 pb-24 overflow-hidden bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Bên trái: Nội dung chữ */}
        <div className="z-10 text-center lg:text-left">
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-surface leading-[1.1] tracking-tight mb-8">
            Làm Việc Vui Vẻ, <span className="text-primary block">Sống Hiệu Quả</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-body">
            Biến danh sách công việc khô khan thành trải nghiệm đầy màu sắc. OrganizeMe giúp bạn quản lý thời gian với phong cách Whimsical Precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button>Bắt Đầu Ngay - Miễn Phí</Button>
            <Button variant="secondary">Xem Video Giới Thiệu</Button>
          </div>
        </div>

        {/* Bên phải: Hình minh họa & Các khối Blob trang trí */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Blobs trang trí: Sử dụng opacity thấp để không làm rối mắt */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-container/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute -bottom-10 left-0 w-60 h-60 bg-tertiary-container/20 rounded-full blur-3xl -z-10"></div>
          
          {/* Card chứa ảnh: Sử dụng 'surface_container_lowest' (trắng tinh) để nổi bật trên nền 'surface' */}
          <div className="relative bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(0,53,52,0.12)] rotate-2 border border-white/50">
            <img 
              src={person} 
              alt="Minh họa OrganizeMe" 
              className="rounded-lg w-full max-w-[500px] bg-surface-container-low" 
            />
            
            {/* Floating Card: Giữ nguyên màu xanh lá nhưng thêm shadow sâu hơn để tách lớp */}
            <div className="absolute -bottom-6 -left-6 bg-secondary-container p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,106,52,0.15)] rotate-[-4deg] flex items-center gap-4 border-4 border-white">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        task_alt
                    </span>
                </div>
                <div className="pr-2">
                    <p className="font-headline font-black text-sm text-on-secondary-container leading-none mb-1">
                        12 Công việc
                    </p>
                    <p className="font-body text-xs text-on-secondary-container/80 font-medium">
                        Đã hoàn thành!
                    </p>
                </div>
            </div>
          </div>
        </div>

      </div>
      
    </section>
        
  );
}