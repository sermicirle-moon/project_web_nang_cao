// src/Pages/About/About.jsx
import { Link } from "react-router-dom";
import Button from "../../Components/UI/button";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline font-black text-5xl md:text-6xl text-on-surface mb-6">
          Our Mission: <span className="text-primary">Redefining Productivity</span> with Precision
        </h1>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed">
          We create big plans for small‑scale projects and businesses. We are committed to making every project a success in the end.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 bg-primary-container/20 px-6 py-3 rounded-full">
          <span className="text-3xl font-black text-primary">+42%</span>
          <span className="text-on-surface font-medium">Our productivity has increased by 42%.</span>
        </div>
      </section>

      {/* Story Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-headline font-black text-3xl text-on-surface mb-4">The Story</h2>
          <p className="text-on-surface-variant leading-relaxed font-body">
            The story of our company is a testament to how we have been able to achieve remarkable results despite being a small business.
            In <span className="font-bold text-primary">2019</span>, we started our journey as a small business. We faced many challenges, but we never gave up. 
            We worked hard and learned from our mistakes. Today, we are a successful company that helps other businesses succeed.
          </p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-8 text-center">
          <div className="text-6xl font-black text-primary mb-2">2019</div>
          <p className="text-on-surface-variant">Year founded</p>
          <div className="w-16 h-1 bg-primary mx-auto my-4 rounded-full"></div>
          <div className="text-3xl font-black text-primary">100+</div>
          <p className="text-on-surface-variant">Projects delivered</p>
        </div>
      </section>

      {/* Core Values */}
      <section>
        <h2 className="font-headline font-black text-3xl text-center text-on-surface mb-12">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Precision", desc: "We focus on creating precise solutions that meet the needs of our clients.", icon: "target" },
            { title: "Efficiency", desc: "We work efficiently to deliver results quickly and effectively.", icon: "bolt" },
            { title: "Transparency", desc: "We are transparent about our processes and decisions. We want to build trust with our clients.", icon: "visibility" }
          ].map((value, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">{value.icon}</span>
              <h3 className="font-headline font-bold text-xl text-on-surface mb-2">{value.title}</h3>
              <p className="text-on-surface-variant font-body">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="font-headline font-black text-3xl text-center text-on-surface mb-12">The Precision Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Alexandra O'Shea", role: "Founder & CEO", linkedin: "https://www.linkedin.com/in/alexandraoshea/" },
            { name: "Elise Rodriguez", role: "Head of Marketing", linkedin: "https://www.linkedin.com/in/eliserodriguez" },
            { name: "Emilia Varela", role: "Lead Designer", linkedin: "https://www.linkedin.com/in/emiliavarela/" }
          ].map((member, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm text-center border border-gray-100">
              <div className="w-24 h-24 bg-primary-container rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-primary">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">{member.name}</h3>
              <p className="text-primary font-medium mb-3">{member.role}</p>
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
                <span className="material-symbols-outlined text-[16px]">link</span> LinkedIn
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-container/30 rounded-2xl p-12 text-center">
        <h2 className="font-headline font-black text-3xl text-on-surface mb-4">Join the Precision Revolution</h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto mb-8">
          Experience a new perspective and join us in shaping the future of precision.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button variant="primary">Create Your Account</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="secondary">Request a Demo</Button>
          </Link>
        </div>
        <div className="mt-10 pt-6 border-t border-primary/20 flex justify-between items-center text-sm text-on-surface-variant">
          <span>Teamwork For You</span>
          <span>A leader in the industry's best practices</span>
        </div>
      </section>
    </div>
  );
}