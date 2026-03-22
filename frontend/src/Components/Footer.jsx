import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Hiệu ứng bo góc tròn ngược (Decorative Wave) */}
      <div className="absolute top-0 left-0 w-full h-10 bg-background -translate-y-full rounded-b-[3rem]"></div>

      <div className="bg-on-surface pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Cột 1: Brand */}
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="text-2xl font-black text-primary-container tracking-tighter font-headline mb-6 block">
                OrganizeMe
              </Link>
              <p className="text-surface-container-low font-body text-sm leading-relaxed opacity-80">
                Biến những danh sách công việc khô khan thành trải nghiệm đầy màu sắc và cảm hứng mỗi ngày.
              </p>
            </div>

            {/* Cột 2 & 3: Links */}
            <div>
              <h4 className="font-headline font-bold text-white mb-6 uppercase tracking-widest text-xs">Sản phẩm</h4>
              <ul className="space-y-4 font-body text-sm text-surface-container-low opacity-70">
                <li><a href="#" className="hover:text-primary-container transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-primary-container transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-primary-container transition-colors">Hướng dẫn</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-white mb-6 uppercase tracking-widest text-xs">Công ty</h4>
              <ul className="space-y-4 font-body text-sm text-surface-container-low opacity-70">
                <li><a href="#" className="hover:text-primary-container transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary-container transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-container transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            {/* Cột 4: Newsletter */}
            <div>
              <h4 className="font-headline font-bold text-white mb-6 uppercase tracking-widest text-xs">Cập nhật mới nhất</h4>
              <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 focus-within:border-primary-container transition-all">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="bg-transparent border-none focus:ring-0 text-white text-sm px-4 py-2 w-full font-body outline-none"
                />
                <button className="bg-primary-container text-on-surface font-black p-2 rounded-full hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined block">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:row justify-between items-center gap-4 text-xs font-body text-surface-container-low opacity-50">
            <p>© 2026 Zentask Project. Made with Whimsical Precision.</p>
            <div className="flex gap-6">
              <a href="#">Quyền riêng tư</a>
              <a href="#">Điều khoản</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}