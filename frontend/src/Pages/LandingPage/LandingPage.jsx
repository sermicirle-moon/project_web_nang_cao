import Button from "../../Components/UI/button";
import person from "../../assets/img/person.png";

export default function HeroSection() {
  return (
    <section className="relative px-6 pt-16 pb-24 overflow-hidden">
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
          {/* Các đốm màu (Blobs) mờ ảo phía sau */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-container/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          {/* Card chứa hình ảnh nhân vật theo "The Layering Principle" */}
          <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-2xl rotate-2">
            <img 
              src={person} 
              alt="Minh họa OrganizeMe" 
              className="rounded-lg w-full max-w-[500px]" 
            />
            {/* Thẻ thông báo nhỏ nổi phía trên (Floating Card) */}
            <div className="absolute -bottom-6 -left-6 bg-secondary-container p-4 rounded-lg shadow-lg rotate-[-4deg] flex items-center gap-3">
              <span className="material-symbols-outlined text-on-secondary-container">task_alt</span>
              <div>
                <p className="font-bold text-sm text-on-secondary-container">12 Công việc</p>
                <p className="text-xs text-on-secondary-container/70">Đã hoàn thành!</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}