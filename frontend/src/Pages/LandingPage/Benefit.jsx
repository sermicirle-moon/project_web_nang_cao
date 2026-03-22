import benefitsImg from "../../assets/img/benefit.png";

export default function Benefits() {
  const benefits = [
    { title: "Giao diện vui nhộn", desc: "Không còn bảng biểu xám xịt, mọi thứ đều rực rỡ năng lượng." },
    { title: "Đồng bộ đa thiết bị", desc: "Dữ liệu của bạn luôn bên mình, từ điện thoại đến máy tính." },
    { title: "Phần thưởng Dopamine", desc: "Hoàn thành việc và nhận được những hiệu ứng thú vị." }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-40">
      <div className="bg-surface-container-low rounded-xl p-12 lg:p-20 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hình ảnh Dashboard minh họa */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -top-10 -left-10 w-full h-full bg-white/20 rounded-xl blur-2xl -z-10"></div>
            <img 
              src={benefitsImg} 
              alt="Dashboard" 
              className="rounded-xl shadow-2xl w-full border-4 border-white" 
            />
          </div>

          {/* Danh sách lợi ích */}
          <div className="order-1 lg:order-2">
            <h2 className="font-headline font-black text-4xl md:text-5xl text-on-surface mb-8 leading-tight">
              Tại Sao Chọn OrganizeMe?
            </h2>
            <ul className="space-y-8">
              {benefits.map((item, index) => (
                <li key={index} className="flex gap-5 group">
                  <div className="shrink-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-xl text-on-surface mb-1">{item.title}</h4>
                    <p className="font-body text-on-surface-variant font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}