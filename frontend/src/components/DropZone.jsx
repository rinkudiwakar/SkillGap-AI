import { useRef, useState } from "react";

export default function DropZone({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  
  const handleDrop = (e) => { 
    e.preventDefault(); 
    setDragging(false); 
    const f = e.dataTransfer.files?.[0]; 
    if (f) onChange(f); 
  };

  return (
    <div>
      <div 
        className={`dropzone-area${dragging ? " active" : ""}`} 
        onClick={() => inputRef.current?.click()} 
        onDragOver={e => { e.preventDefault(); setDragging(true); }} 
        onDragLeave={() => setDragging(false)} 
        onDrop={handleDrop}
      >
        <div className="dropzone-icon">📄</div>
        <div className="dropzone-label">Drop your PDF here, or <strong>click to browse</strong></div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>
          Accepted: PDF only · Max 5MB · Not stored after session
        </div>
        <input 
          ref={inputRef} 
          type="file" 
          accept="application/pdf" 
          style={{ display: "none" }} 
          onChange={e => onChange(e.target.files?.[0] || null)} 
        />
      </div>
      {file && (
        <div className="file-preview">
          <span className="check">✓</span>
          <span style={{ fontWeight: 500 }}>{file.name}</span>
          <span style={{ color: "var(--muted)", fontSize: "0.8rem", marginLeft: "auto" }}>
            {(file.size / 1024).toFixed(0)} KB
          </span>
        </div>
      )}
    </div>
  );
}
