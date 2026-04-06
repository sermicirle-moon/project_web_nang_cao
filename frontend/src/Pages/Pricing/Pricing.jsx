import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ĐÃ THÊM Ở ĐÂY: Import công cụ chuyển trang

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  
  const navigate = useNavigate(); // ĐÃ THÊM Ở ĐÂY: Khởi tạo biến navigate

  const handlePlanClick = (planId) => {
    if (planId === "free") {
      navigate('/settings'); 
    } else {
      const selectedPlan = plans.find(p => p.id === planId);

      const finalPrice = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;

      navigate('/checkout', { 
        state: { 
          planName: selectedPlan.name, 
          isYearly: isYearly, 
          price: finalPrice 
        } 
      });
    }
  };

  const plans = [
    {
      id: "free",
      badge: "ESSENTIAL",
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["Up to 3 projects", "Basic templates", "Mobile access"],
      buttonText: "Start Free",
      buttonClass: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      cardClass: "border-gray-200 bg-gray-50/50",
    },
    {
      id: "pro",
      badge: "ADVANCED",
      name: "Pro",
      monthlyPrice: 9.99,
      yearlyPrice: 7.99,
      popular: true,
      features: ["Unlimited projects", "Advanced automation", "Priority support", "Custom domains"],
      buttonText: "Level Up Now",
      buttonClass: "bg-gradient-to-r from-[#004d40] to-[#2ecc71] text-white hover:opacity-90 shadow-lg",
      cardClass: "border-emerald-400 bg-white shadow-2xl scale-105 z-10 relative",
    },
    {
      id: "team",
      badge: "COLLABORATION",
      name: "Team",
      monthlyPrice: 19.99,
      yearlyPrice: 15.99,
      features: ["Shared workspaces", "Team permissions", "Admin dashboard"],
      buttonText: "Get Started",
      buttonClass: "bg-[#004d40] text-white hover:bg-[#00362d]",
      cardClass: "border-gray-200 bg-white shadow-sm",
    }
  ];

  const faqs = [
    { question: "Can I change my plan later?", answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings." },
    { question: "What happens when I cancel?", answer: "Your workspace will remain active until the end of your billing cycle, then switch to the Free plan." },
    { question: "Do you offer educational discounts?", answer: "Yes! Students and educators get 50% off the Pro plan. Contact our support team to apply." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* ================= 1. HEADER & TOGGLE ================= */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Plans that grow <span className="text-[#004d40]">with you.</span>
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Choose the perfect organizational engine for your productivity. From solo creators to enterprise teams.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 text-sm font-bold">
          <span className={!isYearly ? "text-gray-900" : "text-gray-400"}>Monthly</span>
          
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-[#004d40] rounded-full p-1 flex items-center transition-all duration-300"
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
          
          <span className="flex items-center gap-2">
            <span className={isYearly ? "text-gray-900" : "text-gray-400"}>Yearly</span>
            <span className="bg-[#bdf3e8] text-[#004d40] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">20% Off</span>
          </span>
        </div>
      </div>

      {/* ================= 2. PRICING CARDS ================= */}
      <div className="grid md:grid-cols-3 gap-8 items-center mb-24">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-[2rem] border-2 p-8 flex flex-col h-full ${plan.cardClass}`}>
            
            {/* Huy hiệu Most Popular (Chỉ có ở gói Pro) */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ccff90] text-[#004d40] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                Most Popular
              </div>
            )}

            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">{plan.badge}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
            
            <div className="mb-8 flex items-end gap-1">
              <span className="text-5xl font-extrabold text-gray-900">
                ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
              </span>
              <span className="text-gray-400 font-medium mb-1">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                  <span className="material-symbols-outlined text-[#004d40] text-[18px]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* ĐÃ SỬA Ở ĐÂY: Gắn sự kiện onClick vào nút */}
            <button 
              onClick={() => handlePlanClick(plan.id)}
              className={`w-full py-3.5 rounded-xl font-bold transition-all ${plan.buttonClass}`}
            >
              {plan.buttonText}
            </button>
            
          </div>
        ))}
      </div>

      {/* ================= 3. FEATURES (WHY CHOOSE US) ================= */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why choose a paid plan?</h2>
        
        {/* Lưới Bento Box */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Hàng 1: 2 ô lớn */}
          <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-[#e6f9f5] p-8 rounded-3xl border border-gray-100">
            <div className="w-10 h-10 bg-[#bdf3e8] rounded-full flex items-center justify-center text-[#004d40] mb-4">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Intelligent Workflow</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Let AI handle the repetitive tagging and sorting while you focus on high-impact creativity.</p>
          </div>
          
          <div className="md:col-span-3 bg-gradient-to-br from-[#e6f9f5] to-[#ccf5eb] p-8 rounded-3xl border border-emerald-50">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#004d40] mb-4 shadow-sm">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Fort Knox Security</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Enterprise-grade encryption and daily backups ensure your data remains your data, always.</p>
          </div>

          {/* Hàng 2: 3 ô nhỏ */}
          <div className="md:col-span-2 lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <span className="material-symbols-outlined text-[#004d40] mb-3">sync</span>
             <h4 className="text-md font-bold text-gray-900 mb-1">Seamless Sync</h4>
             <p className="text-xs text-gray-500">Update on desktop, view on mobile instantly with zero lag.</p>
          </div>
          <div className="md:col-span-3 lg:col-span-2 bg-[#f4fdf8] p-6 rounded-3xl border border-green-50 shadow-sm">
             <span className="material-symbols-outlined text-[#004d40] mb-3">group</span>
             <h4 className="text-md font-bold text-gray-900 mb-1">Real-time Collab</h4>
             <p className="text-xs text-gray-500">See changes as they happen with multi-user live editing.</p>
          </div>
          <div className="md:col-span-5 lg:col-span-2 bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
             <span className="material-symbols-outlined text-gray-600 mb-3">history</span>
             <h4 className="text-md font-bold text-gray-900 mb-1">Version History</h4>
             <p className="text-xs text-gray-500">Go back in time. We save every version of your work for 30 days.</p>
          </div>
        </div>
      </div>

      {/* ================= 4. FAQ ================= */}
      <div className="max-w-3xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between font-bold text-gray-800 hover:bg-gray-100/50"
              >
                {faq.question}
                <span className={`material-symbols-outlined transition-transform duration-300 text-gray-400 ${openFaq === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {/* Nội dung xổ xuống */}
              <div className={`px-6 text-gray-600 text-sm overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 5. BOTTOM CTA ================= */}
      <div className="bg-[#004d40] rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-xl">
        {/* Vài hình tròn mờ trang trí nền */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ccff90] opacity-10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
        
        <h2 className="text-4xl font-bold mb-4 relative z-10">Ready to organize your life?</h2>
        <p className="text-[#a7d8cf] mb-10 max-w-lg mx-auto relative z-10">
          Join over 50,000+ creators who trust OrganizeMe to power their daily productivity.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          {/* ĐÃ SỬA Ở ĐÂY: Nút dưới cùng cũng dẫn sang checkout */}
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-[#ccff90] text-[#004d40] font-bold px-8 py-3.5 rounded-full hover:bg-[#b5e67a] shadow-lg transition-transform hover:-translate-y-1"
          >
            Get Started for Free
          </button>
          <button className="bg-transparent border-2 border-[#1e6659] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#1e6659] transition-colors">
            Talk to Sales
          </button>
        </div>
      </div>

    </div>
  );
}