export default function FeatureCard({ icon, title, description, variant = "primary" }) {
  // Mapping màu sắc dựa trên bảng màu bạn đã cấu hình trong tailwind.config
  const variants = {
    primary: "bg-primary-container/20 text-primary",
    secondary: "bg-secondary-container/30 text-secondary",
    tertiary: "bg-tertiary-container/30 text-tertiary",
  };

  return (
    <div className="group bg-surface-container-lowest p-10 rounded-xl shadow-[0_20px_40px_rgba(0,53,52,0.08)] hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-primary/10">
      {/* Icon Circle */}
      <div className={`w-16 h-16 ${variants[variant]} rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      
      {/* Text Content */}
      <h3 className="font-headline font-extrabold text-2xl mb-4 text-on-surface">
        {title}
      </h3>
      <p className="text-on-surface-variant leading-relaxed font-body">
        {description}
      </p>
    </div>
  );
}