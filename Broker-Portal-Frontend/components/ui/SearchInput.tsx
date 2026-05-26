
import { Search } from "lucide-react";
interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder,
}: SearchInputProps) {
    return (
        <div
            style={{
                position: "relative",
                flex: 1,
                maxWidth: "480px",
            }}
        >
            <Search
                size={15}
                style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-foreground)",
                    pointerEvents: "none",
                }}
            />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--input)",
                    padding: "0 12px 0 36px",
                    fontSize: "13px",
                    color: "var(--foreground)",
                    outline: "none",
                    boxSizing: "border-box"
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
        </div>
    );
}