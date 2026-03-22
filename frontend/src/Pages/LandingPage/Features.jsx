import FeatureCard from "../../Components/FeatureCard";

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      {/* Tiêu đề Section */}
      <div className="text-center mb-20">
        <h2 className="font-headline font-black text-4xl text-on-surface mb-4">
          Tính Năng Tuyệt Vời
        </h2>
        <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Grid chứa các thẻ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon="checklist"
          title="Lên Kế Hoạch Dễ Dàng"
          description="Sắp xếp ngày của bạn chỉ với vài cú nhấp chuột. Kéo và thả để thay đổi ưu tiên tức thì."
          variant="primary"
        />
        <FeatureCard 
          icon="progress_activity"
          title="Theo Dõi Thói Quen"
          description="Xây dựng chuỗi thói quen tích cực với vòng tròn tiến độ rực rỡ và đầy cảm hứng."
          variant="secondary"
        />
        <FeatureCard 
          icon="timer"
          title="Làm Việc Tập Trung"
          description="Phương pháp Pomodoro kết hợp âm thanh thư giãn giúp bạn đắm mình vào công việc."
          variant="tertiary"
        />
      </div>
    </section>
  );
}