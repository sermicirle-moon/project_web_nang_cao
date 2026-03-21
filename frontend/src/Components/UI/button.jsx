export default function Button({ children, variant = "primary", className = "" }) {
    const base = "font-headline font-extrabold text-lg px-8 py-4 rounded-xl transition-all duration-300 active:scale-95 hover:-translate-y-1 shadow-lg";
    
    const variants = {
        // Gradient từ primary sang primary-dim theo đúng rule "Glass & Gradient"
        primary: "bg-gradient-to-r from-primary to-primary-dim text-white shadow-primary/20",
        // Surface thấp cho các nút phụ
        secondary: "bg-surface-container-lowest text-primary border-2 border-primary/5 hover:bg-surface-container-low"
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}